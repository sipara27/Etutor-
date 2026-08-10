from django.shortcuts import render


from commons.utils.permissions import CustomPermission, ReadOnly

from rest_framework import generics
from .models import Advert
from .serializers import AdvertSerializer
from rest_framework import filters
from django.db import transaction
from django.utils import timezone
from commons.utils.enums import  Days, LocationType, AdvertPosition,AdvertStatus

class AdvertListCreateView(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = Advert.objects.all()
    serializer_class = AdvertSerializer
    search_fields = ['end_time','start_time','position']
    ordering_fields = ['link','start_time','end_time','image_url','video_url']
  
    def get_queryset(self):
        params = self.request.query_params
        position = params.get("position")
        isHomepage = params.get("is_homepage")
        if position  is not None:
            self.queryset = self.queryset.filter(position = position)
        if isHomepage == "true":
            self.queryset = self.queryset.filter(status = AdvertStatus.ACTIVE)
            date = timezone.now()
            self.queryset = self.queryset.filter(start_time__lte = date, end_time__gte = date) 
        return self.queryset

  


    def perform_create(self, serializer):
        data = serializer.save()
        return data


class AdvertDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Advert.objects.all()
    serializer_class = AdvertSerializer


