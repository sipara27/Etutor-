from rest_framework import serializers
from .models import PaymentRequest, CoursePayment


class PaymentRequestSerializer(serializers.ModelSerializer):
    tutor_name = serializers.CharField(source="tutor.tutor.short_name",read_only=True)
    student_name = serializers.CharField(source="student.short_name",read_only=True)
    payment_receipt_url = serializers.FileField(source="payment_receipt.url", read_only=True)
    bank_name = serializers.CharField(source="bank.bank_name", read_only=True)
    bank_account_number = serializers.CharField(source="bank.account_number", read_only=True)

    class Meta:
        model = PaymentRequest
        fields = '__all__'
    
class CoursePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.short_name", read_only=True)
    course_name = serializers.CharField(source="course.name", read_only=True)
    approver_name = serializers.CharField(source="approved_by.short_name", read_only=True)
    bank_name = serializers.CharField(source="bank.bank_name", read_only=True)
    bank_account_number = serializers.CharField(source="bank.account_number", read_only=True)
    payment_receipt_url = serializers.FileField(source="payment_receipt.url", read_only=True)
    
    class Meta:
        model = CoursePayment
        fields = '__all__'
        extra_kwargs = {
                'student': {'required': False}  # Make it not required in the serializer
            }