from commons.utils.enums import CONTENT_TYPE, PROGRESS_STATUS
from applications.content.models import Content
from commons.utils.enums import COURSE_STATUS
from applications.course_progress.serializers import  UserCourseProgress, UserChapterProgress, UserContentProgress
from commons.utils.permissions import CustomPermission, ReadOnly, IsSystemAdminUser
from rest_framework import generics
from .models import Course, Course_Cart, Enrollement, InstructorShare, Reviewer
from .serializers import CourseReviewSerializer, CourseSerializer, CourseCartSerializer, EnrollementSerializer, InstructorShareSerializer,  EnrollementWriteSerializer, ContentPebSerializer, ChapterPebSerializer, QuestionPebSerializer
from applications.assignment.models import Questions
from rest_framework import filters
from rest_framework import serializers
from applications.chapters.models import Chapter
from rest_framework.response import Response
from rest_framework import status

from django.db.models import (
    Q, Avg, BooleanField, Count, Exists, ExpressionWrapper, F, FloatField,
    OuterRef, Prefetch, Subquery, Sum, Value,
)
from django.utils import timezone
from django.db.transaction import atomic
from commons.authentication.models import CustomUser, EducationalBackground


def course_queryset_with_relations():
    instructor_queryset = CustomUser.objects.select_related(
        "profile_pic"
    ).prefetch_related(
        "groups",
        Prefetch(
            "educational_background",
            queryset=EducationalBackground.objects.select_related(
                "document", "level_of_education"
            ),
        ),
    )
    return Course.objects.prefetch_related(
        "category",
        Prefetch("instructor", queryset=instructor_queryset),
    )

class CourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    serializer_class = CourseSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description','course_code']
    ordering_fields = ['name', 'description','course_code']
    queryset = course_queryset_with_relations()
    def get_queryset(self):
        params = self.request.query_params
        category_id = params.get("category_id")
        course_status = params.get("course_status")
        method = params.get("method")
        if category_id is not None:
            self.queryset = self.queryset.filter(category=category_id)
        if course_status is not None:
            self.queryset = self.queryset.filter(course_status = course_status)
        if method == "my_courses":
            self.queryset = self.queryset.filter(instructor = self.request.user)
        subQuery= Content.objects.filter(chapter__course = OuterRef("id")).values("chapter__course")
        user = self.request.user
        if user.is_authenticated:
            is_enrolled = Exists(
                Enrollement.objects.filter(
                    course_id=OuterRef("pk"), user_id=user.pk
                )
            )
        else:
            is_enrolled = Value(False, output_field=BooleanField())

        self.queryset = self.queryset.annotate(
            rating=Subquery(Reviewer.objects.filter(target = OuterRef("id")).values("target").annotate(rate =Avg("rating")).values("rate")), 
            chapters= Subquery(Chapter.objects.filter(course = OuterRef("id")).values("course").annotate(chapters = Count("id")).values("chapters")),
            contents= Subquery(subQuery.annotate(contents= Count("id")).values("contents")),
            durations=Subquery(subQuery.annotate(durations=Sum("duration")).values("durations")),
            enrolled_count_value=Count("enrollement_course", distinct=True),
            is_enrolled_value=is_enrolled,
            )
        return self.queryset
    


    def perform_create(self, serializer):
        user_id = self.request.user.id
        if serializer.is_valid:
            serializer.validated_data["course_status"] = COURSE_STATUS.DRAFT
            serializer.validated_data["instructor"] = [user_id]
            data = serializer.save()
            return Response(data.id, status=status.HTTP_201_CREATED)

def validateCourseContent(course):
    chapters = Chapter.objects.filter(course = course)
    if len(chapters) == 0:
        raise serializers.ValidationError("No content Prepared")
    chapters= chapters.filter(content_chapter__isnull = True)         
    contents = Content.objects.filter(chapter__course =  course, content_type = CONTENT_TYPE.QUESTION).filter(question_content__isnull=True)
    questions = Questions.objects.filter(content__chapter__course = course).filter(answer_question__isnull=True)
    invalid, data = False, None
    if len(chapters) or len(contents) or len(questions):
        invalid = True
        data = {
            "chap_no_cont": ChapterPebSerializer(chapters.order_by("chapter_number"), many=True).data,
            "cont_no_ques": ContentPebSerializer(contents.order_by("chapter__chapter_number"), many=True).data,
            "ques_no_ans": QuestionPebSerializer(questions.order_by("content__chapter__chapter_number", "content__content_number"), many=True).data,
            "invalid": invalid,
        }
    
    return invalid, data
    

class CourseDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [ReadOnly| CustomPermission]
    queryset = course_queryset_with_relations()
    serializer_class = CourseSerializer

    def get_object(self):
        instance = super().get_object()
        
        enrollemnt = UserCourseProgress.objects.filter(course = instance.id, user = self.request.user)
        instance.is_enrolled = enrollemnt.exists()
        contents = Content.objects.filter(chapter__course = instance.id)
        instance.durations = contents.aggregate(durations = Sum("duration"))["durations"]
        instance.contents = contents.count()
        instance.rating = Reviewer.objects.filter(target = instance.id).aggregate(avg = Avg("rating")).get("avg")
        instance.chapters = Chapter.objects.filter(course = instance.id).count()
        if enrollemnt.exists() and enrollemnt.first().last_chapter:
            instance.last_chapter = enrollemnt.first().last_chapter.id
            instance.last_content = enrollemnt.first().last_content.id
        return instance            

    def patch(self, request, *args, **kwargs):
        params = request.query_params
        obj = self.get_object()
        method = params.get("method")
        if method == "ready_to_publish":
            invalid, data = validateCourseContent(obj)
            if invalid:
                return Response(data=data, status=200)
            if obj.course_status != COURSE_STATUS.DRAFT:
                raise serializers.ValidationError("This Course is aleardy " + COURSE_STATUS(obj.course_status).name)
            request.data["course_status"] = COURSE_STATUS.READY_FOR_PUBLISHING
        return super().patch(request)
    

                

class CourseAdminDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSystemAdminUser]
    queryset = course_queryset_with_relations()
    serializer_class = CourseSerializer

    def patch(self, request, *args, **kwargs):
        params = request.query_params
        obj = self.get_object()
        method = params.get("method")
        if method == "publish":
            invalid, data = validateCourseContent(obj)
            if invalid:
                return Response(data=data, status=200)
            if obj.course_status == COURSE_STATUS.PUBLISHED:
                raise serializers.ValidationError("This Course is aleardy published")
            if obj.course_status == COURSE_STATUS.DRAFT:
                raise serializers.ValidationError("This Course is not ready to be published")
            request.data["course_status"] = COURSE_STATUS.PUBLISHED
        return super().patch(request)    
    
            

class CourseCartListCreateView(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    queryset = Course_Cart.objects.all()
    serializer_class = CourseCartSerializer


class CourseCartDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Course_Cart.objects.all()
    serializer_class = CourseCartSerializer


class EnrollementListCreateView(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    queryset = Enrollement.objects.all()
    # serializer_class = EnrollementSerializer

    def get_serializer_class(self):
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return EnrollementWriteSerializer
        return EnrollementSerializer
    
    def get_queryset(self):
        self.queryset = self.queryset.filter(user = self.request.user)
        return self.queryset
    
    def perform_create(self, serializer):
        course = serializer.validated_data.get("course")
        user = serializer.validated_data.get("user")
        if not self.request.user.is_superuser:
            user = self.request.user
 
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
                
                
                serializer.validated_data["user"] = user
                
                return super().perform_create(serializer)



class EnrollementDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Enrollement.objects.all()
    serializer_class = EnrollementSerializer


class ReviewerListCreateView(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = Reviewer.objects.all()
    serializer_class = CourseReviewSerializer
    
    def get(self, request, *args, **kwargs):
        params = self.request.query_params
        method = params.get("method")
        target = params.get("target")
        user = self.request.user
        if target is None:
            raise serializers.ValidationError("Target Missing")
        self.queryset = self.queryset.filter(target = target)
        if method == "ratings":
            # Calculate the average rating
            average_rating = self.queryset.aggregate(avg_rating=Avg('rating'))['avg_rating']

            # Calculate the distribution of ratings
            rating_distribution = (
                self.queryset.values('rating')
                .annotate(percent=ExpressionWrapper(Count('id') * 100.0 / self.queryset.count(), output_field=FloatField()))
                .order_by('-rating')
            )

            # Create the desired output format
            output = {
                'rating': round(average_rating or 0, 1),
                'target': target,
                'ratings': [
                    {'rate': item['rating'], 'percent': round(item['percent'], 1)} for item in rating_distribution
                ]
            }
            
            return Response(data={"results":output}, status=200)
        
        if method == "self":
            self.queryset = self.queryset.filter(reviewer=user)
        else:
            self.queryset = self.queryset.exclude(Q(reviewer=user) | Q(comment__isnull=True) | Q(comment__exact=''))
        
        return super().get(request, *args, **kwargs)
    
    def get_queryset(self):
        return self.queryset

    def perform_create(self, serializer):
        user = self.request.user
        serializer.validated_data["reviewer"] = user
        serializer.save()


class ReviewerDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Reviewer.objects.all()
    serializer_class = CourseReviewSerializer

    def perform_update(self, serializer):
        data = self.get_object()
        user = self.request.user
        response = serializer.validated_data.get("response")
        if  response is not None and response != data.response:
            serializer.validated_data["responsed_by"] = user
            serializer.validated_data["response_date"] = timezone.now()
        return super().perform_update(serializer)
    

class InstructorShareListCreateView(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    queryset = InstructorShare.objects.all()
    serializer_class = InstructorShareSerializer


class InstructorShareDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = InstructorShare.objects.all()
    serializer_class = InstructorShareSerializer
