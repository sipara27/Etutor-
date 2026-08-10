from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import GenericAPIView
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import logout as django_logout
from dj_rest_auth.utils import jwt_encode
from dj_rest_auth.models import get_token_model
from dj_rest_auth.app_settings import (
    JWTSerializer, JWTSerializerWithExpiration, LoginSerializer, TokenSerializer,
    create_token,PasswordChangeSerializer
)
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.generics import GenericAPIView
from rest_framework import status
from django.views.decorators.debug import sensitive_post_parameters
from django.utils.translation import gettext_lazy as _
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.contrib.auth import login as django_login
from django.conf import settings
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import RegisterView
from rest_framework import generics
from rest_framework import filters
from django.contrib.contenttypes.models import ContentType
from allauth.account import app_settings as allauth_settings
from applications.tutor.models import Tutor
from commons.utils.paginations import CustomCursorPagination, CustomPagination
from .serializer import CustomRegisterSerializer,CustomSignUpRegistrationSerializer, EducationLevelSerializer,UserAddSerializer, UserPermissionAddSerializer, AdminRegisterSerializer, GroupSerializer, UserPermissionSerializer, EducationalBackgroundSerializer,ExperienceSerializer, UserDetailSerializer, ContentTypeSerializer, GroupPermissionSerializer,ToBeInstructorRequestSerializer, ExperienceTutorSerializer, EducationalBackgroundTutorSerializer
from .models import CustomUser, EducationLevel, Group, UserPermission, EducationalBackground, GroupPermission,Experience,ToBeInstructorRequest
from ..utils.permissions import IsSystemAdminUser, CustomPermission, WriteOnly, ReadOnly, IsSelf
from ..utils.enums import ActionStatus
from etutor_api.settings import get_frontend_url
from dj_rest_auth.serializers import PasswordResetSerializer, PasswordResetConfirmSerializer
from ..utils.email_utils import send_email_confirm_password_reset_link,send_password_reset_link, create_email_confirmation, send
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import redirect
from allauth.account.models import  EmailAddress
from django.db import transaction
from allauth.account.views import ConfirmEmailView
from django.contrib.auth import login
from commons.file.models import File
from etutor_api.settings import MEDIA_ROOT
from etutor_api import settings
import os
from django.core.files.storage import FileSystemStorage
from dj_rest_auth.registration.views import VerifyEmailView
from django.middleware.csrf import get_token
from django.http import JsonResponse
from etutor_api.settings import env, TELEGRAM_BOT_TOKEN
from rest_framework import pagination
from django.core.paginator import Paginator as DjangoPaginator

class CustomStudentRegisterView(RegisterView):
    serializer_class = CustomSignUpRegistrationSerializer
    user = {}
    
    def perform_create(self, serializer):
        with transaction.atomic():
            self.user = serializer.save(self.request)
            self.user.is_active = True
    
    def get_response_data(self, user):
        return {
            "username":self.user.username,
            "password":self.request.data.get('password1')
        }
    
class CustomInstructorRegisterView(RegisterView):
    serializer_class = CustomSignUpRegistrationSerializer
    user = {}
    
    def perform_create(self, serializer):
        with transaction.atomic():
            self.user = serializer.save(self.request)
            email = self.request.data.get('email')
            send(self, email)

    def is_confirmation_email_sent(self, email):
        email_address = EmailAddress.objects.filter(email=email).first()
        return email_address and email_address.emailconfirmation_set.exists() 
        
    def get_response_data(self, user):
        if allauth_settings.EMAIL_VERIFICATION in [allauth_settings.EmailVerificationMethod.MANDATORY , allauth_settings.EmailVerificationMethod.OPTIONAL]:
            if self.is_confirmation_email_sent(self.user.email):
                return {'detail': 'Verification e-mail sent.', "user_id":self.user.id}
            else:
                return {'detail': 'Verification e-mail sent.', "user_id":self.user.id}

        if getattr(settings, 'REST_USE_JWT', False):
            data = {
                'user': user,
                'access_token': self.access_token,
                'refresh_token': self.refresh_token,
            }
            self.user.save()
            return JWTSerializer(data, context=self.get_serializer_context()).data
        elif getattr(settings, 'REST_SESSION_LOGIN', False):
            return None
        else:
            return TokenSerializer(user.auth_token, context=self.get_serializer_context()).data

