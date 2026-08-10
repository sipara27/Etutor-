import uuid
from django.db import models
from applications.chapters.models import Chapter
from applications.content.models import Content
from django.urls import reverse
from applications.course.models import Course
from commons.utils.enums import PROGRESS_STATUS
from commons.utils.model_utils import CommonsModel
from django.conf import settings
from django.utils.translation import gettext_lazy as _


User = settings.AUTH_USER_MODEL


class UserCourseProgress(CommonsModel):
    course = models.ForeignKey(
        Course, on_delete=models.PROTECT, related_name='user_course_progress')
    user = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='course_progress_user')
    course_progress_status = models.IntegerField(
        choices=PROGRESS_STATUS.choices, default=PROGRESS_STATUS.STARTED)
    last_chapter = models.ForeignKey("chapters.Chapter", verbose_name=_("Last Chapter"), on_delete=models.SET_NULL, null=True)
    last_content = models.ForeignKey("content.Content", verbose_name=_("Last Content"), on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = "user_course_progress"
        # unique_together = ("course", "user")   

class UserChapterProgress(CommonsModel):

    chapter = models.ForeignKey(
        Chapter, on_delete=models.PROTECT, related_name='chapter_progress')
    user = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='chapter_progress_user')
    chapter_progress_status = models.IntegerField(
        choices=PROGRESS_STATUS.choices, default=PROGRESS_STATUS.STARTED)

    class Meta:
        unique_together = ("chapter", "user")   
        db_table = "user_chapter_progress"


class UserContentProgress(CommonsModel):

    content = models.ForeignKey(
        Content, on_delete=models.PROTECT, related_name='content_progress')
    user = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='content_progress_user', blank=True)
    content_progress_status = models.IntegerField(
        choices=PROGRESS_STATUS.choices, default=PROGRESS_STATUS.STARTED)

    class Meta:
        # unique_together = ("content", "user")   
        db_table = "user_content_progress"

