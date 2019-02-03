healthylinkx-api-in-node
========================
Healthylinkx is a 3 tiers app: ux, api and datastore. Healthylinkx creates and runs a container for each tier.

This repo implements the api tier in node.js. It is a container running node and connects to the datastore.

Directories:\
Src. the code of the app. To note that at the top of the constants.js file it is declared the connection to the datastore and you might need to edit it.\
vm. files to setup a vm using vagrant and virtualbox. move the vagrantfile to the root of the repo.\
docker. how to create and manage the container.\
k8s. templates to create the service in kubernetes. tested with minikube. Edit setup.bat to point to the directory where you cloned the repo\

You can see how I set up minikube in the repo http://github.com/mulargui/healthylinkx-k8s \

Note: Keep in mind if you clone this repo in Windows that shellscripts' line breaks will be adjusted to Windows and will not work in minikube. You will need to edit the files.
