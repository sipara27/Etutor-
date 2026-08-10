from rest_framework import serializers
from rest_framework import generics
from .models import File
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_text
from etutor_api.settings import get_backend_url, MEDIA_ROOT
import os

class FileListSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = '__all__'
    
    def get_file_url(self, obj):
        if obj and obj.url and obj.url.url:
            url = obj.url.name
            file_name = url.split('/')[-1]
            encoded_file_name = urlsafe_base64_encode(force_bytes(file_name))
            return  get_backend_url() + 'media/media/' + encoded_file_name
        else:
            raise serializers.ValidationError(('Url does not exist'))
            
    def get_file_name(self, obj):
        return obj and obj.url and obj.url.name.split('/')[-1]
    
    def get_file_size(self, obj):
        if obj and obj.url and obj.url.url:
            file_path = os.path.join(MEDIA_ROOT, 'media/'+obj.url.url.split('/')[-1])
            return os.path.getsize(file_path) if os.path.exists(file_path) else None 
        else:
            raise serializers.ValidationError(('Url does not exist'))
            
class FileCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = File
        fields = '__all__'

