from django.db import IntegrityError
from rest_framework import generics, serializers
from commons.utils.permissions import CustomPermission
from applications.category.models import Category
from applications.category.serializers import CategorySerializer, CategoryCourseSerializer
from rest_framework import filters
from django.http import HttpResponse, JsonResponse
from commons.utils.paginations import CustomCursorPagination
from commons.utils.file_utils import render_to_pdf
from rest_framework.response import Response
from rest_framework import status
from commons.utils.permissions import ReadOnly
from django.db.models import F

class DetailCategory(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except IntegrityError as e:
            error_message = "There are courses inside this category, so you can't delete it."
            raise serializers.ValidationError(
                (error_message))
    def patch(self, request, *args, **kwargs):
        methods = ["pin_unpin"]
        method = request.query_params.get("method")
        if method not in methods:
            raise serializers.ValidationError("Missing method")

        if method == "pin_unpin":
            instance = self.get_object()
            serializer = self.get_serializer(instance, data={"pinned": not instance.pinned}, partial= True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        return super().patch(request, *args, **kwargs)

class ListCategory(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    pagination_class = CustomCursorPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['category_name', 'description']
    ordering="-pinned"

    def post(self, request, format=None):
        
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            return Response(data.id, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        params = self.request.query_params
        pinned = params.get("pinned")
        if pinned is not None and pinned.lower()  == "true":
            self.queryset = self.queryset.filter(pinned = True)
        
        return super().get_queryset()

class GeneratePdf(generics.ListAPIView):
    permission_classes = [CustomPermission]
    queryset = Category.objects.all()

    def get(self, request):
        data = {"category": Category.objects.all()}
        pdf = render_to_pdf('invoice.html', data)
        return HttpResponse(pdf, content_type='application/pdf')

# def category(request, pk=None,*args,**kwargs):
#     method = request.method

#     if method == 'GET':
#         if pk is not None:
#             query_set = get_object_or_404(Category,pk=pk)
#             data = CategorySerializer(query_set, many = False).data
#             Response(data)
#         else:
#             query_set  = Category.objects.all()
#             data = CategorySerializer(query_set, many =True).data
#             Response(data)
#     if method == "POST":
#         serializer = CategorySerializer(request.data)
#         if serializer.is_valid(raise_exception = True):
#             category_name = serializer.validated_data.get('category_name')
#             description = serializer.validate_data.get('description')
#             if description is None:
#                 description = category_name
#             serializer.save()
#         return Response(serializer.validated_data)


#     if method == 'PUT':
#         if pk is not None:
#             serializer = CategorySerializer(data =  request.data)
#             serializer.is_valid(raise_exception = True)
#             serializer.save()
#             data = serializer.validated_data

#             return Response(data)
