import uuid
from django.db import models
from django.urls import reverse
from commons.authentication.models import CustomUser
from applications.chapters.models import Chapter
from commons.utils.enums import CONTENT_TYPE
from commons.utils.model_utils import CommonsModel
from django.conf import settings
from django.utils.translation import gettext_lazy as _

User = settings.AUTH_USER_MODEL
# Create your models here.


class Content(CommonsModel):
    chapter = models.ForeignKey(
        Chapter, null=True, related_name="content_chapter", on_delete=models.PROTECT)

    content_number = models.IntegerField()

    title = models.CharField(max_length=150)
    description = models.TextField(default="")
    url = models.URLField(
        max_length=1000, blank=True, null=True)
    creator = models.ForeignKey(
        User, null=True, on_delete=models.PROTECT, related_name="content_creator",)

    content_type = models.IntegerField(
        choices=CONTENT_TYPE.choices)
    duration = models.DurationField(_("Duration"), null=True)
    no_question = models.IntegerField(_("No Question"), null=True)
    passing_percent = models.FloatField(_("Passing Percent"), null=True)
    re_examination_waiting = models.DurationField(_("Re Examination waiting"), null=True)

    class Meta:
        ordering = ('content_number',)
        constraints = [
            models.UniqueConstraint(fields=[
                                    "content_number", "chapter"], name='content should be only in single chapter'),
        ]

    def __str__(self):
        return self.title

