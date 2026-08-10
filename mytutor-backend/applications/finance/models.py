from django.db import models
from commons.utils.model_utils import CommonsModel
from django.utils.translation import gettext_lazy as _
from commons.utils.enums import PaymentStatus, PaymentType
from django.conf import settings
from commons.utils.enums import AttendanceStatus

User = settings.AUTH_USER_MODEL

class PaymentRequest(CommonsModel):
    student = models.ForeignKey("authentication.CustomUser", verbose_name=_("Student"), related_name="payment_student", on_delete=models.SET_NULL, null=True)
    tutor_contract = models.ForeignKey("tutor.TutorContract", verbose_name=_("tutor contract"), on_delete=models.PROTECT)
    tutor = models.ForeignKey("tutor.Tutor", verbose_name=_("tutor"), on_delete=models.SET_NULL, null=True)
    tin_number = models.CharField(_("Tin Number"), max_length=150, default="", null=True, blank=True)
    reference_no =  models.CharField(_("Reference Number"), max_length=150, default="", blank=True,)
    payment_receipt = models.ForeignKey("file.File", verbose_name=_("Payment Receipt"), on_delete=models.SET_NULL, null=True)
    status = models.IntegerField(_("Status"), choices=PaymentStatus.choices, default=PaymentStatus.NOT_PAID)
    payment_type = models.IntegerField(_("Payment Type"), choices=PaymentType.choices, null=True)
    crv_number = models.CharField(_("CRV Number"), max_length=150, default="", null=True, blank=True,)
    bank = models.ForeignKey("bank.Bank", verbose_name=_("Bank"), on_delete=models.SET_NULL, null=True)
    hourly_rate = models.DecimalField(_("Hourly Rate"), max_digits=20, decimal_places=2)
    total_hour = models.DecimalField(_("Total Hour"), max_digits=20, decimal_places=2)
    payment_date = models.DateTimeField(_("Payment Date"), auto_now=False, auto_now_add=False, null=True)
    total_price = models.DecimalField(_("Total Price"), max_digits=20, decimal_places=2)
    ordered_by = models.ForeignKey("authentication.CustomUser", verbose_name=_("Order by"), related_name="payment_ordered_by", on_delete=models.SET_NULL, null=True)
    approved_by = models.ForeignKey("authentication.CustomUser", verbose_name=_("Approved by") ,related_name="payment_approved_by", on_delete=models.SET_NULL, null=True)
    additional_price = models.FloatField(_("Additional Price"), default=0)
    discount_price = models.FloatField(_("Discount Price"), default=0)
    attendance_file = models.ForeignKey("file.File", verbose_name=_("attendance file"), on_delete=models.SET_NULL, related_name="attendance_file", null=True)

class CoursePayment(CommonsModel):
    student = models.ForeignKey("authentication.CustomUser", verbose_name=_("Student"), on_delete=models.PROTECT)
    course = models.ForeignKey("course.Course", verbose_name=_("Course"), on_delete=models.PROTECT)
    approved_by = models.ForeignKey("authentication.CustomUser", verbose_name=_("Approved by") ,related_name="course_payment_approved_by", on_delete=models.SET_NULL, null=True)
    total_price = models.DecimalField(_("Total Price"), max_digits=20, decimal_places=2)
    additional_price = models.FloatField(_("Additional Price"), default=0)
    discount_price = models.FloatField(_("Discount Price"), default=0)
    status = models.IntegerField(_("Status"), choices=PaymentStatus.choices, default=PaymentStatus.NOT_PAID)
    payment_receipt = models.ForeignKey("file.File", verbose_name=_("Payment Receipt"), on_delete=models.SET_NULL, null=True)
    crv_number = models.CharField(_("CRV Number"), max_length=150, default="", null=True, blank=True,)
    bank = models.ForeignKey("bank.Bank", verbose_name=_("Bank"), on_delete=models.SET_NULL, null=True)
    tin_number = models.CharField(_("Tin Number"), max_length=150, default="", null=True, blank=True)
    reference_no =  models.CharField(_("Reference Number"), max_length=150, default="", blank=True,)
    
    
    def __str__(self):
        return self.course.name

class Attendance(CommonsModel):
    tutor_contract_request = models.ForeignKey("tutor.TutorContract", on_delete=models.CASCADE)
    tutor = models.ForeignKey("tutor.Tutor", on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    starting_hour = models.DateTimeField()
    ending_hour = models.DateTimeField()
    total_daily_hour = models.FloatField()
    status = models.IntegerField(choices=AttendanceStatus.choices, default=AttendanceStatus.SUBMITTED)
    is_paid = models.BooleanField(_("Is Payed"), default=False)
    payment_request = models.ForeignKey("finance.PaymentRequest", verbose_name=_("payment request"), on_delete=models.SET_NULL, null=True)
    # remark = models.CharField(_("remark"), max_length=300, null=True, blank=True)