from uuid import UUID
from django.shortcuts import render
from requests import Response
from applications import assignment
from commons.utils.permissions import CustomPermission, ReadOnly, WriteOnly,PartialUpdateOnly
from rest_framework import generics, response, status
from .models import  Grade, Tutor, TutorContract, Subject
from applications.finance.models import Attendance
from .serializers import AttendanceSerializer, AvailabiltyTimeSerializer, GradeSerializer, TutorSerializer,LocationSerializer ,Location,AvailabiltyTime, TutorContractSerializer, SubjectSerializer
from rest_framework import filters, serializers
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import get_object_or_404
from commons.authentication.models import CustomUser, EducationalBackground, Experience
from commons.utils.enums import  ActionStatus, AdvertStatus, AvailablityTimeStatus, ContractStatus, AttendanceStatus
from commons.authentication.models import Group
from rest_framework.exceptions import ValidationError
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from commons.utils.paginations import CustomPagination
from applications.course.models import Reviewer
from django.db.models import (
    Avg, BooleanField, Count, Exists, OuterRef, Prefetch, Subquery, Sum, Value,
)
from commons.utils.exceptions import ObjectReferencedError
from django.db.models.deletion import ProtectedError


def tutor_queryset_with_relations(queryset=None):
    queryset = queryset if queryset is not None else Tutor.objects.all()
    return queryset.select_related(
        "tutor__profile_pic",
        "location__parent__parent",
    ).prefetch_related(
        "availabilty_times",
        "preferred_subject",
        "tutor_type",
        Prefetch(
            "tutor__user_experience",
            queryset=Experience.objects.all(),
        ),
        Prefetch(
            "tutor__educational_background",
            queryset=EducationalBackground.objects.select_related(
                "document", "level_of_education"
            ),
        ),
    )

# def get_tutors_with_ordered_subjects():
#     tutors = Tutor.objects.prefetch_related('preferred_subject')
#     for tutor in tutors:
#         # Order subjects using the 'through' model (assuming it's named 'TutorSubject')
#         ordered_subjects = tutor.preferred_subject.through.objects.filter(tutor=tutor).order_by('pk')
#         for data in ordered_subjects:
#             tutor.preferred_subject.add(data.subject_id) 
#     return tutors

