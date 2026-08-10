from django.db import models
from commons.utils.model_utils import CommonsModel
from applications.content.models import Content
from applications.course.models import Course
from django.conf import settings
from django.urls import reverse
from django.core.exceptions import ValidationError
from commons.utils.enums import AnswerType
from django.utils.translation import gettext_lazy as _

User = settings.AUTH_USER_MODEL

# Create your models here.


class Questions(CommonsModel):
    content = models.ForeignKey(
        Content, related_name="question_content", on_delete=models.CASCADE)
    question = models.TextField()
    answer_type = models.IntegerField(_("Answer type"), choices=AnswerType.choices, default=AnswerType.SINGLE)

    def __str__(self):
        return self.question


class Options(CommonsModel):
    question = models.ForeignKey(
        Questions, related_name='options_questions', null=True, on_delete=models.CASCADE)
    value = models.TextField()

    def __str__(self):
        return self.value

    class Meta:
        ordering = (('create_date'),)

class Answers(CommonsModel):
    question = models.ForeignKey(
        Questions, related_name="answer_question", on_delete=models.CASCADE)
    answer = models.OneToOneField(
        Options, related_name="answer_option", on_delete=models.CASCADE)
    explanation = models.TextField(null=True, blank=True)
    
    def clean(self):
        # Ensure that the Option is related to the same Question
        if self.answer.question != self.question:
            raise ValidationError("The selected option is not associated with the same question as the answer.")
        
    def __str__(self):
        return self.answer


class UserAnswers(CommonsModel):
    question = models.ForeignKey(
        Questions, related_name="user_answer_question", on_delete=models.CASCADE)
    answer = models.ForeignKey(
        Options, related_name="user_answer_option", on_delete=models.CASCADE)
    user = models.ForeignKey(
        User, related_name="user_answer_user", on_delete=models.CASCADE)
    is_correct = models.BooleanField()
    index = models.IntegerField(_(""))
    

    def __str__(self):
        return self.user.first_name

class UserQuizeResults(CommonsModel):
    user = models.ForeignKey(
        User, related_name="user_quize_result_user", on_delete=models.CASCADE)
    content = models.ForeignKey(
        Content, related_name="user_quize_result_content", on_delete=models.CASCADE)
    result = models.FloatField()
    total = models.IntegerField("")
    is_passed = models.BooleanField()
    index = models.IntegerField(_("Index"),default=0)

    def __str__(self):
        return self.user


class Certificates(CommonsModel):
    user = models.ForeignKey(
        User, related_name="certeficate_user", on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name="certeficate_course", verbose_name=(
        "course"), on_delete=models.CASCADE)
    certificate_url = models.CharField(max_length=200)
    description = models.TextField()
    result = models.FloatField()

    def __str__(self):
        return f"{self.user} {self.course}"

    @property
    def certificate_date(self):
        return self.create_date

    def get_absolute_url(self):
        return reverse("certificate-detail", kwargs={"pk": self.id})

    @property
    def detail_url(self):
        return self.get_absolute_url()

    @property
    def username(self):
        return self.user.username
