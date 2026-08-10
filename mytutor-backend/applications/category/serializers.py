from applications.course.models import Course
from applications.course.serializers import CourseSerializer
from rest_framework import serializers
from applications.category.models import Category


class CategoryCourseSerializer(CourseSerializer):
    class Meta:
        model = Course
        fields = ('id', 'name', 'course_code',
                  'description', 'course_price', "pinned",)


class CategorySerializer(serializers.ModelSerializer):
    # course_category = CategoryCourseSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'category_name', 'description', 
                "pinned")
                # ,  'course_category'

    # def create(self, validated_data):
    #     instance = super().create(validated_data)
    #     print(instance.__dict__['id'])
    #     return instance
