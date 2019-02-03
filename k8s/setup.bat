
rem edit this if you cloned the repo in a different directory
minikube ssh "ln -s /c/Users/Mauricio/Documents/healthylinkx-api-in-node /home/docker/healthylinkx-api-in-node"

rem create the containers
minikube ssh "/home/docker/healthylinkx-api-in-node/docker/container.sh BUILD"

rem create resources
kubectl create -f %~dp0.\api-service.yaml
kubectl create -f %~dp0.\api-deployment.yaml

exit /B 0
