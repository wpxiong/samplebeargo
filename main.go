package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/webapp"
  "github.com/wpxiong/beargo/appcontext"
  "runtime"
)


func main() {
   log.InitLogWithLevel("Debug")
   runtime.GOMAXPROCS(runtime.NumCPU())
   
   
   configMap := InitConfig()
   config := appcontext.AppConfigContext{Port :9001,ConfigPath : "./setting.conf"}
   var appCon appcontext.AppContext = appcontext.AppContext{ ConfigContext :  &config}
   app := webapp.New(&appCon,configMap)
   
   indexCtrl := &IndexControl{}
   loginCtrl := &LoginControl{}
   
   app.AddRoute("/index",indexCtrl,"Index",IndexForm{})
   app.AddRoute("/login",loginCtrl,"Login",LoginForm{})
   
   app.Start()
   
}