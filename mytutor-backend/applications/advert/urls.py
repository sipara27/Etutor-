
from django.urls import path
from .views import AdvertListCreateView, AdvertDetail

urlpatterns = [
    path("", AdvertListCreateView.as_view(), name="advert_list_create"),
    path("<uuid:pk>/", AdvertDetail.as_view(),
         name="advert_update"),
     
]
