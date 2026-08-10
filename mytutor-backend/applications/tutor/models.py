import uuid
from django.db import models
from django.urls import reverse
from commons.utils.enums import AdvertStatus, AttendanceStatus, ContractStatus, TutorStatus,TutorType, Days, LocationType, ActionStatus
from commons.utils.model_utils import CommonsModel
from django.conf import settings
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from applications.category.models import Category
from commons.utils.common_functions import get_next_serial_number

User = settings.AUTH_USER_MODEL


class Location(CommonsModel):
    parent = models.ForeignKey("self", verbose_name=_("Parent"), on_delete=models.SET_NULL, null=True, blank=True)
    address = models.CharField(_("address"), max_length=150)
    location_type = models.IntegerField(_("Location Type"), choices=LocationType.choices)
    
    def __str__(self):
        return self.address
    

class Subject(CommonsModel):
    category = models.ManyToManyField(
        Category, related_name="subject_category")
    subject_name = models.CharField(max_length=150)
    description = models.TextField(default="")
    serial_number = models.IntegerField(unique=True, default=get_next_serial_number)

class Grade(CommonsModel):
    grade_name = models.CharField(max_length=150)
    description = models.TextField(default="")
   


class Tutor(CommonsModel):
    tutor = models.ForeignKey(User, verbose_name=_("Tutor"), on_delete=models.CASCADE, blank=True)
    hourly_rate=models.IntegerField()
    location = models.ForeignKey(Location, verbose_name=_("location"), on_delete=models.SET_NULL, null=True)
    introduction=models.TextField()
    tutor_type=models.ManyToManyField(Grade, related_name="tutor_grade")
    average_rate_value=models.FloatField(_("Average Rate Value"), default=0.0)
    no_of_review = models.IntegerField(_("No on Review"), default =0)
    status = models.IntegerField(choices=ActionStatus.choices, blank=True, null=True, default=ActionStatus.SUBMITTED)
    responder = models.ForeignKey(User, verbose_name=_("tutor_responder"),blank=True, null=True, related_name="tutor_request_responder", on_delete=models.CASCADE)
    comment = models.TextField(max_length=1500, blank=True, null=True)   
    request_date = models.DateTimeField(auto_now_add=True)
    nearest_location=models.CharField(_("Nearest Location"), max_length=150, default="")
    preferred_subject=models.ManyToManyField(Subject, related_name="tutor_subject")
    is_active=models.BooleanField(default=False)
   

    class Meta:
        db_table = "tutor"


class TutorContract(CommonsModel):
    tutor=models.ForeignKey(Tutor, null=True, on_delete=models.PROTECT, related_name="tutor_tutorcontract")
    user=models.ForeignKey(User, null=True, on_delete=models.PROTECT, related_name="user",)
    payment_date=models.DateTimeField(_("start_time"), auto_now=False, auto_now_add=False, default=None, null=True) 
    status=models.IntegerField(choices=ContractStatus.choices)
    last_payment_date = models.DateTimeField(_("Last Payment Date"), auto_now=False, auto_now_add=False, null=True)
    student_subject=models.TextField(blank=True)
    student_level=models.TextField(blank=True)
    student_location=models.TextField(blank=True)
    end_date=models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = "tutor_contract"
        
        
class AvailabiltyTime(CommonsModel):
    id = models.UUIDField(primary_key=True, unique=True,default=uuid.uuid4, editable=False)
    tutor = models.ForeignKey(Tutor, verbose_name=_("Tutor"), related_name="availabilty_times", on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey(User,verbose_name=_("User"), related_name="availabilty_times_user", on_delete=models.SET_NULL, null=True, blank=True)
    tutor_contract = models.ForeignKey(TutorContract, verbose_name=_("Tutor Contract"), related_name="contract_availabilty_times", on_delete=models.CASCADE, null=True, blank=True)
    start_time = models.TimeField(_("start time"), auto_now=False, auto_now_add=False)
    end_time = models.TimeField(_("End Date"), auto_now=False, auto_now_add=False)
    day = models.IntegerField(_("Day"), choices=Days.choices, null=True, blank=True)
    status=models.IntegerField(choices=AdvertStatus.choices, default=AdvertStatus.ACTIVE)
    
