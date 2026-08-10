from commons.utils.token_generator import token_uid_url_generator,token_uid_code_url_gen
from django.conf import settings
from django.core.mail import send_mail
from allauth.account.models import EmailConfirmation, EmailAddress
from allauth.account.adapter import DefaultAccountAdapter
from etutor_api.settings import env, get_frontend_url
from commons.authentication.models import CustomUser
from allauth.account.adapter import get_adapter
from django.utils import timezone
from allauth.account import signals
from allauth.account.models import EmailConfirmation, EmailAddress
from allauth.account.adapter import get_adapter
from django.utils import timezone
from allauth.account import signals
from smtplib import SMTPException
import socket

from rest_framework import serializers

def send_password_reset_link(email):
    user_data = CustomUser.objects.filter(email=email).first()
    reset_confirm_url = token_uid_url_generator(email, user_data)
    if (reset_confirm_url and user_data) is not None:
        user_data and send_email_to_user(reset_confirm_url, user_data)

def send_email_confirm_password_reset_link(email):    
    user_data = CustomUser.objects.filter(email=email).first()
    reset_confirm_url = token_uid_code_url_gen(email, user_data)
    if (reset_confirm_url and user_data) is not None:
        send_email_to_user(reset_confirm_url, user_data)

def create_email_confirmation(email):
        email_address = EmailAddress.objects.filter(email=email).first()
        if email_address is not None:
            is_confirmation_sent = EmailConfirmation.objects.filter(email_address_id=email_address.id).exists()
            if email_address and not is_confirmation_sent:     
                result = EmailConfirmation.objects.create(
                            email_address=email_address, 
                            created=timezone.now(), 
                            sent=timezone.now(), 
                            key=get_adapter().generate_emailconfirmation_key(email))
                return result is not None
            
            elif is_confirmation_sent:
                if(CustomAdapter.send_confirmation_mail(email) is int):
                    signals.email_confirmation_sent.send(
                        sender=self.__class__,
                        request=self.request,
                        confirmation=self,
                        signup=True,
                    )
                
def send(self,email):
    if create_email_confirmation(email):
        if(CustomAdapter.send_confirmation_mail(email) is int):
            signals.email_confirmation_sent.send(
                sender=self.__class__,
                request=self.request,
                confirmation=self,
                signup=True,
            )
            return True
    else:
        return False

def send_email_to_user(reset_confirm_url, user_data):
    message = {'subject': 'Password reset confirmation',
                'message_body': 'Please click the following link to confirm your password reset:' + reset_confirm_url}
    html_message = f'''
        <html>
        <body>
            <h3 style="color:#ff735c">Password Reset Request</h3>
            <h1>Hi, {user_data.first_name}</h1>
            <p>We have received a request to reset the password for your account. 
            To proceed with the password reset, please click on the link below:.</p>
            <a href="{reset_confirm_url}" style="display: inline-block; padding: 10px 20px; 
            background-color: #ff735c; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>

            <p style="margin-top:10px">If you did not make this request, please ignore this email. Your account security is important to us.</p>
            <p>Thank you</p>
            <p>MyTutor platform</p>
        </body>
        </html>
    '''
    send_email(html_message, message, user_data.email) 

class CustomAdapter(DefaultAccountAdapter):
    def send_confirmation_mail(email):
            current_site = get_frontend_url()+'verify_email/'
            user_data = CustomUser.objects.filter(email=email).first()
            if user_data is not None:
                confirmationData = EmailConfirmation.objects.filter(email_address__email=email).first()
                if confirmationData is not None:
                    reset_confirm_url = f'{confirmationData.key}'
                    reset_confirm_url = current_site + reset_confirm_url
                    message = {'subject': 'Email Verification',
                                'message_body': 'Please click the following link to verify your email:' + reset_confirm_url}
                    html_message = f'''
                    <html>
                    <body>
                        <h3 style="color:#ff735c">Verify Your Email Address</h3>
                        <h1>Dear, {user_data.first_name}</h1>
                        <p>We're excited to get you started.
                            Simply click on the button so we know this email address belongs to you.</p>
                        <a href="{reset_confirm_url}" style="display: inline-block; padding: 10px 20px; 
                        background-color: #ff735c; color: white; text-decoration: none; border-radius: 5px;">Verify Your Email.</a>
                        <p>If you did not sign up for an account, please disregard this email.</p>
                        <h2 style="margin-top:20px; margin-bottom:20px;">Welcome to Tutorhub!</h2>
                        <p>Best regards,</p>
                        <p>Tutorhub E-Tutor Platform</p>
                    </body>
                    </html>
                    '''
                    send_email(html_message, message, email)
                   
                   
def send_email(html_message, message, email):
    try:
        return send_mail(
                message['subject'],  
                message['message_body'],
                settings.EMAIL_HOST_USER, 
                [email], 
                html_message=html_message)
    except socket.error as e:
        if e.errno == 101:
            raise serializers.ValidationError(
                ('Please connect to internet, connection is lost.'),
            )     