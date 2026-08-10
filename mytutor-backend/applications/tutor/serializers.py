
from rest_framework import serializers
from .models import Grade, Tutor, Location, AvailabiltyTime, TutorContract
from applications.finance.models import Attendance
import uuid
from commons.authentication.serializer import ExperienceTutorSerializer,EducationalBackgroundSerializer
from .models import Tutor, Location, AvailabiltyTime, TutorContract, Subject
from commons.authentication.models import Experience, EducationalBackground
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_text
from commons.file.models import File
from etutor_api.settings import get_backend_url, MEDIA_ROOT
from applications.course.models import Reviewer
from django.db.models import OuterRef, Subquery, Avg, Count

class AvailabiltyTimeSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(allow_null=True, required=False, default=uuid.uuid4)

    class Meta:
        model = AvailabiltyTime
        fields = ('id','tutor', 'tutor_contract', 'start_time', 'end_time', 'day','user','status')

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'
        
class TutorSerializer(serializers.ModelSerializer):
    availabilty_times = AvailabiltyTimeSerializer(many= True)
    tutor_name = serializers.CharField(source="tutor.name", read_only=True)
    profile_pic = serializers.CharField(source="tutor.profile_pic", read_only=True)
    region_name = serializers.CharField(source="location.parent.parent.address",read_only=True)
    zone_name = serializers.CharField(source="location.parent.address", read_only=True)
    woreda_name = serializers.CharField(source="location.address", read_only=True)
    rating = serializers.CharField(read_only=True)
    reviews = serializers.CharField(read_only=True)
    total_hour = serializers.CharField(read_only=True)
    region = serializers.CharField(source="location.parent.parent.id", read_only=True)
    zone = serializers.CharField(source="location.parent.id", read_only=True)
    woreda = serializers.CharField(source="location.id", read_only=True)
    experiences = serializers.SerializerMethodField(read_only=True)
    educations = serializers.SerializerMethodField(read_only=True)
    is_contracted = serializers.SerializerMethodField(read_only=True)
    nearest_location = serializers.CharField(max_length=150)
    preferred_subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), many=True)
    preferred_subject_names = serializers.SerializerMethodField(read_only=True)
    tutor_type = serializers.PrimaryKeyRelatedField(queryset=Grade.objects.all(), many=True)
    preferred_grade_names = serializers.SerializerMethodField(read_only=True)
    profile_picture = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Tutor
        fields = '__all__' 
    
    def get_experiences(self, tutor_instance):
        experiences = tutor_instance.tutor.user_experience.all()
        return ExperienceTutorSerializer(experiences, many=True).data
    
    def get_educations(self, tutor_instance):
        educations = tutor_instance.tutor.educational_background.all()
        return EducationalBackgroundSerializer(educations, many=True).data
    
    def get_is_contracted(self, tutor_instance):
        if hasattr(tutor_instance, "is_contracted_value"):
            return tutor_instance.is_contracted_value

        if self.context.get('request'):
            user = self.context.get('request').user
            if user.is_authenticated:
                return TutorContract.objects.filter(user=user, tutor=tutor_instance).exists()
        return False
    
    def get_preferred_subject_names(self, instance):
        return [
            subject.subject_name
            for subject in instance.preferred_subject.all()
        ]
     
    def get_preferred_grade_names(self, instance):
        return [grade.grade_name for grade in instance.tutor_type.all()]
    
    def get_profile_picture(self, obj):
        # Retrieve only the 'url' field to improve efficiency
        profile_pic = obj.tutor.profile_pic
        if not profile_pic or not profile_pic.url:
            return None  # Handle case where file does not exist
        # file_name = url.split('/')[-1]
        # encoded_file_name = urlsafe_base64_encode(force_bytes(file_name))
        return get_backend_url() + 'media/' + profile_pic.url.name

class LocationSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source="parent.address",read_only=True)
    class Meta:
        model = Location
        fields = '__all__'

class TutorContractSerializer(serializers.ModelSerializer):
     contract_availabilty_times = AvailabiltyTimeSerializer(many= True)
     student_first_name = serializers.CharField(source="user.first_name",read_only=True)
     student = serializers.CharField(source="user.id",read_only=True)
     hourly_rate = serializers.FloatField(source="tutor.hourly_rate",read_only=True)
     student_last_name = serializers.CharField(source="user.last_name",read_only=True)
     student_phone_num = serializers.CharField(source="user.phone_number",read_only=True)
     tutor_name = serializers.CharField(source="tutor.tutor.short_name",read_only=True)
     student_name = serializers.CharField(source="user.short_name",read_only=True)
     tutor_id = serializers.CharField(source="tutor.tutor.id",read_only=True)
     profile_pic = serializers.CharField(source="user.profile_pic",read_only=True)
     profile_picture = serializers.SerializerMethodField(read_only=True)
     
     class Meta:
        model = TutorContract
        fields = '__all__'

     def get_profile_picture(self, obj):
        # Retrieve only the 'url' field to improve efficiency
        id = None
        if self.context.get('request').user.id == obj.tutor.tutor.profile_pic_id:
            id = obj.tutor.tutor.profile_pic_id
        else:
            id  = obj.user.profile_pic_id
            
        url = File.objects.filter(id=id).values_list('url', flat=True).first()
            
        if not url:
            return None  # Handle case where file does not exist
        
        # file_name = url.split('/')[-1]
        # encoded_file_name = urlsafe_base64_encode(force_bytes(file_name))
        return get_backend_url() +'media/' + url

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.short_name",read_only=True)
    tutor_name = serializers.CharField(source="tutor.tutor.short_name",read_only=True)
    tutor_id = serializers.CharField(source="tutor.tutor.id",read_only=True)
    class Meta:
        model = Attendance
        fields = '__all__'
