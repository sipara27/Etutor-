from applications.category.models import Category
from applications.content.models import Content
from applications.course_progress.models import UserContentProgress
from commons.authentication.models import CustomUser
from commons.authentication.serializer import UserDetailSerializer
from rest_framework import serializers
from .models import Course, Course_Cart, Enrollement, InstructorShare, Reviewer, User
from applications.chapters.serializers import ChapterSerializerForSideBar
from django.db.models import Count, OuterRef, F
# from applications.course_progress.serializers import 
from applications.chapters.serializers import ChapterSerializer, ContentSerializer
from commons.utils.enums import CONTENT_TYPE
from applications.assignment.serializers import QuestionsSerializer
from applications.chapters.models import Chapter
from applications.content.models import Content
from applications.assignment.models import Questions


class CourseSerializer(serializers.ModelSerializer):
    instructor = UserDetailSerializer(many=True, read_only=True)
    category = serializers.SlugRelatedField(
        queryset=Category.objects.all(), many=True, slug_field='id')
    enrolled_count = serializers.SerializerMethodField(read_only=True)
    is_enrolled = serializers.SerializerMethodField(read_only=True)
    last_chapter = serializers.CharField(read_only=True)
    last_content = serializers.CharField(read_only = True)
    rating = serializers.CharField(read_only =True)
    contents = serializers.CharField(read_only =True)
    chapters = serializers.CharField(read_only =True)
    category_names = serializers.SerializerMethodField(read_only=True)
    durations = serializers.CharField(read_only =True)

    class Meta:
        model = Course
        fields = ('id', 'enrolled_count', 'is_enrolled', 'name', 'course_price',
                  'last_chapter', 'last_content', 'instructor', 'course_code', 'course_image', 'category','category_names', 
                  'course_type', 'course_level', 'course_status', 'description','rating', "chapters", "contents","durations")

    def get_category_names(self, course_instance):
        return [
            category.category_name
            for category in course_instance.category.all()
        ]

    def get_enrolled_count(self, course_instance):
        if hasattr(course_instance, "enrolled_count_value"):
            return course_instance.enrolled_count_value
        return course_instance.enrolled_count
        
    def get_is_enrolled(self, course_instance):
        if hasattr(course_instance, "is_enrolled_value"):
            return course_instance.is_enrolled_value
        if hasattr(course_instance, "is_enrolled"):
            return course_instance.is_enrolled

        user = self.context['request'].user
        if not user.is_authenticated:
            return False
        return Enrollement.objects.filter(course=course_instance, user=user).exists()

class QuestionPebSerializer(serializers.ModelSerializer):
    chapter_name = serializers.CharField(source="content.chapter.chapter_name", read_only=True)
    content_title = serializers.CharField(source="content.title", read_only=True)
    class Meta:
        model = Questions
        fields = ["id", "question", "chapter_name","content_title"]
        
class ContentPebSerializer(serializers.ModelSerializer):
    chapter_name = serializers.CharField(source="chapter.chapter_name", read_only=True)
    
    class Meta:
        model = Content
        fields = ("id","chapter_name", "title")
    

class ChapterPebSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Chapter
        fields = ["id", "chapter_name" ]
       


class CourseCartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course_Cart
        fields = '__all__'


class CourseEnrollementSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField(read_only=True)
    rating = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'
        
    def get_rating(self, obj):
        user = self.context.get("request").user 
        rating = Reviewer.objects.filter(reviewer=user, target=obj.id).first()
        return rating and rating.rating
        
    def get_progress(self, obj):
        user = self.context.get("request").user 
        count_content =  Content.objects.filter(chapter__course = obj).count()
        count_user_progress = UserContentProgress.objects.filter(content__chapter__course =obj, user=user).count()
        
        return round(count_user_progress * 100 / count_content, 2)
           

class EnrollementSerializer(serializers.ModelSerializer):
    course = CourseEnrollementSerializer()
    class Meta:
        model = Enrollement
        fields = ['course', 'user']
    
class EnrollementWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollement
        fields = ['course']


class CourseReviewSerializer(serializers.ModelSerializer):
    # reviewer = serializers.UUIDField(read_only=True)
    reviewer_name = serializers.CharField(source="reviewer.name", read_only=True)
    review_date = serializers.CharField(source="create_date", read_only=True)
    responsed_by_name = serializers.CharField(source="responsed_by.name", read_only=True)
    profile_pic = serializers.CharField(source="reviewer.profile_pic", read_only=True)
    class Meta:
        model = Reviewer
        verbose_name = 'Reviewer'
        verbose_name_plural = 'Reviewers'
        fields = "__all__"



# class CoursePriceSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CoursePrice
#         verbose_name = 'CoursePrice'
#         verbose_name_plural = 'CoursePrices'
#         fields = ('id', 'price', 'instructor_price')


class InstructorShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorShare
        db_table = ''
        managed = True
        verbose_name = 'InstructorShare'
        verbose_name_plural = 'InstructorShares'
        fields = ('id', 'min_price', 'share_percent')
