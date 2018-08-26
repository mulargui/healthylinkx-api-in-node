#!/usr/bin/env bash

set -x
export DEBIAN_FRONTEND=noninteractive

# select which components to provision
OS_REFRESH=N
DOCKER=N

# you can also set the flags using the command line
for var in "$@"
do
	if [ "OS_REFRESH" == "$var" ]; then OS_REFRESH=Y 
	fi
	if [ "DOCKER" == "$var" ]; then DOCKER=Y 
	fi
	if [ "ALL" == "$var" ]; then 
		OS_REFRESH=Y 
		DOCKER=Y 
	fi
done

# keep the OS fresh
if [ "${OS_REFRESH}" == "Y" ]; then
	sudo apt-get -qq update
	sudo apt-get -qq -fy install
	sudo apt-get -qq -y upgrade
	sudo apt-get -qq -y autoremove
fi

# install docker
if [ "${DOCKER}" == "Y" ]; then
	sudo apt-get remove docker docker-engine
	sudo apt-get -qq update
	#Trusty only: sudo apt-get install linux-image-extra-$(uname -r) linux-image-extra-virtual
	sudo apt-get -qq update
	sudo apt-get -y install curl apt-transport-https ca-certificates software-properties-common
	sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
	sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
	sudo apt-get -qq update
	sudo apt-get -y install docker-ce
	# sudo usermod -aG docker vagrant
fi

