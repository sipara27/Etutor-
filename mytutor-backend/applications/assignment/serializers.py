from rest_framework import serializers, reverse
from .models import Answers, Questions, Options, UserAnswers, UserQuizeResults, Certificates
from .validators import validate_question_num
from commons.utils.enums import CONTENT_TYPE


class OptionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Options
        fields = '__all__'

class AnswersSerializer(serializers.ModelSerializer):
    value = serializers.CharField(source='answer.value', read_only=True)
    
    class Meta:
        model = Answers
        fields = '__all__'

class QuestionsSerializer(serializers.ModelSerializer):
    options_questions = OptionsSerializer(read_only=True, many=True)
   
    url_hyperLink = serializers.HyperlinkedIdentityField(
        view_name='questions-detail', lookup_field='pk')
    is_correct = serializers.BooleanField(read_only=True)        
    
    class Meta:
        model = Questions
        fields = '__all__'


class QuestionsReportSerializer(serializers.ModelSerializer):
    options_questions = OptionsSerializer(read_only=True, many=True)
    answer_question = AnswersSerializer(read_only=True, many=True)
    
    user_answer = serializers.SerializerMethodField(read_only = True)
   
    url_hyperLink = serializers.HyperlinkedIdentityField(
        view_name='questions-detail', lookup_field='pk')
    is_correct = serializers.BooleanField(read_only=True)        
    
    class Meta:
        model = Questions
        fields = '__all__'
        
    def get_user_answer(self, obj):
        return UserAnswersSerializer(UserAnswers.objects.filter(user =  self.context.get("request").user, index = self.context.get("request").query_params.get("index"), question = obj), many=True).data
        
# class OptionAnswerSerializer(serializers.ModelSerializer):
#     answer_option = serializers.PrimaryKeyRelatedField(read_only=True)
#     class Meta:
#         model = Options
#         fields = "__all__"
        
    
class QuestionsInstructorSerializer(serializers.ModelSerializer):
    options_questions = OptionsSerializer( many=True)
    url_hyperLink = serializers.HyperlinkedIdentityField(
        view_name='questions-detail', lookup_field='pk') 
    answer_question = AnswersSerializer(many=True, read_only=True)

    class Meta:
        model = Questions
        fields = '__all__'


    def create(self, validated_data):
        options = validated_data.pop('options_questions')

        content = validated_data.get("content")
        if content.content_type != CONTENT_TYPE.QUESTION:
            raise serializers.ValidationError(
                ('This is not question content'))
        question = Questions.objects.create(**validated_data)
        for option in options:
            Options.objects.create(question=question, value=option.get("value"))
        return question



class UserAnswersSerializer(serializers.ModelSerializer):
    # explanation = serializers.CharField(source="answer.explanation",read_only=True)/
    class Meta:
        model = UserAnswers
        fields = '__all__'


class UserQuizeResultsSerializer(serializers.ModelSerializer):
    content_title = serializers.CharField(source="content.title", read_only=True)
    chapter_title = serializers.CharField(source="content.chapter.chapter_title", read_only=True)
    user_name = serializers.CharField(source="user.short_name", read_only=True)
    
    class Meta:
        model = UserQuizeResults
        fields = '__all__'


class CertificatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificates
        fields = ['id', 'certificate_date', 'result', 'certificate_url',
                  'description', 'user', 'course', 'detail_url']
