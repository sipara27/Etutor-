import uuid
from django.db import models
from django.urls import reverse
from commons.utils.enums import  Days, LocationType, AdvertPosition,AdvertStatus
from commons.utils.model_utils import CommonsModel
from django.conf import settings
from django.utils.translation import gettext_lazy as _

User = settings.AUTH_USER_MODEL

class Advert(CommonsModel):
    company_name=models.TextField()
    description=models.TextField()
    link=models.URLField()
    start_time=models.DateTimeField(_("start time"), auto_now=False, auto_now_add=False)
    end_time=models.DateTimeField(_("End Date"), auto_now=False, auto_now_add=False)
    image_url=models.URLField(max_length = 800 )
    video_url=models.URLField(max_length = 800, null=True, blank=True)
    position=models.IntegerField(choices=AdvertPosition.choices)
    status=models.IntegerField(choices=AdvertStatus.choices, default=AdvertStatus.INACTIVE)

    
    def __str__(self) -> str:
        return self.company_name
