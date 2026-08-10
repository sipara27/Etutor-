from commons.authentication.models import CustomUser
import uuid
from django.db import models
from commons.utils.model_utils import CommonsModel
from commons.utils.custom_fields import EvenIntegerField
from django.urls import reverse
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from notifications.signals import notify
from django.conf import settings
# from commons.notification.signals import create_category_notification
class Category(CommonsModel):
    category_name = models.CharField(max_length=150)
    description = models.CharField(max_length=150)
    pinned = models.BooleanField(_("Pinned"), default=False)

    def get_absolute_url(self):
        return reverse("category-detail", kwargs={"pk": self.pk})

    def detail_url(self):
        return self.get_absolute_url()

    # class Meta:
    #     ordering = ('-pinned', 'category_name')

    def __str__(self) -> str:
        return self.category_name



# post_save.connect(
#     create_category_notification, sender=Category)
