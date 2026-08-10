import uuid
from django.db import models

from applications.course.models import Course
from django.urls import reverse
from commons.utils.model_utils import CommonsModel

# Create your models here.


class Chapter(CommonsModel):
    chapter_name = models.CharField(max_length=150)
    chapter_title = models.CharField(max_length=150)
    chapter_number = models.IntegerField(blank=True)
    course = models.ForeignKey(
        Course, on_delete=models.PROTECT, related_name='chapter_course', null=True)

    class Meta:
        ordering = ('chapter_number',)

    def __str__(self) -> str:
        return self.chapter_name

 