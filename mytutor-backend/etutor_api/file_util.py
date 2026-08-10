from commons.file.models import File
from django.shortcuts import render, get_object_or_404
from django.http import FileResponse, HttpResponseForbidden
import os
from django.contrib.auth.decorators import login_required
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_text, force_str
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from django.views.generic import View



class ProtectedFileHandlerView(View):    
    def get(self, request, *args, **kwargs):
        try:
            # file_name = urlsafe_base64_decode(self.kwargs.get('file'))
            file_name = self.kwargs.get('file')
            if file_name is not None:
                # file_name = force_str(file_name)
                document = get_object_or_404(File, url="media/"+file_name.split('/')[-1])
                response = FileResponse(document.url)
                return response
            else:
                # document = get_object_or_404(File, url="media/"+file_name)
                # response = FileResponse(document.url)
                # return response
                pass
        except (TypeError, ValueError) as e:
            # Handle decoding errors gracefully
            print(f"Error decoding base64 string: {e}")
            return None  # Or handle the error differently
    

def securePdf(request, file):
    file_name = force_text(urlsafe_base64_decode(file))
    document = get_object_or_404(File, url="media/"+file_name)
    response = FileResponse(document.url)
    return response
    
    if request.META.get('HTTP_AUTHORIZATION'):
        access_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]
        try:
            token = AccessToken(access_token)
            user_id = token.payload['user_id']
            response = FileResponse(document.url)
            return response
        except:
            print("Error occured")
    else:
        return HttpResponseForbidden("You don't have permission to access this file.")
