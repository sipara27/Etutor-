
from rest_framework import serializers
from .models import UserChapterProgress, UserContentProgress, UserCourseProgress


class CourseProgressSerializer(serializers.ModelSerializer):
    progress = serializers.CharField(read_only=True)
    user_name = serializers.CharField(source="user.name")
    result = serializers.FloatField(read_only = True)
    class Meta:
        model = UserCourseProgress
        fields = '__all__'

class ChapterProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChapterProgress
        fields = ('id', 'chapter', 'user',
                  'chapter_progress_status')


class ContentProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserContentProgress
        fields = '__all__'
        