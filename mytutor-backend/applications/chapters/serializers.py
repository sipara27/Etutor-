from applications.course_progress.serializers import ChapterProgressSerializer
from applications.content.serializer import ContentSerializer, ContentSerializerForSidenav
from rest_framework import serializers
from applications.chapters.models import Chapter
from rest_framework.validators import UniqueTogetherValidator


class ChapterSerializer(serializers.ModelSerializer):
    contents = serializers.CharField(read_only=True)
    durations = serializers.CharField(read_only=True)

    class Meta:
        model = Chapter
        fields = '__all__'
        validators = [
            UniqueTogetherValidator(
                queryset=Chapter.objects.all(),
                fields=['chapter_name', 'chapter_title',
                        'course', ]
            )
        ]


class ChapterSerializerForSideBar(serializers.ModelSerializer):
    progress_id = serializers.CharField(read_only=True)
    contents = serializers.FloatField(read_only=True)
    durations = serializers.CharField(read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'chapter_name', 'chapter_title',
                   'chapter_number', 'progress_id', "contents", "durations"]
        validators = [
            UniqueTogetherValidator(
                queryset=Chapter.objects.all(),
                fields=['chapter_name', 'chapter_title', 'course', ]
            )
        ]