class TutorListCreateView(generics.ListCreateAPIView):
    permission_classes = [ReadOnly|WriteOnly|CustomPermission]
    # queryset = get_tutors_with_ordered_subjects()
    queryset = tutor_queryset_with_relations()
    
    serializer_class = TutorSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["location__address", "location__parent__address","tutor__first_name","tutor__middle_name", 
                     "tutor__last_name","preferred_subject__subject_name", "nearest_location"]
    ordering_fields = ['availability_time','hourly_rate','location','average_rate_value', 'tutor_type']
    
    def get_queryset(self):
        params = self.request.query_params
        tutor_type = params.get("tutor_type")
        status = self.request.query_params.get("status")
        user_id = self.request.query_params.get("user_id")
        get_data = self.request.query_params.get("get_data")
        preferred_subject = self.request.query_params.get("preferred_subject")
        is_home = self.request.query_params.get("is_home")
        
        if not self.request.user.is_superuser and self.request.user.is_authenticated and not is_home:
            self.queryset = self.queryset.filter(tutor=self.request.user.id)
        if get_data != "get_data" and user_id:
                self.queryset = self.queryset.filter(tutor=user_id)
        if is_home:
            self.queryset = self.queryset.filter(is_active=True)
            if tutor_type is not None:
                self.queryset = self.queryset.filter(tutor_type=tutor_type)
            if status is not None:
                self.queryset = self.queryset.filter(status=status)
            if preferred_subject is not None:
                self.queryset = self.queryset.filter(preferred_subject=preferred_subject)
        else:   
            if tutor_type is not None:
                self.queryset = self.queryset.filter(tutor_type=tutor_type)
            if status is not None:
                self.queryset = self.queryset.filter(status=status)
            if preferred_subject is not None:
                self.queryset = self.queryset.filter(preferred_subject=preferred_subject) 
           
        
        review_subquery = Reviewer.objects.filter(target = OuterRef("id")).values("target")
        attendance_subquery = Attendance.objects.filter(tutor = OuterRef("id"), status=AttendanceStatus.ACCEPTED).values('tutor')
        
        user = self.request.user
        if user.is_authenticated:
            is_contracted = Exists(
                TutorContract.objects.filter(
                    user_id=user.pk, tutor_id=OuterRef("pk")
                )
            )
        else:
            is_contracted = Value(False, output_field=BooleanField())

        self.queryset = self.queryset.annotate(
            rating=Subquery(review_subquery.annotate(rate =Avg("rating")).values("rate")), 
            reviews=Subquery(review_subquery.annotate(reviews = Count("id")).values("reviews")),
            total_hour=Subquery(attendance_subquery.annotate(total_hour=Sum("total_daily_hour")).values("total_hour")),
            is_contracted_value=is_contracted,
            )
        return self.queryset

    def perform_create(self, serializer):
        with transaction.atomic():
            if not isinstance(self.request.user, AnonymousUser):    
                user = self.request.user
                serializer.validated_data["tutor"] = user
            availabilty_times = serializer.validated_data.pop("availabilty_times")
            
           
            with transaction.atomic():
                instance = serializer.save()
                instance.tutor.is_staff = True
                instance.tutor.save()
                if len(availabilty_times):
                    for time in availabilty_times:
                        if time['start_time'] >= time['end_time']:
                            raise serializers.ValidationError("End time must greater than start time.")
                        AvailabiltyTime.objects.create(**time, tutor=instance, user=self.request.user,status=AvailablityTimeStatus.ACTIVE)
                    return instance
    def patch(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class TutorDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [PartialUpdateOnly|ReadOnly|CustomPermission]
    queryset = tutor_queryset_with_relations()
    serializer_class = TutorSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        subQuery = Reviewer.objects.filter(target=OuterRef("id")).values("target")
        queryset = queryset.annotate(
            rating=Subquery(subQuery.annotate(rate=Avg("rating")).values("rate")),
            reviews=Subquery(subQuery.annotate(reviews=Count("id")).values("reviews")),
        )

        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.annotate(
                is_contracted_value=Exists(
                    TutorContract.objects.filter(
                        user_id=user.pk, tutor_id=OuterRef("pk")
                    )
                )
            )
        else:
            queryset = queryset.annotate(
                is_contracted_value=Value(False, output_field=BooleanField())
            )
        return queryset
    
    def get_object(self):
        queryset = self.get_queryset()
        obj = queryset.get(pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj
   


    
   
    
    def perform_update(self, serializer):
        serializer.validated_data['responder'] = self.request.user
        status = serializer.validated_data['status']
        user= self.queryset.filter(id=self.kwargs.get('pk')).first()
        

        if status == ActionStatus.APPROVED:
            oldTutor = Tutor.objects.filter(is_active=True, tutor=user.tutor).first()
            if oldTutor is not None:
                oldTutor.is_active = False
                oldTutor.save()         
            assignRole = Group.objects.get_or_create(name="Tutor")
            groups,*_ = assignRole
            with transaction.atomic():
                serializer.instance.tutor.groups.add(groups)
                serializer.validated_data['is_staff'] = True
                serializer.validated_data['is_active'] = True
                serializer.save()
        else:
            availabiltyTimes = serializer.validated_data.get('availabilty_times') and serializer.validated_data.pop("availabilty_times")
            if(availabiltyTimes is not None and len(availabiltyTimes) > 0):
                existing_ids = [at.get('id') for at in availabiltyTimes]  # Extract existing IDs
                with transaction.atomic():
                    instance = serializer.save()
                    availabiltyData = instance.availabilty_times.all() # Before new data is created <availabiltyData> will help us to delete existing
                    for data in availabiltyData:
                        if data.id not in existing_ids:
                            data.delete()
                    preferred_subject = instance.preferred_subject.all()
                    
                    for data in availabiltyTimes:
                        availabilityId = data.get('id')
                        if availabilityId is not None:
                            AvailabiltyTime.objects.filter(pk=availabilityId).update(**data)
                        else:
                            if data['start_time'] >= data['end_time']:
                                raise serializers.ValidationError("End time must greater than start time.")
                            current_data = AvailabiltyTime.objects.create(**data, tutor=instance)
            else:
                serializer.save()
    
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            raise ObjectReferencedError('This tutor has associated contracts and cannot be deleted.')
        return response.Response("", status=status.HTTP_204_NO_CONTENT)
    
class LocationList(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['address']
    
    def get_queryset(self):
        location_type = self.request.query_params.get("location_type")
        parent = self.request.query_params.get("parent")
        if location_type is not None:
            self.queryset = self.queryset.filter(location_type = location_type)
        if parent is not None:
            self.queryset = self.queryset.filter(parent = parent)
        return self.queryset
    
class LocationDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
        
class TutorContractListCreateView(generics.ListCreateAPIView):
    # permission_classes = [CustomPermission]
    queryset = TutorContract.objects.all()
    serializer_class = TutorContractSerializer
    pagination_class = CustomPagination 
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tutor__tutor__first_name','tutor__tutor__last_name','tutor__tutor__middle_name', 'user__first_name','user__last_name',
                     'user__middle_name', 'student_subject', 'student_level', 'student_location']
    
    def get_queryset(self):
        student = self.request.query_params.get("user_id")
        status = self.request.query_params.get("status")
        id = self.request.query_params.get("tutor_contract")
        current_user = self.request.user
        
        if not current_user.is_superuser:
            tutor = Tutor.objects.filter(tutor = current_user,is_active=True, status = ActionStatus.APPROVED).first()
            
            if tutor is not None:
                self.queryset = self.queryset.select_related('tutor__tutor').filter(tutor__tutor_id=tutor.tutor.id)
                # print(dict(self.queryset))
                # self.queryset = self.queryset.filter(Q(user=current_user) | Q(tutor=tutor))
            else:
                self.queryset = self.queryset.filter(user = current_user)
        if status is not None:
            self.queryset = self.queryset.filter(status = status)
        if id is not None:
            self.queryset = self.queryset.filter(id = id)
            
        return self.queryset

    def perform_create(self, serializer):
        # Get the current user from the request
        user = self.request.user        
        tutor = serializer.validated_data['tutor']
        if user == tutor:
            raise serializers.ValidationError("You can not contact your self")
        existing_instance = TutorContract.objects.filter(user=user, tutor=tutor).exclude(status = ContractStatus.TERMINATED).first()
        if existing_instance:
            raise ValidationError("An instance with the same user and tutor already exists.")

        serializer.validated_data["user"] = user
        contract_availabilty_times = serializer.validated_data.pop("contract_availabilty_times")
        if len(contract_availabilty_times):
            with transaction.atomic():
                instance = serializer.save()
                tutor_instance = Tutor.objects.filter(pk=tutor.id).first()
                for availabiltyTime in contract_availabilty_times:
                    AvailabiltyTime.objects.create(**availabiltyTime, tutor_contract=instance)
                return instance


class TutorContractDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = TutorContract.objects.all()
    serializer_class = TutorContractSerializer
    
    def get(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        if not (user.is_superuser or user in [instance.tutor.tutor, instance.user]):
            raise serializers.ValidationError("You canot read this Tutor Conract")
        
        return super().get(request, *args, **kwargs)
    
    def perform_update(self, serializer):
        validated_data = serializer.validated_data
        contract_availabilty_times = validated_data.get('contract_availabilty_times') and serializer.validated_data.pop("contract_availabilty_times")        
        if contract_availabilty_times is not None and len(contract_availabilty_times):
            with transaction.atomic():
                for availabiltyTime in contract_availabilty_times:
                    availabiltyTime['tutor_contract'] = self.get_object()
                    AvailabiltyTime.objects.update_or_create(id=availabiltyTime.get('id'), defaults={**availabiltyTime})
        return super().perform_update(serializer)
    
class AttendanceList(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    
    def post(self, request, *args, **kwargs):
        data = request.data
        data._mutable = True
        user = request.user
        if data['starting_hour'] >= data['ending_hour']:
            raise serializers.ValidationError("Please add valid date ")
        tutor = Tutor.objects.filter(tutor = user, status = ActionStatus.APPROVED).first()
        tutor_contract_request = data['tutor_contract_request']
        if tutor is None:
            raise serializers.ValidationError("You are not instructor")
        if tutor_contract_request is None or tutor_contract_request == '':
            contracts = TutorContract.objects.filter(user=data['student'], tutor=tutor).first()
            if contracts is None:
                raise serializers.ValidationError("Please select valid student")
            if contract.status != ContractStatus.ACCEPTED:
                raise serializers.ValidationError("The contract is not accepted")
            data['tutor_contract_request'] = contracts.id
        else:
            contract = TutorContract.objects.filter(id=tutor_contract_request).first()
            if contract.tutor != tutor:
                raise serializers.ValidationError("Please select your contract")
            if contract.user.id != data["student"]:
                raise serializers.ValidationError("Please select valid student")
            if contract.status != ContractStatus.ACCEPTED:
                raise serializers.ValidationError("The contract is not accepted")
        serializer = AttendanceSerializer(data=data)
        if serializer.is_valid():
            data = serializer.save()
            return response.Response("", status=status.HTTP_201_CREATED)
            
    def get_queryset(self):
        params = self.request.query_params
        student = params.get("student")
        status = params.get("status")
        start_date = params.get("start_date")
        tutor_contract = params.get("tutor_contract")
        end_date = params.get("end_date")
        method = params.get("method")
        current_user = self.request.user
        # if tutor is not None:
        #     self.queryset = self.queryset.filter(tutor=tutor)
        # elif not current_user.is_superuser:
        #     student = current_user
        if tutor_contract is not None:
            contract = TutorContract.objects.get(id=tutor_contract)
            if(not current_user.is_superuser):
                if(current_user != contract.tutor.tutor and current_user != contract.user):
                    raise serializers.ValidationError("You canot read this Attendance")
            self.queryset = self.queryset.filter(tutor_contract_request = tutor_contract)
        else:
            self.queryset = self.queryset.filter(Q(tutor__tutor = current_user) | Q(student = current_user))
        if student is not None:
            self.queryset = self.queryset.filter(student = student)
        if status is not None:
            self.queryset = self.queryset.filter(parent = status)
        if start_date is not None:
            self.queryset = self.queryset.filter(starting_hour__gte = start_date)
        if end_date is not None:
            self.queryset = self.queryset.filter(starting_hour__lte = end_date)
        if method == 'generate_payment':
            self.queryset = self.queryset.filter(is_paid = False, status__in =[AttendanceStatus.ACCEPTED, AttendanceStatus.SUBMITTED], student=current_user )
        
        return self.queryset
    
class AttendanceDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    
    def perform_destroy(self, instance):
        if instance.status != AttendanceStatus.SUBMITTED:
            raise serializers.ValidationError("You can not delete responed attendance")
        return super().perform_destroy(instance)
    
    def put(self, request, pk, *args, **kwargs):
        status = request.data['status']
        user = request.user
        attendance = Attendance.objects.get(id=pk)
        request.data['tutor_contract_request'] = attendance.tutor_contract_request.id
        request.data['tutor'] = attendance.tutor.id
        request.data['student'] = attendance.student.id
        request.data['is_paid'] = attendance.is_paid
        tutor_contract = TutorContract.objects.get(id=attendance.tutor_contract_request.id)
        if request.data['starting_hour'] >= request.data['ending_hour']:
            raise serializers.ValidationError("Please add valid date ")
        if(status == AttendanceStatus.ACCEPTED or status == AttendanceStatus.REJECTED):
            if(tutor_contract.user != user):
                raise serializers.ValidationError("You canot response on this attendance")
        if(status == AttendanceStatus.SUBMITTED and attendance.status != AttendanceStatus.SUBMITTED):
            raise serializers.ValidationError("You canot submit this attendance")
        if(status == AttendanceStatus.RESUBMITTED and attendance.status != AttendanceStatus.REJECTED and attendance.status != AttendanceStatus.RESUBMITTED):
            raise serializers.ValidationError("You canot resubmit this attendance")
        return super().put(request, *args, **kwargs)
        

class SubjectList(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = [filters.SearchFilter]
    
class SubjectDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class AvailabiltyTimeList(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = AvailabiltyTime.objects.all()
    serializer_class = AvailabiltyTimeSerializer
    filter_backends = [filters.SearchFilter]
    

    def perform_create(self, serializer):
        # Get the current user from the request
        start_time = self.request.data.get('start_time')
        end_time = self.request.data.get('end_time')
        if start_time >= end_time:
            raise serializers.ValidationError("End time must greater than start time.")
        serializer.save(user=self.request.user,status=AvailablityTimeStatus.ACTIVE) 
    
    def get_queryset(self):
        isHome = self.request.query_params.get("isHome")
        user = self.request.query_params.get("user")
        if self.request.user.is_superuser is False and not isHome:
            self.queryset = self.queryset.filter(user=self.request.user)
        if isHome and user:
            self.queryset = self.queryset.filter(user=user, status=AdvertStatus.ACTIVE)
        return self.queryset

    
class AvailabiltyTimeDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = AvailabiltyTime.objects.all()
    serializer_class = AvailabiltyTimeSerializer


class GradeList(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    filter_backends = [filters.SearchFilter]
    
class GradeDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
