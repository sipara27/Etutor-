from .models import Bank
from .serializers import BankSerializer
from commons.utils.permissions import CustomPermission, ReadOnly
from rest_framework import generics

# Create your views here.
class BankListCreateView(generics.ListCreateAPIView):
    permission_classes = [ReadOnly | CustomPermission]
    queryset = Bank.objects.all()
    serializer_class = BankSerializer
    search_fields = ['bank_name','account_number','description']
    ordering_fields = ['bank_name','account_number']
  
    def get_queryset(self):
        params = self.request.query_params
        bank_name = params.get("bank_name")
        is_active = params.get("is_active")
        if bank_name  is not None:
            self.queryset = self.queryset.filter(bank_name = bank_name)
        if is_active == True:
            self.queryset.filter(is_active = is_active)
          
        return self.queryset

    def perform_create(self, serializer):
        data = serializer.save()
        return data
    
class BankDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomPermission]
    queryset = Bank.objects.all()
    serializer_class = BankSerializer
