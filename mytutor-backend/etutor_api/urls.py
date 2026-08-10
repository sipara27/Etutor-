"""etutor_api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from django.conf import settings
from django.http import JsonResponse
from etutor_api.file_util import ProtectedFileHandlerView, securePdf


def api_root(request):
    return JsonResponse({
        "name": "MyTutor API",
        "status": "ok",
        "endpoints": {
            "swagger": request.build_absolute_uri("/api/schema/swagger-ui/"),
            "redoc": request.build_absolute_uri("/api/schema/redoc/"),
            "schema": request.build_absolute_uri("/api/schema/"),
            "admin": request.build_absolute_uri("/admin/"),
            "csrf": request.build_absolute_uri("/commons/csrf/"),
            "courses": request.build_absolute_uri("/applications/course/"),
            "categories": request.build_absolute_uri("/applications/category/"),
            "tutors": request.build_absolute_uri("/applications/tutor/"),
            "adverts": request.build_absolute_uri("/applications/adverts/"),
        },
    })


urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('commons/', include("commons.urls")),
    path('applications/', include("applications.urls")),
    path("media/media/<str:file>", ProtectedFileHandlerView.as_view(), name="media_file"),
    # path("media/media/<str:file>", securePdf, name="media_file"),
    

    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
