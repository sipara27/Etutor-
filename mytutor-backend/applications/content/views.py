
from commons.utils.permissions import CustomPermission, IsSystemAdminUser
from rest_framework import generics
from applications.course_progress.models import UserContentProgress
from .serializer import ContentSerializer, ContentSerializerForSidenav
from rest_framework import filters, serializers
from django.db.models import  OuterRef,Subquery
from applications.course.views import  Content


class ContentListCreateView(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content_title']
    ordering_fields = ['content_title', 'content_description']

    def get_queryset(self):
        chapter_id = self.request.GET.get('chapter_id')
        if chapter_id is not None:
            return Content.objects.filter(chapter=chapter_id)
        else:
            if Content.objects.all().count() != 0:
                raise serializers.ValidationError(
                    ('Please add chapter id paremeter'))
            else:
                return self.queryset


class ContentDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    
    def get_object(self):
        instance = super().get_object()
        progress = UserContentProgress.objects.filter(user = self.request.user, content = instance.id).first()
        
        if self.request.method == "GET":
            if progress is None:
                raise serializers.ValidationError("You have no access")
            instance.progress_id = progress.id
        return instance

class ContentAdminDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSystemAdminUser]
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    
 
class SideNavContent(generics.ListAPIView):
    permission_classes = [CustomPermission]
    queryset = Content.objects.all()
    serializer_class = ContentSerializerForSidenav
    
    def get_queryset(self):
        user = self.request.user
        chapter_id = self.request.GET.get('chapter_id')
        if chapter_id is not None:
            subQuery = UserContentProgress.objects.filter(user= user, content = OuterRef("id")).values("id")[:1]
            self.queryset= self.queryset.filter(chapter=chapter_id).annotate(progress_id =Subquery(subQuery))
        
        return self.queryset