class ListUser(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    queryset = CustomUser.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ['username',"first_name", "middle_name", "last_name", "email", "phone_number"]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CustomRegisterSerializer
        else:
            return UserDetailSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            self.user = serializer.save(self.request)
            email = self.user.email
            if email and create_email_confirmation(email):
                send_email_confirm_password_reset_link(email)
                
    def get_queryset(self):
        method = self.request.query_params.get("method")
        group = self.request.query_params.get("group")
        if method == "tutor_user":
            current_user = self.request.user
            tutor = Tutor.objects.filter(tutor = current_user, status = ActionStatus.APPROVED).first()
            if tutor is not None:
                self.queryset = self.queryset.filter(user__tutor = tutor)
        if group is not None:
            self.queryset = self.queryset.filter(groups=group)
        return super().get_queryset()

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission | IsSelf]
    queryset = CustomUser.objects.all()
    serializer_class = UserDetailSerializer
    def perform_update(self, serializer):
        with transaction.atomic():
            if serializer.validated_data.get("is_active") and serializer.validated_data.get("username") != self.request.user.username:
                email = self.get_object().email
                email and send_password_reset_link(email)
            return super().perform_update(serializer)

class ListGroup(generics.ListCreateAPIView):
    permission_classes = [IsSystemAdminUser]
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class DetailGroup(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class CustomUserManager(generics.CreateAPIView):
    permission_classes = [IsSystemAdminUser]
    serializer_class = AdminRegisterSerializer

class ListUserPermission(generics.ListAPIView):
    permission_classes = [IsSystemAdminUser,]
    queryset = UserPermission.objects.all()
    serializer_class = UserPermissionSerializer
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['content_type__model',"user__username"]

class UserPermissionDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSystemAdminUser,]
    queryset = UserPermission.objects.all()
    serializer_class = UserPermissionSerializer

class CreateUserPermission(generics.CreateAPIView):
    # permission_classes = [IsSystemAdminUser,]
    queryset = UserPermission.objects.all()
    serializer_class = UserPermissionAddSerializer

class DetailUserPermission(generics.RetrieveUpdateAPIView):
    permission_classes = [IsSystemAdminUser]
    queryset = UserPermission.objects.all()
    serializer_class = UserPermissionSerializer

class ListGroupPermission(generics.ListCreateAPIView):
    permission_classes = [IsSystemAdminUser, ]
    queryset = GroupPermission.objects.all()
    serializer_class = GroupPermissionSerializer
    pagination_class = CustomPagination
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['content_type__model',"group__name"]

class GroupPermissionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = GroupPermission.objects.all()
    serializer_class = GroupPermissionSerializer

class DetailGroupPermission(generics.RetrieveUpdateAPIView):
    permission_classes = [IsSystemAdminUser]
    queryset = GroupPermission.objects.all()
    serializer_class = GroupPermissionSerializer

class ListContentType(generics.ListCreateAPIView):
    permission_classes = [IsSystemAdminUser, ]
    queryset = ContentType.objects.all()
    serializer_class = ContentTypeSerializer
    pagination_class = CustomCursorPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['model']
    ordering_fields = ['model']

class DetailContentType(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSystemAdminUser]
    queryset = ContentType.objects.all()
    serializer_class = ContentTypeSerializer

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = get_frontend_url()+"login"
    client_class = OAuth2Client

class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter

