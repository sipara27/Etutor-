from django.urls import path
from .views import FileCreateListView, FileDetailUpdateView

urlpatterns = [
    path("", FileCreateListView.as_view(), name='file_list'),
    path("<uuid:pk>", FileDetailUpdateView.as_view(), name='file_detail'),
]
