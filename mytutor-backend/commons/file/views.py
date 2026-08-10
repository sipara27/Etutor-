from rest_framework import generics
from commons.utils.permissions import CustomPermission, ReadOnly, WriteOnly, PartialUpdateOnly, DeleteOnly
from .serializers import FileCreateSerializer, FileListSerializer
from .models import File
from django.shortcuts import render, get_object_or_404
from django.http import FileResponse
from django.core.files.storage import FileSystemStorage
import os
from etutor_api.settings import get_backend_url, MEDIA_ROOT
from rest_framework import serializers

class FileListView(generics.ListAPIView):
    serializer_class = FileListSerializer
    permission_classes = [ReadOnly|WriteOnly|CustomPermission]
    queryset = File.objects.all()
    
    def perform_create(self, serializer):
        data = serializer.validated_data
        serializer.save()
        
class FileCreateListView(generics.ListCreateAPIView):
    permission_classes = [ReadOnly|WriteOnly|CustomPermission]
    queryset = File.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FileCreateSerializer
        return FileListSerializer
    
    def perform_create(self, serializer):
        data = serializer.validated_data
        serializer.save()
        
class FileDetailUpdateView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [PartialUpdateOnly|ReadOnly|WriteOnly|DeleteOnly|CustomPermission]
    serializer_class = FileListSerializer
    queryset = File.objects.all()
    
    def perform_update(self, serializer):
        if self.get_object() and self.get_object().url and self.get_object().url.url:
            file_path = os.path.join(MEDIA_ROOT, 'media/'+self.get_object().url.url.split('/')[-1])
            fs = FileSystemStorage()
            if fs.exists(file_path):
                fs.delete(file_path)
            serializer.save()
        else:
            raise serializers.ValidationError(('Url does not exist'))
        
    def perform_destroy(self, instance):
        if instance and instance.url and instance.url.url:
            file_path = os.path.join(MEDIA_ROOT, 'media/'+instance.url.url.split('/')[-1])
            fs = FileSystemStorage()
            if fs.exists(file_path):
                fs.delete(file_path)
                instance.delete()
            else:
                raise serializers.ValidationError(('File doesnot exist'))
        else:
            raise serializers.ValidationError(('Url does not exist'))
            
