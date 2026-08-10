from django.contrib import admin

# Register your models here.
from .models import Chapter


class ChapterAdmin(admin.ModelAdmin):
    list_display = ('chapter_name', 'chapter_title', 'chapter_number',
                    'course')


admin.site.register(Chapter, ChapterAdmin)
