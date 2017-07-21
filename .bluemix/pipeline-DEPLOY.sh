#!/bin/bash

###############################################
# Install dependencies
###############################################

echo 'Installing dependencies...'
sudo apt-get -qq update 1>/dev/null
sudo apt-get -qq install jq 1>/dev/null
sudo apt-get -qq install figlet 1>/dev/null

figlet 'Node.js'

echo 'Installing nvm (Node.js Version Manager)...'
npm config delete prefix
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash > /dev/null 2>&1
. ~/.nvm/nvm.sh

echo 'Installing Node.js 7.9.0...'
nvm install 7.9.0 1>/dev/null
npm install --progress false --loglevel error 1>/dev/null

figlet 'OpenWhisk CLI'
mkdir ~/wsk
curl https://openwhisk.ng.bluemix.net/cli/go/download/linux/amd64/wsk > ~/wsk/wsk
chmod +x ~/wsk/wsk
export PATH=$PATH:~/wsk

################################################
# Create Services
################################################
figlet 'Services'

# Create Cloudant Service
figlet -f small 'Cloudant'
cf create-service cloudantNoSQLDB Lite cloudant-openwhisk
cf create-service-key cloudant-openwhisk cloudant-key

CLOUDANT_CREDENTIALS='cf service-key cloudant-openwhisk cloudant-key | tail -n +2'
export CLOUDANT_username='echo $CLOUDANT_CREDENTIALS | jq -r .username'
export CLOUDANT_password='echo $CLOUDANT_CREDENTIALS | jq -r .password'
export CLOUDANT_host='echo $CLOUDANT_CREDENTIALS | jq -r .host'
#Cloudant database should be set by the pipeline, else use a default
if [ -z "$CLOUDANT_db" ]; then
    echo 'CLOUDANT_db was not set in the pipeline. Using a default value.'
    export CLOUDANT_db=whiskbotdb
fi

echo 'Creating '$CLOUDANT_db' database...'
# ignore the "database already exists error"
curl -s -X PUT "https://$CLOUDANT_username:$CLOUDANT_password@$CLOUDANT_host/$CLOUDANT_db"
