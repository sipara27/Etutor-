from django.contrib import admin
from .models import Content

# Register your models here.


class ContentAdmin(admin.ModelAdmin):
    list_display = ('chapter', 'title',
                    'description', 'url', 'creator', 'content_type')


admin.site.register(Content, ContentAdmin)
