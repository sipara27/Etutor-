# from distutils.command.upload import upload
import uuid
from django.db import models
from applications.course.validations import Validations
from applications.category.models import Category
from commons.utils.enums import COURSE_LEVEL, COURSE_STATUS, COURSE_TYPE, CART_STATUS, RATING_VALUES, REVIEW_TYPE
from django.urls import reverse
from commons.utils.model_utils import CommonsModel
from django.conf import settings
from commons.authentication.models import CustomUser
User = settings.AUTH_USER_MODEL
from django.utils.translation import gettext_lazy as _

# class CoursePrice(CommonsModel):
#     id = models.CharField(primary_key=True, unique=True,
#                           default=uuid.uuid4, editable=False, max_length=36)
#     price = models.FloatField(
#         validators=[Validations.validate_price], default=0.0)
#     instructor_price = models.FloatField(
#         validators=[Validations.validate_price])


class Course(CommonsModel):
    def uploadFiles(instance, file_name):
        url = f"course/course_image/{instance}/{file_name}"
        return url

    name = models.CharField(max_length=150)
    course_code = models.CharField(max_length=150, null=True)
    course_image = models.URLField(max_length = 200)
    # (
    #     upload_to=uploadFiles, blank=True)
    course_price = models.FloatField(
        validators=[Validations.validate_price], default=0.0)
    instructor = models.ManyToManyField(
        User, related_name="course_instructor")
    category = models.ManyToManyField(
        Category, related_name="course_category")
    course_type = models.IntegerField(
        choices=COURSE_TYPE.choices)
    course_level = models.IntegerField(
        choices=COURSE_LEVEL.choices)
    course_status = models.IntegerField(
        choices=COURSE_STATUS.choices,blank=True, default=COURSE_STATUS.DRAFT)
    description = models.TextField(default="")

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name

    def created_at(self):
        return self.create_date

    @property
    def enrolled_count(self):
        return Enrollement.objects.filter(course=self.id).count()
    
class Course_Cart(CommonsModel):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='course_cart_user')
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, default=None, related_name="course_cart_course")
    status = models.IntegerField(
        choices=CART_STATUS.choices, default=CART_STATUS.ORDERED)

    def __str__(self):
        return self.user

class Enrollement(CommonsModel):

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='enrollement_user')
    course = models.ForeignKey(
        Course, null=True, on_delete=models.CASCADE, related_name="enrollement_course")

def generate_uuid():
    return uuid.uuid4()

class Reviewer(CommonsModel):
    reviewer = models.ForeignKey(
        User, on_delete=models.PROTECT, blank=True, editable=False, related_name='reviewer_user')
    # target = models.ForeignKey(
        # Course, on_delete=models.CASCADE, related_name='reviewer_course')
    
    target =  models.UUIDField(_("Target Id"))
    comment = models.TextField(max_length=500, null=True, blank=True)
    rating = models.IntegerField(choices=RATING_VALUES.choices)
    response = models.CharField(_("Response"), max_length=500, null=True)
    response_date = models.DateTimeField(_("Response Date"), auto_now=False, auto_now_add=False, null=True)
    responsed_by = models.ForeignKey(User, verbose_name=_("Resposed_by"), related_name="review_responsed_by", on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.comment


    class Meta:
        unique_together = ("reviewer", "target")

 
class InstructorShare(CommonsModel):
    min_price = models.FloatField(
        validators=[Validations.validate_price], default=0.0)
    share_percent = models.IntegerField()

    def __str__(self):
        return self.min_price
