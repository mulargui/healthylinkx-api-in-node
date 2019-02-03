
rem cleanup resources
kubectl delete services healthylinkx-api-service
kubectl delete deployments healthylinkx-api-deployment

rem cleanup the container image
minikube ssh "/home/docker/healthylinkx-api-in-node/docker/container.sh CLEANUP"

rem remove link
minikube ssh "rm /home/docker/healthylinkx-api-in-node"

exit /B 0
