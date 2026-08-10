#!/bin/bash
source venv/bin/activate
#./migrate_all.sh
python3 manage.py makemigrations authentication about_us  feedback file message_util notification text_chat assignment category chapters content course course_progress tutor
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runserver