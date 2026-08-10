from django.urls import path
from .views import BankDetail, BankListCreateView

urlpatterns = [
    path("", BankListCreateView.as_view(), name="bank_list_create"),
    path("<uuid:pk>/", BankDetail.as_view(),name="bank_update"),   
]
