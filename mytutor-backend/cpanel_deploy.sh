# #!/bin/bash

# # Source and destination paths
remote_username="nisirtec"
remote_server="nisirtech.com"
remote_path="/home/nisirtec/tutorhub.api.nisirtech.com"
env="/home/nisirtec/virtualenv/tutorhub.api.nisirtech.com/3.9"
migration_file="migrate_all.sh"
# compress with .deployignore files and folders
echo "compressing files ..."
tar -czvf api.tar.gz --exclude-from=.deployignore * &&
# copy to remote server
echo "copying compressed file to the server ..."
scp api.tar.gz "$remote_username@$remote_server:$remote_path" &&
# extract compressed file
echo "extracting the file on remote server and migrating ..."
ssh "$remote_username@$remote_server" "cd $remote_path && tar -xzf api.tar.gz && rm api.tar.gz && source $env && cd $remote_path && pip install -r requirements.txt && source $migration_file" &&
# remove compressed file from the local
rm api.tar.gz &&

echo """
        **********************************************
        *** Conguragulation Successfully Deployed! ***
        **********************************************
    """