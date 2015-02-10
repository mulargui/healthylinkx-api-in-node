sudo docker stop nodejsapi
sudo docker rm nodejsapi
sudo docker run -ti -p 8081:8081 -v /vagrant/apps/healthylinkx-api-in-node:/myapp --name nodejsapi --link MySQLDB:MySQLDB nodejs /bin/bash