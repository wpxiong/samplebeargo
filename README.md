# samplebeargo

this web project is a sample application which is created using beargo mvc framework.

beargo mvc framework is a simple and fast mvc webframework.

current version is 0.1 and  only supports mysqldb.

installation procedure:

1. mysql install and create db
  download mysql db and install
  create database  which's name is  test 
2. install golang  enviroment
  https://golang.org/doc/install#install
3.source download 
  go install github.com/wpxiong/samplebeargo
4. move to source folder 
 cd $GOPATH/src/github.com/wpxiong/samplebeargo
5 modify setting file
  modify the secion DB_CONFIG in setting.conf 
  db_user : the username of your database test 
  db_password : the password of your database test 
  [DB_CONFIG]
  db_session_name=mysqldb
  db_dialecttype=mysql
  db_name=test
  db_url=tcp(localhost:3306)
  db_url_parameter=charset=utf8
  db_user=
  db_password=
  
  
  #listenPort
  listen_port=9001  this is the webserver listen port
  manager_port=9010
  manager_host=127.0.0.1
  
6 comile webapp
  go build

7 start web app
  samplebeargo.ext

8 access index web page 
 http://localhost:9001/index
 

