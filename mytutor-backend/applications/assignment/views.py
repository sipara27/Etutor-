
from rest_framework import generics, response
from commons.utils.permissions import CustomPermission

from .models import Answers, Options, Questions, UserAnswers, UserQuizeResults, Certificates
from .serializers import AnswersSerializer, QuestionsReportSerializer, QuestionsSerializer, OptionsSerializer, UserAnswersSerializer, UserQuizeResultsSerializer, CertificatesSerializer, QuestionsInstructorSerializer
from rest_framework import filters, serializers
from commons.utils.paginations import CustomCursorPagination
from commons.utils.enums import CONTENT_TYPE, AnswerType
from django.http import JsonResponse
from django.db import transaction
from applications.content.models import Content
from django.db.models.functions import Concat
from django.db.models import F, Subquery, OuterRef , Count
# Create your views here.


class DetailAnswers(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Answers.objects.all()
    serializer_class = AnswersSerializer


class ListAnswers(generics.ListCreateAPIView):
    # permission_classes = [CustomPermission]
    queryset = Answers.objects.all()
    serializer_class = AnswersSerializer

    def perform_create(self, serializer):
        data = serializer.validated_data
        question = data.get("answer").question
        if (data.get("question") != question):
            raise serializers.ValidationError(
                "the answer is not in the option of the question")
        serializer.save()


class DetailOptions(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Options.objects.all()
    serializer_class = OptionsSerializer


class ListOptions(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    # queryset = Options.objects.order_by('?')
    serializer_class = OptionsSerializer


class DetailQuestions(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Questions.objects.all()
    serializer_class = QuestionsSerializer

    
    def put(self, request, *args, **kwargs):
        options = request.data.pop("options_questions")
        with transaction.atomic():
            for option in options:
                obj,created = Options.objects.update_or_create(id = option.get("id"), question=self.get_object(), defaults={"value" : option.get("value")})
            return super().put(request, *args, **kwargs)


class ListQuestions(generics.ListAPIView):
    permission_classes = [CustomPermission]
    queryset = Questions.objects.order_by('?')
    pagination_classs = CustomCursorPagination
    serializer_class = QuestionsSerializer

    def get_serializer_class(self):
        if self.request.query_params.get("method") == 'user_answer':
            return QuestionsReportSerializer
        return super().get_serializer_class()
    # def get(self, *args, **kwargs):
        
    #     # QuestionsReportSerializer
    #     # return QuestionsSerializer
    #     super().get_serializer(*args, **kwargs)


    def get_queryset(self):
        content = self.request.query_params.get("content_id")
        user = self.request.user
        index = self.request.query_params.get("index")
        if content is not None:
            self.queryset = self.queryset.filter(content = content)
        self.queryset = self.queryset.exclude(answer_question__isnull=True) 
        
        # if self.request.query_params.get("method") == 'user_answer':  
        #     subQuery = UserAnswers.objects.filter(user= user, index=index, question = OuterRef("id"))
        #     self.queryset = self.queryset.annotate(
        #         answer = Subquery(subQuery.values("answer")[:1])
        #                                   , 
        #         is_correct=Subquery(subQuery.values("is_correct")[:1]))
                
        #     print(self.queryset)
        return self.queryset
    
class ListInstructorQuestion(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    queryset = Questions.objects.order_by('create_date')
    serializer_class = QuestionsInstructorSerializer
    
    def get_queryset(self):
        content = self.request.query_params.get("content_id")
        if content is not None:
            self.queryset = self.queryset.filter(content = content)
                                               
        return self.queryset
    

class OptionsOfQuestions(generics.ListAPIView):
    # permission_classes = [CustomPermission]
    serializer_class = OptionsSerializer

    def get_queryset(self):
        return Options.objcets.get(id=self.kwargs.get('id')).order_by('?')


class DetailUserAnswers(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = [CustomPermission]
    queryset = UserAnswers.objects.all()
    serializer_class = UserAnswersSerializer


class ListUserAnswers(generics.ListCreateAPIView):
    permission_classes = [CustomPermission]
    serializer_class = UserAnswersSerializer
    queryset = UserAnswers.objects.all()
    
    def get_queryset(self):
        params = self.request.query_params
        content_id = params.get("content_id")
        user_id = params.get("user_id")
        if content_id is not None:
            self.queryset = self.queryset.filter(question__content__id=content_id)
        if user_id is not None:
            self.queryset = self.queryset.filter(user_id=user_id)
        
        return self.queryset

    def post(self, request, *args, **kwargs):
        user_answers = request.data
        user = request.user
        if len(user_answers) == 0:
            raise serializers.ValidationError("No Answer Submitted")
        user_answers[0].get("question")
        content = Questions.objects.get(id=user_answers[0].get("question")).content
        index = UserQuizeResults.objects.filter(content = content, user= user).count()
        for answer in user_answers:
            answer["index"] = index
            answer["user"] = user.id
            answer["is_correct"] = Answers.objects.filter(question =answer.get("question"), answer = answer.get("answer")).exists()
            serializer = UserAnswersSerializer(data=answer)
            serializer.is_valid(raise_exception=True)
            serializer.save()        
        questions = Questions.objects.filter(content = content).exclude(answer_question__isnull=True)
        question_count = questions.count()   
        total_questions = min(question_count, (content.no_question or question_count))
        user_answer = UserAnswers.objects.filter(question=OuterRef("id"), user=user, index=index)
        answer = Answers.objects.filter(question=OuterRef("id")).values("question").annotate(count = Count("id")).values("count")
        
        result = questions.annotate(user_answers = Subquery(user_answer.values("question").annotate(count = Count("id")).values("count")), correct_answer = Subquery(user_answer.filter(is_correct = True).values("question").annotate(count = Count("id")).values("count")), answer = Subquery(answer)).filter(correct_answer__gt = 0, correct_answer = F("answer"), user_answers = F("correct_answer")).count()
        
        passed = (result/total_questions  * 100) >= (content.passing_percent or 0)

        data = {"user":user.id, "content" :content.id, "result": result, "total":total_questions, "is_passed" : passed, "index": index}
        serializer =UserQuizeResultsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        headers = self.get_success_headers(serializer.data)
        return response.Response(serializer.data, status=201, headers=headers)


class DetailUserQuizeResults(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = [CustomPermission]
    queryset = UserQuizeResults.objects.all()
    serializer_class = UserQuizeResultsSerializer


class ListUserQuizeResults(generics.ListCreateAPIView):
    # permission_classes = [CustomPermission]
    queryset = UserQuizeResults.objects.all()
    serializer_class = UserQuizeResultsSerializer


class DetailCertificates(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = [CustomPermission]
    queryset = Certificates.objects.all()
    serializer_class = CertificatesSerializer


class ListCertificates(generics.ListCreateAPIView):
    # permission_classes = [CustomPermission]
    queryset = Certificates.objects.all()
    serializer_class = CertificatesSerializer


class ResultList(generics.ListAPIView):

    def get(self, request):
        content_id = request.query_params.get("content_id")
        if content_id is None:
            raise serializers.ValidationError("please enter content_id param")
        no_of_question = Questions.objects.filter(content=content_id).count()
        data = []
        for (user,) in UserAnswers.objects.values_list('user').distinct():
            correctly_answered = UserAnswers.objects.filter(
                question__content=content_id, is_correct=True, user=user).count()
            data.append({"user_id": user, "no_of_question": no_of_question,
                        "correctly_answered": correctly_answered})
        return JsonResponse({"result": data})


class ResultUser(generics.ListAPIView):
    permission_classes = [CustomPermission]
    queryset = UserQuizeResults.objects.order_by("-create_date")
    serializer_class = UserQuizeResultsSerializer

    def get_queryset(self):
        params = self.request.query_params
        is_passed = params.get("is_passed")
        content_id = params.get("content_id")
        user = params.get("user")
        course = params.get("course")
        method = params.get("method")

        if is_passed is not None:
            self.queryset = self.queryset.filter(is_passed = is_passed == 'true')
        if content_id is not None:
            self.queryset = self.queryset.filter(content = content_id).filter(user = self.request.user)
        if course is not None:
            if user is None:
                user = self.request.user
            self.queryset = self.queryset.filter(content__chapter__course = course, user = user)
        if method == 'self':
            self.queryset = self.queryset.filter(user = self.request.user)
        if method == 'result':   
            maxId = UserQuizeResults.objects.filter(content = OuterRef("content"), user = OuterRef("user")).order_by("-result").values("id")[:1]    
            self.queryset = self.queryset.filter(id = Subquery(maxId))
        
        return self.queryset
    