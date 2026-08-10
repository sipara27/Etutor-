
from rest_framework import serializers
from .models import Advert



class AdvertSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Advert
        fields = ('id', 'company_name', 'description','position',
                  'link','start_time','end_time','image_url','video_url','status') 
        

