from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.contenttypes.models import ContentType
from django.db import transaction

from commons.file.serializers import FileListSerializer
from .models import CustomUser, EducationLevel, Group, UserPermission, GroupPermission, EducationalBackground,Experience, ToBeInstructorRequest
from .validator import validate_password1, validate_password2
import json
from ..utils.email_utils import send
from commons.utils.enums import GenderType
from django.core.exceptions import ValidationError as DjangoValidationError
try:
    from allauth.account.adapter import get_adapter
    from allauth.account import app_settings as allauth_settings
    from allauth.utils import email_address_exists
    from allauth.account.models import EmailConfirmation, EmailAddress
    from allauth.account.utils import setup_user_email
except ImportError:
    raise ImportError('allauth needs to be added to INSTALLED_APPS.')
import os
from django.shortcuts import render, get_object_or_404

class GroupPermissionSerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(
        queryset=ContentType.objects.all(),
        slug_field='model'
        
    )
    group = serializers.SlugRelatedField(
        queryset=Group.objects.all(),
        slug_field="name"
    )
    class Meta:
        model = GroupPermission
        fields = ['id', 'group', 'content_type', 'can_view',
                  'can_change', 'can_create', 'can_delete', 'other_action']

class GroupSerializer(serializers.ModelSerializer):
    group_permission = GroupPermissionSerializer(read_only=True, many=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'group_permission', 'no_of_users']

class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(max_length=200)
    middle_name = serializers.CharField(max_length=200)
    last_name = serializers.CharField(max_length=200, default="")
    phone_number  =  serializers.CharField(max_length=200)
    gender = serializers.IntegerField()
    profile_pic = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    is_staff = serializers.BooleanField(default=False)
    is_superuser = serializers.BooleanField(default=False)
    bio = serializers.CharField(max_length=3000, default="")
    password1 = serializers.CharField(write_only=True, default="12qwaszxzxasqw12")
    password2 = serializers.CharField(write_only=True, default="12qwaszxzxasqw12")
    groups = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), many=True)
 
    def validate_password2(self, value):
        return validate_password2(self, value)

    def validate_password1(self, value):
        return validate_password1(self, value)
    
    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_settings.UNIQUE_EMAIL:
            if email and email_address_exists(email):
                emailAddress = EmailAddress.objects.filter(email=email).first()
                if(emailAddress and emailAddress.verified):
                    raise serializers.ValidationError(
                        ('A user is already registered with this e-mail address. please reset it if you forget your password.'),
                    )
                else:
                    send(self, email)
                    raise serializers.ValidationError(
                        ('A user is already registered with this e-mail address.Check your email for confirmation, you dont have to register again'),
                    )
        return email

    @transaction.atomic
    def save(self, request):
        user = super().save(request)
        data = request.data
        group,*_ = Group.objects.get_or_create(name="Student")
        user.first_name = data.get('first_name')
        user.last_name = data.get('last_name', "")
        user.middle_name = data.get('middle_name')
        user.phone_number = data.get("phone_number")
        if data.get("profile_pic"):
            user.profile_pic = File.objects.filter(id=data.get("profile_pic")).first()
        user.gender = data.get('gender')
        user.is_staff = data.get("is_staff")
        user.is_superuser = data.get("is_superuser")
        group_data = data.get("groups")
        if group_data:
            for group_id in group_data:
                data = Group.objects.filter(id=group_id).first()
                user.groups.add(data)
        else:
            user.groups.add(group)
        user.bio = self.data.get('bio')
        user.save()
        return user

class CustomSignUpRegistrationSerializer(RegisterSerializer):
    first_name = serializers.CharField(max_length=200)
    middle_name = serializers.CharField(max_length=200)
    last_name = serializers.CharField(max_length=200, default="")
    phone_number  =  serializers.CharField(max_length=200)
    gender = serializers.IntegerField()
    profile_pic = serializers.UUIDField(write_only=True, required=True, allow_null=True)
    bio = serializers.CharField(max_length=3000, default="")
    password1 = serializers.CharField(write_only=True, default="12qwaszxzxasqw12")
    password2 = serializers.CharField(write_only=True, default="12qwaszxzxasqw12")

    def validate_password2(self, value):
        return validate_password2(self, value)

    def validate_password1(self, value):
        return validate_password1(self, value)
    
    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_settings.UNIQUE_EMAIL:
            if email and email_address_exists(email):
                emailAddress = EmailAddress.objects.filter(email=email).first()
                if(emailAddress and emailAddress.verified):
                    raise serializers.ValidationError(
                        ('A user is already registered with this e-mail address.'),
                    )
                else:
                    send(self, email)
                    raise serializers.ValidationError(
                        ('A user is already registered with this e-mail address.Check your email for confirmation, you dont have to register again'),
                    )
        return email
    def get_full_name(self, value):
        return value['first_name'] + ' ' + value['middle_name'] + ' ' + value['last_name']
    
    @transaction.atomic
    def save(self, request):
        user = super().save(request)
        data = request.data
        user.first_name = data.get('first_name')
        user.last_name = data.get('last_name', "")
        user.middle_name = data.get('middle_name')
        user.phone_number = data.get("phone_number")
        if data.get("profile_pic"):
            user.profile_pic = File.objects.filter(id=data.get("profile_pic")).first()
        user.gender = data.get('gender')
        user.bio = data.get('bio')
        user.password1 = data.get('password1')
        user.password2 = data.get('password2')
        group,*_ = Group.objects.get_or_create(name="Student")
        user.groups.add(group)
        user.save()
        return user

class AdminRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(max_length=200)
    middle_name = serializers.CharField(max_length=200)
    last_name = serializers.CharField(max_length=200, default="")
    # date_of_birth = serializers.DateField()

    def validate_password2(self, value):
        return validate_password2(self, value)

    def validate_password1(self, value):
        return validate_password1(self, value)

    @transaction.atomic
    def save(self, request):
        user = super().save(request)
        user.first_name = self.data.get('first_name')
        user.last_name = self.data.get('last_name')
        user.middle_name = self.data.get('middle_name')
        # user.date_of_birth = self.data.get('date_of_birth')
        user.is_superuser = True
        user.save()
        return user

class UserPermissionAddSerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(
        queryset=ContentType.objects.all(),
        slug_field='id'
    )

    class Meta:
        model = UserPermission
        fields = ['id', 'user', 'content_type', 'can_view',
                  'can_change', 'can_create', 'can_delete', 'other_action']

class UserPermissionSerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(
        queryset=ContentType.objects.all(),
        slug_field='model'
    )
    user = serializers.SlugRelatedField(
        queryset=CustomUser.objects.all(),
        slug_field='username'
    )

    class Meta:
        model = UserPermission
        fields = ['id', 'user', 'content_type', 'can_view',
                  'can_change', 'can_create', 'can_delete', 'other_action']

class ContentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentType
        fields = '__all__'

class UserAddSerializer(RegisterSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'
    
class ContentTypeSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = ContentType
        fields = '__all__'

from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_text
from commons.file.models import File
from etutor_api.settings import get_backend_url, MEDIA_ROOT

class EducationalBackgroundSerializer(serializers.ModelSerializer):
    document_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    level_of_education_name = serializers.CharField(source="level_of_education.educationlevel_name", read_only=True)

    class Meta:
        model = EducationalBackground
        fields = ['id','user', 'school_of_education','field_of_study','document', 'level_of_education', 'start_date',
                  'year_of_graduation', 'currently_learning', 'document_url', 'file_name', 'file_size','level_of_education_name']

    def get_document_url(self, obj):
        if not obj.document or not obj.document.url:
            return None
        document = obj.document.url.url
        file_path = document.rsplit('/', 1)[0]
        file_name = document.split('/')[-1]
        encoded_file_name = urlsafe_base64_encode(force_bytes(file_name))
        return get_backend_url() +'media/media/' + encoded_file_name
    
    def get_file_name(self, obj):
        if not obj.document or not obj.document.url:
            return None
        file = obj.document.url.url
        return file.split('/')[-1]
    
    def get_file_size(self, obj):
        if not obj.document or not obj.document.url:
            return None
        file = obj.document.url.url
        file_path = os.path.join(MEDIA_ROOT, 'media/'+file.split('/')[-1])
        return os.path.getsize(file_path) if os.path.exists(file_path) else None 

class EducationalBackgroundTutorSerializer(serializers.ModelSerializer):
    level_of_education_name = serializers.CharField(source="level_of_education.educationlevel_name")
    class Meta:
        model = EducationalBackground
        fields = ['id', 'level_of_education','field_of_study', 'school_of_education', "start_date","year_of_graduation", "currently_learning","level_of_education_name"]

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'

class ExperienceTutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id','job_title',"company","start_date", "end_date", "currently_working"]

class ToBeInstructorRequestSerializer(serializers.ModelSerializer):
    profile_pic = serializers.CharField(source="user.profile_pic", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    middle_name = serializers.CharField(source="user.middle_name", read_only=True)
    user_id = serializers.CharField(source="user.id", read_only=True)
    
    class Meta:
        model = ToBeInstructorRequest
        fields = ('id','user','user_id','profile_pic', "username", "first_name", "middle_name", "cover_letter", "status", "responder", "request_date", "response_date", "comment")

class UserDetailSerializer(serializers.ModelSerializer):
    educational_background = EducationalBackgroundSerializer(
        read_only=True, many=True)
    profile_picture = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ("id", "username", "first_name", "middle_name", "last_name", "email", "profile_pic", "is_active",
                  "last_login", "educational_background", "is_staff", "gender", "phone_number", 
                  "is_superuser","lang","groups", "bio", "short_name", "name","profile_picture"
                  )

    def get_profile_picture(self, obj):
        profile_pic = obj.profile_pic
        if not profile_pic or not profile_pic.url:
            return None  # Handle case where file does not exist
        
        # file_name = url.split('/')[-1]
        # encoded_file_name = urlsafe_base64_encode(force_bytes(file_name))
        return get_backend_url() + 'media/' + profile_pic.url.name

        # return file and file.url and file.url.url
    
class UserSerializer(serializers.ModelSerializer):
    user_permission = serializers.SerializerMethodField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    educational_background = EducationalBackgroundSerializer(
        read_only=True, many=True)
    full_name = serializers.SerializerMethodField(read_only=True)
    profile_picture = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ("id", "username", "first_name", "middle_name", "last_name", "email", "profile_pic","profile_picture", "is_superuser", "is_active",
                  "last_login", "date_joined", "educational_background", 'user_permission', 'groups',"lang", "is_staff", "gender", "phone_number","bio", "full_name",
                )

    def get_user_permission(self, obj):
        return json.loads(json.dumps(list(obj.user_permission_list))) + (json.loads(json.dumps(list(obj.group_permission_list))))
    
    def get_full_name(self, value):
        return value.first_name + ' ' + value.middle_name + ' ' + value.last_name
    
    def get_profile_picture(self, obj):
        # Retrieve only the 'url' field to improve efficiency
        url = File.objects.filter(id=obj.profile_pic_id).values_list('url', flat=True).first()
        
        if not url:
            return None  # Handle case where file does not exist
        
        # file_name = url.split('/')[-1]
        # encoded_file_name = urlsafe_base64_encode(force_bytes(file_name))
        return get_backend_url() +'media/' + url

class EducationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationLevel
        fields = '__all__'
