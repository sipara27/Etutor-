from django.db import models
from commons.utils.enums import File_TYPE, CONTENT_TYPE
from commons.utils.model_utils import CommonsModel
# Create your models here.

class File(CommonsModel):
    file_name = models.CharField(max_length=1000, blank=True, null=True)
    content_type = models.IntegerField(choices=CONTENT_TYPE.choices, blank=True, null=True)
    target =  models.UUIDField(blank=True,null=True)
    is_downloaded = models.BooleanField(default=False, blank=True, null=True)
    url = models.FileField(upload_to="media/",help_text="Enter valid file")
    file_type = models.IntegerField(choices=File_TYPE.choices, blank=True, null=True)

    def __str__(self):
        return dict(File_TYPE.choices).get(self.file_type)
    
    
