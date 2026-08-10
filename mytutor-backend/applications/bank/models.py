from django.db import models
from commons.utils.model_utils import CommonsModel

# Create your models here.
class Bank(CommonsModel):
    bank_name = models.CharField(max_length=150)
    account_number = models.BigIntegerField()
    description=models.CharField(max_length=255)
    is_active = models.BooleanField(default= True)

    def __str__(self) -> str:
        return self.bank_name
