from django.urls import path
from .views import PaymentRequestList, PaymentRequestDetail, CoursePaymentList, CoursePaymentDetail

urlpatterns = [
    path("", PaymentRequestList.as_view(), name="finance_list"),
    path("<uuid:pk>/", PaymentRequestDetail.as_view(), name="finance_detail"),
    path("course_payment/", CoursePaymentList.as_view(), name="course_payment_list"),
    path("course_payment/<uuid:pk>/", CoursePaymentDetail.as_view(), name="course_payment_detail"),
]
