
from django.urls import path, re_path, include
from .views import CreateUserPermission, CustomStudentRegisterView,CustomInstructorRegisterView, EducationLevelDetail, EducationLevelList, ListUser, CustomUserManager, ListGroup, CustomConfirmEmailView, \
UserPermissionDetail,  GroupPermissionDetail, csrf_view, \
DetailGroup, ListUserPermission, ListGroupPermission,ExperienceListCreate,ExperienceRetrieveUpdateDestroy,DetailEducationalBackground, ListEducationalBackground, DetailEducationalBackground, \
LoginView, LogoutView, PasswordChangeView, UserDetail, ListContentType,telegram_auth, DetailContentType, GoogleLogin, FacebookLogin, GitHubLogin, PasswordResetView, \
PasswordResetConfirmView, ToBeInstructorRequestRetrieveUpdateDestroy, ToBeInstructorRequestListCreate, ExperienceTutorList, ListEducationalBackgroundTutor
from dj_rest_auth.registration.views import VerifyEmailView
from commons.utils.regex_utils import token_regex, uuid_regex, key_regex
urlpatterns = [
    path("instructor_registration/", CustomInstructorRegisterView.as_view()),
    path("csrf/", csrf_view),
    path("student_registration/", CustomStudentRegisterView.as_view()),
    path("users/", ListUser.as_view()),
    path('users/<uuid:pk>/', UserDetail.as_view()),
    path("groups/", ListGroup().as_view()),
    path('groups/<uuid:pk>/', DetailGroup.as_view()),
    path("user_permissions/", ListUserPermission.as_view()),
    path("user_permissions/<uuid:pk>/", UserPermissionDetail.as_view()),
    path("user_permissions_add/", CreateUserPermission.as_view()),
    path("group_permissions/", ListGroupPermission.as_view()),
    path("group_permissions/<uuid:pk>/", GroupPermissionDetail.as_view()),
    path("content_types/", ListContentType.as_view()),
    path("content_types/<int:pk>", DetailContentType.as_view()),
    path("create_manager/", CustomUserManager.as_view()),
    path("authorize/user/educational_background/",
         ListEducationalBackground.as_view(), name="list-educational-background"),
    path("authorize/user/educational_background_tutor/",
         ListEducationalBackgroundTutor.as_view(), name="list-educational-background-tutor"),
    path("authorize/user/educational_background/<uuid:pk>/",
         DetailEducationalBackground.as_view(), name="detail-educational-background"),
    path("authorize/user/tobe_instructor_request/", ToBeInstructorRequestListCreate.as_view(), name="list-toinstructorrequest"),
    path("authorize/user/tobe_instructor_request/<uuid:pk>/", ToBeInstructorRequestRetrieveUpdateDestroy.as_view(), name="detail-toinstructorrequest"),
    path("authorize/user/experience/", ExperienceListCreate.as_view(), name="list-experience"),
    path("authorize/user/experience_tutor/", ExperienceTutorList.as_view(), name="list-toinstructorrequest-tutor"),
    path("authorize/user/experience/<uuid:pk>/", ExperienceRetrieveUpdateDestroy.as_view(), name="detail-experience"),
    path('authorize/password/reset/', PasswordResetView.as_view(), name='rest_password_reset'),
    path('authorize/', include('dj_rest_auth.urls')),
        path("authorize/login/", LoginView.as_view(), name="rest_login"),
        path('authorize/logout/', LogoutView.as_view(), name='rest_logout'),
    path('authorize/google/', GoogleLogin.as_view(), name='socialaccount_signup'),
    path('authorize/facebook/', FacebookLogin.as_view(), name='fb_login'),
    path('authorize/github/', GitHubLogin.as_view(), name='github_login'),
    path('authorize/telegram-auth/', telegram_auth, name='telegram_login'),
    path('password/change/', PasswordChangeView.as_view(), name='rest_password_change'),
    path('account-confirm-email/<str:key>', CustomConfirmEmailView.as_view(), name='account_confirm_email'),

    re_path(r'^authorize/password/reset/confirm/(?P<uidb64>' + uuid_regex + ')/(?P<token>' +
            token_regex + ')/$', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
#     re_path(r'^account-confirm-email/(?P<key>' + key_regex + ')$',
#             VerifyEmailView.as_view(), name='account_confirm_email'),
#     re_path(r'^account-confirm-email/$', VerifyEmailView.as_view(),
#             name='account_email_verification_sent'),

path("education-level/", EducationLevelList.as_view(), name="education-level"),
path("education-level/<uuid:pk>/", EducationLevelDetail.as_view(), name="education-level"),

    
]
