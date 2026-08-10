from django.contrib import admin
from .models import UserChapterProgress, UserContentProgress, UserCourseProgress
# Register your models here.


class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ('course', 'user', 'course_progress_status')


class ChapterProgressAdmin(admin.ModelAdmin):
    list_display = ('chapter', 'user', 'chapter_progress_status')


class ContentProgressAdmin(admin.ModelAdmin):
    list_display = ('content', 'user', 'content_progress_status')


admin.site.register(UserCourseProgress, CourseProgressAdmin)
admin.site.register(UserChapterProgress, ChapterProgressAdmin)
admin.site.register(UserContentProgress, ContentProgressAdmin)
