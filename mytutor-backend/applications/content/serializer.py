from rest_framework import serializers
from .models import Content
from django.core.files.storage import default_storage
from commons.utils.enums import CONTENT_TYPE
from django.conf import settings
from django.core.validators import URLValidator
from django.core.files.base import File


class ContentSerializerForSidenav(serializers.ModelSerializer):
    progress_id = serializers.CharField(read_only= True)
    
    class Meta:
        model = Content
        fields = ['id', 'title', 'description', 'content_number',
                  'content_type', 
                  'chapter',
                  "duration",
                #   'user_content_progress', 
                  "progress_id"]
        # depth = 1 // to show the nested serializer json depth


class ContentSerializer(serializers.ModelSerializer):
    # question_content = QuestionsSerializer(many=True, read_only=True)
    progress_id = serializers.CharField(read_only = True)

    class Meta:
        model = Content
        fields = ('id', 'chapter', "duration", "re_examination_waiting", "passing_percent", "no_question", 'title', 'description', 'content_type', 'url',
                     'creator', 'update_date', "progress_id")

    def validate(self, attrs):
        content_type = attrs.get('content_type')
        if (content_type != CONTENT_TYPE.QUESTION):
            if attrs.get("url") is None:
                raise serializers.ValidationError("Please add url")
            validate = URLValidator()
            validate(attrs.get("url"))
        # elif (content_type != CONTENT_TYPE.QUESTION):
        #     file_field = attrs.get("file_field")
        #     print(file_field)
        #     if file_field is None:
        #         raise serializers.ValidationError("Please upload file")

        #     assert isinstance(file_field, File), (
        #         "please upload valid file"
        #     )

        return attrs

    def create(self, validated_data):
        content_type = validated_data.get("content_type")
        # file_field = validated_data.pop('file_field')
        if content_type == CONTENT_TYPE.QUESTION:
            url = None
        else:
            url = validated_data.get('url')
           
        chapter_id = validated_data.get('chapter')
        if chapter_id:
            last_content = Content.objects.filter(
                chapter=chapter_id).order_by("content_number").last()
            if last_content != None:
                content_number = last_content.content_number + 1
            else:
                content_number = 1
            validated_data["content_number"] = content_number
        else:
            raise serializers.ValidationError(
                ('chapter id is required'))

        if 'creator' not in validated_data or validated_data['creator'] is None:
            validated_data['creator'] = self.context.get("request").user

        validated_data['url'] = url
        return super().create(validated_data)

    def update(self, instance, validated_data):

        content_type = validated_data.get("content_type")
        # file_field = 'file_field' in validated_data and validated_data.pop('file_field')
        url = validated_data.get('url')
        if content_type == CONTENT_TYPE.QUESTION:
            url = None
        # elif content_type == CONTENT_TYPE.YOUTUBE_VIDEO:
        #     url = validated_data.get('url')
        # else:
        #     if content_type == CONTENT_TYPE.VIDEO:
        #         url = "course/course_video/"
        #     elif content_type == CONTENT_TYPE.DOCUMENT:
        #         url = "course/document/"
        #     elif content_type == CONTENT_TYPE.IMAGE:
        #         url = "course/image/"
        #     path = default_storage.save(url + file_field.name, file_field)
        #     url = default_storage.url(path)

        chapter_id = validated_data.get('chapter')
        if chapter_id is None:
            raise serializers.ValidationError(
                ('chapter id is required'))
        validated_data['url'] = url

        return super().update(instance, validated_data)
