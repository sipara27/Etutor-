from django.contrib import admin
from .models import PaymentRequest

# Register your models here.


class FinanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'tutor_contract', 'tutor',
                    'tin_number', 'reference_no', 'payment_receipt', 'status', 'payment_type', 'crv_number', 'bank', 
                    'hourly_rate', 'total_hour', 'payment_date', 'total_price', 'ordered_by', 'approved_by',
                    'additional_price', 'discount_price', 'attendance_file')


admin.site.register(PaymentRequest, FinanceAdmin)
