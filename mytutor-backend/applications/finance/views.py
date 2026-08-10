from rest_framework import generics, serializers, response, filters
from .serializers import PaymentRequest, PaymentRequestSerializer, CoursePayment, CoursePaymentSerializer
from commons.utils.permissions import CustomPermission
from applications.tutor.models import TutorContract, ContractStatus, AttendanceStatus
from applications.finance.models import Attendance
from django.utils import timezone
from commons.utils.enums import PaymentStatus, PaymentType
from django.db.models import F, ExpressionWrapper, Q, fields, Sum
from django.db import transaction
from commons.utils.num_utils import multiply, divider
from applications.course_progress.serializers import  UserCourseProgress, UserChapterProgress, UserContentProgress
from applications.course.models import Enrollement
from django.db.transaction import atomic
from rest_framework import status
from rest_framework.response import Response
from applications.chapters.models import Chapter
from applications.content.models import Content
from commons.utils.enums import CONTENT_TYPE, PROGRESS_STATUS

def generatePaymentContract(contract: TutorContract):
    if Attendance.objects.filter(tutor_contract_request = contract.id, status = AttendanceStatus.SUBMITTED).exists():
        raise serializers.ValidationError("First, Please give response for submitted attendance")
    unpaidAttendance = Attendance.objects.filter(tutor_contract_request = contract.id, status=AttendanceStatus.ACCEPTED, is_paid=False, ending_hour__date__lte=timezone.now().date())
    attendance = unpaidAttendance.annotate(duration=ExpressionWrapper(F('ending_hour') - F('starting_hour'), output_field=fields.DurationField())).values("tutor_contract_request").annotate(total_duration= Sum(F("duration"))).values("total_duration")
    
    if len(attendance):
        with transaction.atomic():
            total_hour = round(divider(attendance[0]["total_duration"].total_seconds(), 3600), 2)
            amount = multiply(total_hour, contract.tutor.hourly_rate)            
            payment_request = PaymentRequest(student=contract.user, tutor_contract=contract, tutor=contract.tutor, hourly_rate=contract.tutor.hourly_rate, total_hour=total_hour, total_price=amount)
            
            contract.last_payment_date = timezone.now()
            
            payment_request.save()
            contract.save()
            unpaidAttendance.update(is_paid=True, payment_request = payment_request.id)
            return payment_request
                        
def generatePayment():
    date = timezone.now().date()
    all_contract = TutorContract.objects.filter(status = ContractStatus.ACCEPTED, payment_date__date__lt = date,payment_date__day=date.day).filter(Q(last_payment_date__isnull =True)|Q(last_payment_date__date__lt = date))
    
    for contract in all_contract:
        generatePaymentContract(contract)



