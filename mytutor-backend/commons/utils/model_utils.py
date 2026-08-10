import uuid
from django.db import models

class CommonsModel(models.Model):
    id = models.UUIDField(primary_key=True, unique=True,default=uuid.uuid4, editable=False)
    create_date = models.DateTimeField(auto_now_add = True)
    update_date = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
    