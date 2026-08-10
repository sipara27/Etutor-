#!/bin/bash 

# Source and destination paths
remote_username="mytutorc"
remote_server="mytutor.com.et"
remote_path="/home/mytutorc/api.mytutor.com.et"
env="/home/mytutorc/virtualenv/api.mytutor.com.et/3.9/bin/activate"
migration_file="migrate_all.sh"

# Step 1: Compress with .deployignore files and folders
echo "Compressing files ..."
tar -czvf api.tar.gz --exclude-from=.deployignore * &&

# Step 2: Copy to remote server
echo "Copying compressed file to the server ..."
scp api.tar.gz "$remote_username@$remote_server:$remote_path" &&

# Step 3: Extract compressed file and run migrations
echo "Extracting the file on the remote server and running migrations ..."
ssh "$remote_username@$remote_server" "cd $remote_path && tar -xzf api.tar.gz && rm api.tar.gz && source $env && cd $remote_path && pip install -r requirements.txt && source $migration_file" &&

# Step 4: Remove compressed file from the local machine
rm api.tar.gz &&

# Step 5: Obfuscate Python files in specific folders
# List the specific folders you want to obfuscate
# FOLDERS_TO_OBFUSCATE=("commons/file" "commons/authentication" "commons/about_us"  "commons/feedback"  "commons/message_util" "commons/notification" "commons/text_chat" "applications/assignment" "applications/category" "applications/chapters" "applications/content" "applications/course" "applications/course_progress" "applications/tutor" "applications/bank" "applications/finance" "applications/advert")  # Replace with your actual folder paths

# echo "Obfuscating Python files in specific folders ..."
# for folder in "${FOLDERS_TO_OBFUSCATE[@]}"; do
#     ssh "$remote_username@$remote_server" "cd $remote_path && source $env && find $folder -type f -name '*.py' -exec pyarmor obfuscate {} \;"
# done

# Step 6: Restart the web server (assuming Gunicorn is used here)
# echo "Restarting the web server (Gunicorn) ..."
# ssh "$remote_username@$remote_server" "cd $remote_path && source $env && sudo systemctl restart gunicorn" &&

# Optional: Clear cache
# echo "Clearing cache ..."
# ssh "$remote_username@$remote_server" "cd $remote_path && source $env && python manage.py clear_cache" &&

# Optional: Notify team of successful deployment
# echo "Sending deployment notification ..."
# mail -s "Deployment Successful" your_email@example.com <<< "Your application has been successfully deployed and obfuscated on $remote_server" &&

# Step 7: Final success message
echo """
        **********************************************
        *** Congratulations! Successfully Deployed! ***
        **********************************************
    """