class PaymentRequestList(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    serializer_class = PaymentRequestSerializer
    queryset = PaymentRequest.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["student__username", "tutor__tutor__username"]
    
    def get_queryset(self):
        tutor_contract = self.request.query_params.get("tutor_contract")
        status = self.request.query_params.get('status')
        if not self.request.user.is_superuser:
            student = self.request.user
            self.queryset = self.queryset.filter(student = student)
        return self.queryset
        if tutor_contract is not None:
            self.queryset = self.queryset.filter(tutor_contract = tutor_contract)
        if status is not None:
            self.queryset = self.queryset.filter(status = status)
            
        return self.queryset
    
    
    def patch(self, request, *args, **kwargs):
        methods = ["generate_payment"]
        method = request.query_params.get("method")
        if method not in methods:
            serializers.ValidationError("Missing Method")
            
        if method == "generate_payment":
            tutor_contract_id = request.data["tutor_contract"]
            if tutor_contract_id is not None:
                tutor_contract = TutorContract.objects.get(id=tutor_contract_id)
                if tutor_contract.user != request.user:
                    raise serializers.ValidationError("Only Student of this Contract can generate payment")
                payment_request = generatePaymentContract(tutor_contract)
                if payment_request is None:
                    raise serializers.ValidationError("No Attendance Approved To Generate Payment")
                return response.Response(data=PaymentRequestSerializer(payment_request).data, status=201)

class PaymentRequestDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    serializer_class = PaymentRequestSerializer
    queryset = PaymentRequest.objects.all()
    
    def put(self, request, *args, **kwargs):
        pass


    def patch(self, request, *args, **kwargs):
        method = request.query_params.get("method")
        methods = ["refund", "cancel", "cash", "add_receipt", "approve"]
        
        if method not in methods:
            raise serializers.ValidationError("Method is not allowed")
        instance = self.get_object()
        if method == "refund":
            if instance.status != PaymentStatus.PAID:
                raise serializers.ValidationError("Only Paid Item is refunded")
            
            serializer = self.get_serializer(instance, data={"status":PaymentStatus.REFENDED}, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return response.Response(serializer.data)
        
        elif method == "cash":
            if instance.status != PaymentStatus.NOT_PAID:
                raise serializers.ValidationError("Only Not Paid Item is Paid")
            
            serializer = self.get_serializer(instance, data={"status" : PaymentStatus.PAID, "approved_by":request.user.id, "payment_type": PaymentType.CASH}, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return response.Response(serializer.data)
        
        elif method == "approve":
            if instance.status != PaymentStatus.NEED_APPROVAL:
                raise serializers.ValidationError("Only receipt added payment are approved")
            
            serializer = self.get_serializer(instance, data={"status":PaymentStatus.PAID, "approved_by":request.user.id}, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return response.Response(serializer.data)
        
        elif method == "add_receipt":
            if instance.status != PaymentStatus.NOT_PAID and instance.status != PaymentStatus.NEED_APPROVAL:
                raise serializers.ValidationError("You can only add receipt on not paid payment")
            serializer = self.get_serializer(instance, data={"status": PaymentStatus.NEED_APPROVAL, "payment_type": PaymentType.BANK, "bank": request.data.get("bank"), "payment_receipt": request.data.get("payment_receipt"), "reference_no": request.data.get("reference_no")}, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return response.Response(serializer.data)

        elif method == "cancel":
            if instance.status != PaymentStatus.NOT_PAID:
                raise serializers.ValidationError("Only Paid Item is refunded")
            data = {"status", PaymentStatus.CANCLED}
            serializer = self.get_serializer(instance, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return response.Response(serializer.data)
        else:
            return serializers.ValidationError("You cannot Update Payment")

def enroll_user(course, user):

    if course is not None:
        enrollement = Enrollement.objects.filter(user=user, course=course)
        if enrollement.exists():
            raise serializers.ValidationError(
            ('Course is already enrolled'))
        with atomic():
            chapter = Chapter.objects.filter(course=course).order_by("chapter_number").first()
            content = Content.objects.filter(
                chapter_id=chapter).order_by("content_number").first()
            
            if chapter is None or content is None:
                raise serializers.ValidationError("The course has no content or/and chapter")
            
            # creating course progress
            UserCourseProgress.objects.create(course =course,user=user, course_progress_status = PROGRESS_STATUS.STARTED, last_chapter= chapter, last_content =content)
            
            # creating chapter progress
            UserChapterProgress.objects.create(chapter=chapter, user=user, chapter_progress_status= PROGRESS_STATUS.STARTED)
            
            # creating content progress
            UserContentProgress.objects.create(content= content, user = user, content_progress_status = PROGRESS_STATUS.STARTED)
            
            Enrollement.objects.create(user=user, course=course)
    
class CoursePaymentList(generics.ListCreateAPIView):
    serializer_class = CoursePaymentSerializer
    permission_classes = [CustomPermission, ]
    queryset = CoursePayment.objects.all()
    
    def get_queryset(self):

        if not self.request.user.is_superuser:
            student = self.request.user
            self.queryset = self.queryset.filter(student = student)
        return self.queryset
    
    def perform_create(self, serializer):
        
        if self.request.user.is_superuser:
            raise serializers.ValidationError("Hi Admin, Please register as student, you canot perform this action!")
        
        user = self.request.user
        course = serializer.validated_data["course"]
        serializer.validated_data["student"] = user
        
        with atomic():
            if course.course_price == 0.0 and course.course_type is True:
                raise serializers.ValidationError('The Course is Free')
            serializer.validated_data['total_price'] = course.course_price
            data = serializer.save()
            enroll_user(course, user)
            return Response(data, status=status.HTTP_201_CREATED)

class CoursePaymentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CoursePaymentSerializer
    permission_classes = [CustomPermission,]
    queryset = CoursePayment.objects.all()

    def patch(self, request, *args, **kwargs):
        method = request.query_params.get("method")
        methods = ["refund", "cancel", "cash", "add_receipt", "approve"]
        
        if method not in methods:
            raise serializers.ValidationError("Method is not allowed")
        instance = self.get_object()
        if method == "refund":
            if instance.status != PaymentStatus.PAID:
                raise serializers.ValidationError("Only Paid Item is refunded")
            
            serializer = self.get_serializer(instance, data={"status":PaymentStatus.REFENDED}, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return response.Response(serializer.data)
        
        elif method == "cash":
            if instance.status != PaymentStatus.NOT_PAID:
                raise serializers.ValidationError("Only Not Paid Item is Paid")
            
            serializer = self.get_serializer(instance, data={"status" : PaymentStatus.PAID, "approved_by":request.user.id, "payment_type": PaymentType.CASH}, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return response.Response(serializer.data)
        
        elif method == "approve":
            if instance.status != PaymentStatus.NEED_APPROVAL:
                raise serializers.ValidationError("Only receipt added payment are approved")
            
            serializer = self.get_serializer(instance, data={"status":PaymentStatus.PAID, "approved_by":request.user.id}, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return response.Response(serializer.data)
        
        elif method == "add_receipt":
            if instance.status != PaymentStatus.NOT_PAID and instance.status != PaymentStatus.NEED_APPROVAL:
                raise serializers.ValidationError("You can only add receipt on not paid payment")
            serializer = self.get_serializer(instance, data={"status": PaymentStatus.NEED_APPROVAL, "payment_type": PaymentType.BANK, "bank": request.data.get("bank"), "payment_receipt": request.data.get("payment_receipt"), "reference_no": request.data.get("reference_no")}, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return response.Response(serializer.data)

        elif method == "cancel":
            if instance.status != PaymentStatus.NOT_PAID:
                raise serializers.ValidationError("Only Paid Item is refunded")
            data = {"status", PaymentStatus.CANCLED}
            serializer = self.get_serializer(instance, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return response.Response(serializer.data)
        else:
            return serializers.ValidationError("You cannot Update Payment")
