
rem cleanup previous instalations
kubectl delete services healthylinkx-api-service
kubectl delete deployments healthylinkx-api-deployment

IF "%1"=="CLEAN" exit /B 0

rem create the containers
minikube ssh /c/Users/mulargui/cluster/healthylinkx-api-in-node/docker/container.sh BUILD

rem create new resources
kubectl create -f %userprofile%/cluster/healthylinkx-api-in-node/k8s/api-service.yaml
kubectl create -f %userprofile%/cluster/healthylinkx-api-in-node/k8s/api-deployment.yaml

exit /B 0
