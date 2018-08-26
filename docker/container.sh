#!/usr/bin/env bash

#
# NOTE: There is a dependency to MySQLDB container to link MySQL. See healthylinkx-mysql repo
#

set +x
export DEBIAN_FRONTEND=noninteractive
# Absolute path to this repo
SCRIPT=$(readlink -f "$0")
export REPOPATH=$(dirname "$SCRIPT")/..

# what you can do
CLEAR=N
CLEANUP=N
BUILD=N
RUN=N
INTERACTIVE=N

# you can also set the flags using the command line
for var in "$@"
do
	if [ "CLEAR" == "$var" ]; then CLEAR=Y 
	fi
	if [ "CLEANUP" == "$var" ]; then CLEANUP=Y 
	fi
	if [ "BUILD" == "$var" ]; then BUILD=Y 
	fi
	if [ "RUN" == "$var" ]; then RUN=Y 
	fi
	if [ "INTERACTIVE" == "$var" ]; then INTERACTIVE=Y 
	fi
done

# clean up all containers
if [ "${CLEAR}" == "Y" ]; then
	sudo docker stop NODEJSAPI
	sudo docker kill NODEJSAPI
	sudo docker rm -f NODEJSAPI
fi

# clean up all images
if [ "${CLEANUP}" == "Y" ]; then
	./$0 CLEAR
	sudo docker rmi -f nodejs
fi

# create image
if [ "${BUILD}" == "Y" ]; then
	./$0 CLEAR
	./$0 CLEANUP
	sudo docker build --rm=true -t nodejs $REPOPATH/docker
fi

# run the container in the background
if [ "${RUN}" == "Y" ]; then
	./$0 CLEAR
	if [ "$(sudo docker images | grep nodejs)" == "" ]; then
		./$0 BUILD
	fi
	sudo docker run -d  --name NODEJSAPI -p 8081:8081 -v $REPOPATH:/myapp --link MySQLDB:MySQLDB nodejs 
fi

# run the container in the console
if [ "${INTERACTIVE}" == "Y" ]; then
	./$0 CLEAR
	if [ "$(sudo docker images | grep nodejs)" == "" ]; then
		./$0 BUILD
	fi
	sudo docker run -ti --name NODEJSAPI -p 8081:8081 -v $REPOPATH:/myapp --link MySQLDB:MySQLDB nodejs /bin/bash
fi
