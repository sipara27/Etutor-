from rest_framework import generics, serializers, filters
from commons.utils.permissions import CustomPermission
from applications.chapters.models import Chapter
from applications.content.models import Content
from applications.chapters.serializers import ChapterSerializer, ChapterSerializerForSideBar
from rest_framework import filters
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers
import math
from django.db import IntegrityError
from django.db.models import Subquery, OuterRef, Exists, Count, Sum
from applications.course_progress.models import UserChapterProgress


class DetailChapter(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer

    def perform_update(self, serializer, *args, **kwards):
        id = self.kwargs.get('pk')
        current_chapter = Chapter.objects.get(id=id)
        chapter_num = current_chapter.chapter_number
        if self.request.query_params.get('method') == "reorder":
            previous_chapter_id = self.request.query_params.get(
                'previous_chapter_id')
            if previous_chapter_id is not None:
                previous_chapter = Chapter.objects.get(id=previous_chapter_id)
                next_chapter = Chapter.objects.filter(
                    course_id=previous_chapter.course_id, chapter_number__gt=previous_chapter.chapter_number).order_by('chapter_number').first()
                if next_chapter is None:
                    chapter_num = math.floor(
                        previous_chapter.chapter_number) + 1
                elif current_chapter != next_chapter:
                    chapter_num = (previous_chapter.chapter_number +
                                   next_chapter.chapter_number)/2
        serializer.save(chapter_number=chapter_num)

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except IntegrityError as e:
            error_message = "There are contents inside this chapter, so you can't delete it."
            raise serializers.ValidationError(
                (error_message))


class ListChapter(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    serializer_class = ChapterSerializer
    queryset = Chapter.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ['chapter_name', 'Chapter_title']

    def get_queryset(self):
        course_id = self.request.GET.get("course_id")
        if course_id:
            self.queryset = self.queryset.filter(course = course_id)
        else:
            raise serializers.ValidationError(
                ('Please add course_id paremeter'))

        subQuery = Content.objects.filter(chapter =OuterRef("id")).values("chapter")
        self.queryset = self.queryset.annotate(
            contents =Subquery(subQuery.annotate(contents=Count("id")).values("contents")),
            durations = Subquery(subQuery.annotate(durations= Sum("duration")).values("durations"))
            )
    
        return self.queryset
    def perform_create(self, serializer):
        course_id = serializer.validated_data.get("course")
        if course_id:
            last_chapter = Chapter.objects.filter(
                course=course_id).order_by("chapter_number").last()
            if last_chapter != None:
                chapter_number = last_chapter.chapter_number + 1
            else:
                chapter_number = 1
            serializer.validated_data["chapter_number"] = chapter_number
            super().perform_create(serializer)



class ListChapterForSidBar(generics.ListAPIView):
    permission_classes = [CustomPermission]
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializerForSideBar
    
    
    def get_queryset(self):
        course_id = self.request.query_params.get("course_id")
        user = self.request.user
        if course_id is None:
            raise serializers.ValidationError("Course is Missing")
        subQuery = UserChapterProgress.objects.filter(user= user, chapter = OuterRef("id")).values("id")[:1]
        contents = Content.objects.filter(chapter =OuterRef("id")).values("chapter")
        self.queryset = self.queryset.filter(course = course_id).annotate(progress_id=Subquery(subQuery),
            contents =Subquery(contents.annotate(contents=Count("id")).values("contents")),
            durations = Subquery(contents.annotate(durations= Sum("duration")).values("durations")))
        return self.queryset
    