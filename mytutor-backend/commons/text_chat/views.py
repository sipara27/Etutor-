from django.shortcuts import render

# Create your views here.


def index(request):
    print(request.path)
    return render(request, "chat/index.html")


def room(request, room_name):
    return render(request, "chat/room.html", {"room_name": room_name})
