
from rest_framework import serializers
from .models import Bank



class BankSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Bank
        fields = ('id', 'bank_name','account_number', 'description','is_active') 
        

