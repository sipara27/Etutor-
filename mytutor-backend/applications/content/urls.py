
from django.urls import path
from .views import ContentListCreateView, ContentDetail, SideNavContent,ContentAdminDetail

urlpatterns = [
    path("", ContentListCreateView.as_view(), name="content_list_create"),
    path("<uuid:pk>/", ContentDetail.as_view(),
         name="content_update"),
    path("admin/<uuid:pk>/", ContentAdminDetail.as_view(),
         name="content_update_admin"),
    path("sidenav/", SideNavContent.as_view(), name="sidenav_content"),
]
