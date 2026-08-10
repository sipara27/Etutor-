from django.contrib import admin

from .models import Tutor, Location, TutorContract, AvailabiltyTime, Subject

# Register your models here.
admin.site.register(Tutor)
admin.site.register(Location)
admin.site.register(TutorContract)
admin.site.register(AvailabiltyTime)
admin.site.register(Subject)
