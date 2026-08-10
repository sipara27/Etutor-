from django.urls import path
from . import views

urlpatterns = [
    path("", views.ListQuestions.as_view(), name="question_list"),
    path("instructor/", views.ListInstructorQuestion.as_view(), name="instructor_question"),
    path("<uuid:pk>/", views.DetailQuestions.as_view(), name='questions-detail'),
    path("options/<uuid:pk>/", views.DetailOptions.as_view()),    
    path("options/", views.ListOptions.as_view()),
    path("answer/<uuid:pk>/", views.DetailAnswers.as_view(), name= 'answers_detail'),
    path("answer/", views.ListAnswers.as_view(),name='answers_list'),
    path("results/", views.ResultList.as_view(), name = "result_list"),
    path("user_result/",views.ResultUser.as_view(), name = "user_result"),
    path("user_answer/", views.ListUserAnswers.as_view() , name="user_answer_list"),
    path("user_answer/<uuid:id>/", views.DetailUserAnswers.as_view(), name="user_answer_detail"),
    path("certificate/", views.ListCertificates.as_view(), name = 'certificate-list'),
    path('certificate/<uuid:pk>/', views.DetailCertificates.as_view(), name = 'certificate-detail')
]
