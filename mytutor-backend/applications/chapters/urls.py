
from django.urls import path
from .views import DetailChapter, ListChapter, ListChapterForSidBar

urlpatterns = [
    path("", ListChapter.as_view(), name="chapter_list_create"),
    path("<uuid:pk>/", DetailChapter.as_view(), name='chapter_detail'),
    path("sidebar/", ListChapterForSidBar.as_view(), name='chapter_sidebar'),
]
