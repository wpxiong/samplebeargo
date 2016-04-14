# samplebeargo

this web project is a sample application which is created using beargo mvc framework.

beargo mvc framework is a simple and fast mvc webframework.

current version is 0.1 and  supports mysqldb , postgres

installation procedure:

1. mysql install and create db </br>
  .download mysql db and install </br>
  .create database  which's name is  test </br>
2. install golang  enviroment </br>
   https://golang.org/doc/install </br>
3. source download </br>
   go install github.com/wpxiong/samplebeargo </br>
4. move to source folder 
    cd $GOPATH/src/github.com/wpxiong/samplebeargo </br>
5.  modify setting file </br>
    modify the secion DB_CONFIG in setting.conf  </br>
       db_user : the username of your database test   </br> 
       db_password : the password of your database test </br>
       db_name : database name  </br>

      [DB_CONFIG] </br> 
      db_session_name=mysqldb </br>
      db_dialecttype=mysql </br>
      db_name=test </br>
      db_url=tcp(localhost:3306) </br>
      db_url_parameter=charset=utf8 </br>
      db_user=   </br>
      db_password= </br>
  
     you can modify the listen port if you don't modify the listen port   </br>
     you will access the website with url http://localhost:9001  </br>
     
     listen_port=9001   </br>
     manager_port=9010  </br>
     manager_host=127.0.0.1  </br>
  
6  comile webapp  </br>
   go build  </br>

7 start web app  </br> 
   samplebeargo.exe   </br>

8 access index web page  </br>
  http://localhost:9001/index  </br>
 

