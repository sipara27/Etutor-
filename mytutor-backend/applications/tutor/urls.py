
from django.urls import path
from .views import AttendanceDetail, AttendanceList, AvailabiltyTimeDetail, AvailabiltyTimeList, GradeDetail, GradeList, LocationDetail, TutorListCreateView, TutorDetail, LocationList, TutorContractListCreateView, \
TutorContractDetail, SubjectDetail, SubjectList

urlpatterns = [
    path("", TutorListCreateView.as_view(), name="tutor_list_create"),
    path("<uuid:pk>/", TutorDetail.as_view(),
         name="tutor_update"),
    path("location/", LocationList.as_view(), name="location_list"),
    path("location/<uuid:pk>/", LocationDetail.as_view(), name="location_list"),
    path("attendance/", AttendanceList.as_view(), name="attendance_list"),
    path("attendance/<uuid:pk>/", AttendanceDetail.as_view(), name="attendance_list"),
    path("tutor_contract/", TutorContractListCreateView.as_view(), name="contract_list_create"),
    path("tutor_contract/<uuid:pk>/", TutorContractDetail.as_view(),
         name="tutor_contract_update"),    
    path("subject/", SubjectList.as_view(), name="subject_list"),
    path("subject/<uuid:pk>/", SubjectDetail.as_view(), name="subject_list"),

    path("availabilty_times/", AvailabiltyTimeList.as_view(), name="availabilty_times_list"),
    path("availabilty_times/<uuid:pk>/", AvailabiltyTimeDetail.as_view(), name="availabilty_times_detail"),
    
    path("grade/", GradeList.as_view(), name="grade_list"),
    path("grade/<uuid:pk>/", GradeDetail.as_view(), name="grade_list"),

]