class GitHubLogin(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    callback_url = get_frontend_url()+"login"
    client_class = OAuth2Client

def telegram_auth(request):
    bot_token = TELEGRAM_BOT_TOKEN
    redirect_url = f"https://t.me/{bot_token}?start=auth"
    return redirect(redirect_url)

class ListEducationalBackgroundTutor(generics.ListAPIView):
    permission_classes = [ReadOnly]
    queryset = EducationalBackground.objects.all()
    serializer_class = EducationalBackgroundTutorSerializer

class ListEducationalBackground(generics.ListCreateAPIView):
    permission_classes = [WriteOnly|ReadOnly|CustomPermission]
    queryset = EducationalBackground.objects.all()
    serializer_class = EducationalBackgroundSerializer
    
    def get_queryset(self):
        user_id = self.request.query_params.get("user_id") or self.request.user.id
        if not user_id and isinstance(self.request.user, AnonymousUser):
            return []
        if user_id is not None:
            self.queryset = self.queryset.filter(user=CustomUser.objects.filter(id=user_id).first())
        return self.queryset

    def perform_create(self, serializer):
        if not isinstance(self.request.user, AnonymousUser):        
            user = self.request.user
            serializer.validated_data["user"] = user
        if serializer.validated_data['currently_learning']:
            serializer.validated_data['year_of_graduation'] = None
            
        serializer.save()

class DetailEducationalBackground(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = [CustomPermission]
    queryset = EducationalBackground.objects.all()
    serializer_class = EducationalBackgroundSerializer
    
    def perform_update(self, serializer):
        if serializer.validated_data['currently_learning']:
            serializer.validated_data['year_of_graduation'] = None
        serializer.save()
        
    def perform_destroy(self, instance):
        with transaction.atomic():
            perform_file_delete(instance)        
            instance.delete()

def perform_file_delete(instance):
    file_path = os.path.join(MEDIA_ROOT,'media/'+instance.document.url.url.split('/')[-1])
    fs = FileSystemStorage()
    if fs.exists(file_path):
        fs.delete(file_path)
        instance.document.delete()

class ExperienceListCreate(generics.ListCreateAPIView):
    permission_classes = [WriteOnly|ReadOnly|CustomPermission, ]
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    
    def get_queryset(self):
        user_id = self.request.query_params.get("user_id") or self.request.user.id
        if not user_id and isinstance(self.request.user, AnonymousUser):
            return []
        if user_id is not None:
            self.queryset = self.queryset.filter(user=user_id)
        return self.queryset

    def perform_create(self, serializer):
        if not isinstance(self.request.user, AnonymousUser):
            user = self.request.user
            serializer.validated_data["user"] = user
        if serializer.validated_data['currently_working']:
            serializer.validated_data['end_date'] = None
        serializer.save()

class ExperienceRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = [CustomPermission]
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer

    def perform_update(self, serializer):
        if serializer.validated_data['currently_working']:
            serializer.validated_data['end_date'] = None
        serializer.save()
        
class ExperienceTutorList(generics.ListAPIView):
    permission_classes = [ReadOnly]
    queryset = Experience.objects.all()
    serializer_class = ExperienceTutorSerializer
    
    def get_queryset(self):
        params = self.request.query_params
        user = params.get("user_id")
        if user is not None:
            self.queryset = self.queryset.filter(user = user)
        
        return self.queryset

class ToBeInstructorRequestListCreate(generics.ListCreateAPIView):
    permission_classes = [WriteOnly|ReadOnly|CustomPermission, ]
    queryset = ToBeInstructorRequest.objects.all()
    serializer_class = ToBeInstructorRequestSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get("user_id")
        status = self.request.query_params.get("status")

        if self.request.method == "GET" and not isinstance(self.request.user, AnonymousUser):  
            user_id =  self.request.user.id
            
        if not user_id and isinstance(self.request.user, AnonymousUser):
            return []
        if user_id:
            self.queryset = self.queryset.filter(user=user_id)
            print(self.queryset)
        if status:
            self.queryset = self.queryset.filter(status=status)
        return self.queryset

    def perform_create(self, serializer):
        with transaction.atomic():
            if not isinstance(self.request.user, AnonymousUser):
                user = self.request.user
                serializer.validated_data["user"] = user            
            instance = serializer.save()
            instance.user.is_staff = True
            instance.user.save()
        
    def patch(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)    

class ToBeInstructorRequestRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = [CustomPermission]
    queryset = ToBeInstructorRequest.objects.all()
    serializer_class = ToBeInstructorRequestSerializer
    
    def perform_update(self, serializer):
        serializer.validated_data['responder'] = self.request.user
        status = serializer.validated_data['status']
        
        if status == ActionStatus.APPROVED:
            group,*_ = Group.objects.get_or_create(name="Instructor")
            with transaction.atomic():
                serializer.instance.user.groups.add(group)
                serializer.save()
        else:
            serializer.save()

sensitive_post_parameters_m = method_decorator(
    sensitive_post_parameters(
        'password', 'old_password', 'new_password1', 'new_password2',
    ),
)

class LoginView(GenericAPIView):
    """
    Check the credentials and return the REST Token
    if the credentials are valid and authenticated.
    Calls Django Auth login method to register User ID
    in Django session framework

    Accept the following POST parameters: username, password
    Return the REST Framework Token Object's key.
    """
    # permission_classes = (AllowAny,)
    serializer_class = LoginSerializer
    # throttle_scope = 'dj_rest_auth'

    user = None
    access_token = None
    token = None

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def process_login(self):
        django_login(self.request, self.user)

    def get_response_serializer(self):
        if getattr(settings, 'REST_USE_JWT', False):

            if getattr(settings, 'JWT_AUTH_RETURN_EXPIRATION', False):
                response_serializer = JWTSerializerWithExpiration
            else:
                response_serializer = JWTSerializer

        else:
            response_serializer = TokenSerializer
        return response_serializer

    def login(self):
        self.user = self.serializer.validated_data['user']
        token_model = get_token_model()

        if getattr(settings, 'REST_USE_JWT', False):
            self.access_token, self.refresh_token = jwt_encode(self.user)
        elif token_model:
            self.token = create_token(token_model, self.user, self.serializer)

        if getattr(settings, 'REST_SESSION_LOGIN', True):
            self.process_login()

    def get_response(self):
        serializer_class = self.get_response_serializer()

        if getattr(settings, 'REST_USE_JWT', False):
            from rest_framework_simplejwt.settings import (
                api_settings as jwt_settings,
            )
            access_token_expiration = (
                timezone.now() + jwt_settings.ACCESS_TOKEN_LIFETIME)
            refresh_token_expiration = (
                timezone.now() + jwt_settings.REFRESH_TOKEN_LIFETIME)
            return_expiration_times = getattr(
                settings, 'JWT_AUTH_RETURN_EXPIRATION', False)
            auth_httponly = getattr(settings, 'JWT_AUTH_HTTPONLY', False)

            data = {
                'user': self.user,
                'access_token': self.access_token,
            }

            if not auth_httponly:
                data['refresh_token'] = self.refresh_token
            else:
                # Wasnt sure if the serializer needed this
                data['refresh_token'] = ""

            if return_expiration_times:
                data['access_token_expiration'] = access_token_expiration
                data['refresh_token_expiration'] = refresh_token_expiration

            serializer = serializer_class(
                instance=data,
                context=self.get_serializer_context(),
            )
        elif self.token:
            serializer = serializer_class(
                instance=self.token,
                context=self.get_serializer_context(),
            )
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)

        response = Response(serializer.data, status=status.HTTP_200_OK)
        if getattr(settings, 'REST_USE_JWT', False):
            from dj_rest_auth.jwt_auth import set_jwt_cookies
            set_jwt_cookies(response, self.access_token, self.refresh_token)
        return response

    def post(self, request, *args, **kwargs):
        self.request = request

        self.serializer = self.get_serializer(data=self.request.data)

        self.serializer.is_valid(raise_exception=True)

        self.login()
        return self.get_response()

class LogoutView(APIView):
    permission_classes = (AllowAny,)
    throttle_scope = 'dj_rest_auth'

    def get(self, request, *args, **kwargs):
        if getattr(settings, 'ACCOUNT_LOGOUT_ON_GET', False):
            response = self.logout(request)
        else:
            response = self.http_method_not_allowed(request, *args, **kwargs)

        return self.finalize_response(request, response, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.logout(request)

    def logout(self, request):
        try:
            request.user.auth_token.delete()
        except (AttributeError, ObjectDoesNotExist):
            pass

        if getattr(settings, 'REST_SESSION_LOGIN', True):
            django_logout(request)

        response = Response(
            {'detail': _('Successfully logged out.')},
            status=status.HTTP_200_OK,
        )

        if getattr(settings, 'REST_USE_JWT', False):
            # NOTE: this import occurs here rather than at the top level
            # because JWT support is optional, and if `REST_USE_JWT` isn't
            # True we shouldn't need the dependency
            from rest_framework_simplejwt.exceptions import TokenError
            from rest_framework_simplejwt.tokens import RefreshToken

            from dj_rest_auth.jwt_auth import unset_jwt_cookies
            cookie_name = getattr(settings, 'JWT_AUTH_COOKIE', None)

            unset_jwt_cookies(response)

            if 'rest_framework_simplejwt.token_blacklist' in settings.INSTALLED_APPS:
                # add refresh token to blacklist
                try:
                    token = RefreshToken(request.data['refresh'])
                    token.blacklist()
                except KeyError:
                    response.data = {'detail': _(
                        'Refresh token was not included in request data.')}
                    response.status_code = status.HTTP_401_UNAUTHORIZED
                except (TokenError, AttributeError, TypeError) as error:
                    if hasattr(error, 'args'):
                        if 'Token is blacklisted' in error.args or 'Token is invalid or expired' in error.args:
                            response.data = {'detail': _(error.args[0])}
                            response.status_code = status.HTTP_401_UNAUTHORIZED
                        else:
                            response.data = {'detail': _(
                                'An error has occurred.')}
                            response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

                    else:
                        response.data = {'detail': _('An error has occurred.')}
                        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

            elif not cookie_name:
                message = _(
                    'Neither cookies or blacklist are enabled, so the token '
                    'has not been deleted server side. Please make sure the token is deleted client side.',
                )
                response.data = {'detail': message}
                response.status_code = status.HTTP_200_OK
        return response

class PasswordChangeView(GenericAPIView):

    serializer_class = PasswordChangeSerializer
    permission_classes = (IsAuthenticated,)
    throttle_scope = 'dj_rest_auth'

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': _('New password has been saved.')})

class PasswordResetView(generics.CreateAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = (AllowAny,)
    throttle_scope = 'dj_rest_auth'

    def perform_create(self, serializer):
        email = serializer.validated_data.get('email')
        email and send_password_reset_link(email)
        
        return Response(
            {'detail': _('Password reset e-mail has been sent.')},
            status=status.HTTP_200_OK,
        )

class PasswordResetConfirmView(GenericAPIView):
    """
    Password reset e-mail link is confirmed, therefore
    this resets the user's password.

    Accepts the following POST parameters: token, uid,
        new_password1, new_password2
    Returns the success/fail message.
    """
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = (AllowAny,)
    throttle_scope = 'dj_rest_auth'

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': _('Password has been reset with the new password.')},
        )

class CustomConfirmEmailView(VerifyEmailView):
    pass 
    # permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        # print("hello")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.kwargs['key'] = serializer.validated_data['key']
        confirmation = self.get_object()
        user = EmailAddress.objects.get(id=confirmation.email_address_id).user
        access_token, refresh_token = jwt_encode(user)
        print(access_token)
        print(refresh_token)
        confirmation.confirm(self.request)
        return Response(data={'user':UserDetailSerializer(user).data,'access_token': str(access_token),'refresh_token': str(refresh_token) }, status=status.HTTP_200_OK)

def csrf_view(request):
    csrf_token = get_token(request)
    response = JsonResponse({'message': 'Hello World'})
    response['X-CSRFToken'] = csrf_token
    return response



class EducationLevelList(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = EducationLevel.objects.all()
    serializer_class = EducationLevelSerializer
    filter_backends = [filters.SearchFilter]
    
class EducationLevelDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = EducationLevel.objects.all()
    serializer_class = EducationLevelSerializer
