from django.contrib import admin
from .models import Course, Enrollement

# Register your models here.


class CourseAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'course_code', 'course_image',
                    'description', 'course_price')

class EnrollAdmin(admin.ModelAdmin):
    list_display = ('user', 'course')

admin.site.register(Course, CourseAdmin)

admin.site.register(Enrollement, EnrollAdmin)
