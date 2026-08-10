import json

from django.http import JsonResponse
from applications.content.serializer import ContentSerializer
from applications.course.models import Course
from commons.utils.enums import CONTENT_TYPE, PROGRESS_STATUS
from applications.chapters.serializers import ChapterSerializer
from applications.chapters.models import Chapter
from applications.content.models import Content
from rest_framework import generics
from applications.course_progress.models import UserChapterProgress, UserContentProgress, UserCourseProgress
from applications.assignment.models import UserQuizeResults
from commons.utils.permissions import CustomPermission
from applications.course_progress.serializers import ChapterProgressSerializer, ContentProgressSerializer, CourseProgressSerializer
from rest_framework.response import Response
from rest_framework import serializers, status
from django.db.transaction import atomic
from django.db.models import Count, F, OuterRef, Subquery, IntegerField, Max, Avg, ExpressionWrapper, FloatField


class CourseProgressDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = UserCourseProgress.objects.all()
    serializer_class = CourseProgressSerializer


class CourseProgressListCreateView(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    queryset = UserCourseProgress.objects.all()
    serializer_class = CourseProgressSerializer

    def get_queryset(self):
        params = self.request.query_params
        course = params.get("course")
        method = params.get("method")
        if course is not None:
            self.queryset = self.queryset.filter(course=course)
            if method == "user_course_progress":
                all_content = Content.objects.filter(
                    chapter__course=course).count()
                content = UserContentProgress.objects.filter(content__chapter__course=course, user=OuterRef("user")).prefetch_related(
                    'content__chapter', 'content__chapter__course').values("user").annotate(count=Count("id")).values("count")
                best_quize_result_user_id = UserQuizeResults.objects.filter(content=OuterRef(
                    "content"), user=OuterRef("user")).order_by("-result").values("id")[:1]
                avg_result = UserQuizeResults.objects.filter(content__chapter__course=OuterRef("course"), user=OuterRef("user")).filter(id=Subquery(best_quize_result_user_id)).annotate(
                    percent=F("result") * 100 / F("total")).values("user", "content__chapter__course").annotate(results=Avg("percent")).values("results")
                self.queryset = self.queryset.annotate(prog=Subquery(content, output_field=IntegerField(
                ))).annotate(progress=(F("prog") * 100 / all_content), result=Subquery(avg_result))
        return self.queryset


class ChapterProgressDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = UserChapterProgress.objects.all()
    serializer_class = ChapterProgressSerializer


class ChapterProgressListCreateView(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    queryset = UserChapterProgress.objects.all()
    serializer_class = ChapterProgressSerializer


class ContentProgressListCreateView(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    queryset = UserContentProgress.objects.all()
    serializer_class = ContentProgressSerializer


class ContentProgressDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = UserContentProgress.objects.all()
    serializer_class = ContentProgressSerializer

    # It should be based on requestee user
    def get_queryset(self):
        user = self.request.user
        data = UserContentProgress.objects.all()
        return data

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        current_content = serializer.validated_data.get("content")
        if current_content is None:
            raise serializers.ValidationError("missing content")
        user = self.request.user
        current_chapter = current_content.chapter
        current_course = current_chapter.course
        user_course_progress = UserCourseProgress.objects.get(
            course=current_course, user=user)
        last_content = user_course_progress.last_content
        if last_content == current_content:
            if current_content.content_type != CONTENT_TYPE.QUESTION or UserQuizeResults.objects.filter(is_passed=True, content=current_content, user=user).exists():
                next_content = Content.objects.filter(
                    chapter=current_chapter, content_number__gt=current_content.content_number).order_by("content_number").first()

                with atomic():
                    if next_content is not None:
                        UserContentProgress.objects.create(
                            content=next_content, content_progress_status=PROGRESS_STATUS.STARTED, user=user)
                        user_course_progress.last_content = next_content
                    else:
                        next_chapter = Chapter.objects.filter(
                            course=current_course, chapter_number__gt=current_chapter.chapter_number).order_by("chapter_number").first()
                        if next_chapter is not None:
                            next_content = Content.objects.filter(
                                chapter=next_chapter).order_by("content_number").first()
                            if next_content is not None:
                                UserChapterProgress.objects.create(
                                    chapter=next_chapter, user=user, chapter_progress_status=PROGRESS_STATUS.STARTED)
                                UserContentProgress.objects.create(
                                    content=next_content, content_progress_status=PROGRESS_STATUS.STARTED, user=user)
                                user_course_progress.last_chapter = next_chapter
                                user_course_progress.last_content = next_content
                        else:
                            user_course_progress.course_progress_status = PROGRESS_STATUS.FINISHED
                    user_course_progress.save()
                    serializer.validated_data["content_progress_status"] = PROGRESS_STATUS.FINISHED
                    return super().perform_update(serializer)
