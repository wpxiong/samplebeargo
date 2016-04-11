package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/webapp"
  "github.com/wpxiong/beargo/appcontext"
  "runtime"
)

type UserInfo struct {
  UserId int `id:"true"   auto_increment:"true"`
  Email   string  `notnull:"true"     length:"128" `
  Password  string  `notnull:"true"     length:"128" `
}

func main() {
   log.InitLogWithLevel("Debug")
   runtime.GOMAXPROCS(runtime.NumCPU())
   
   
   configMap := InitConfig()
   config := appcontext.AppConfigContext{ConfigPath : "./setting.conf"}
   var appCon appcontext.AppContext = appcontext.AppContext{ ConfigContext :  &config}
   app := webapp.New(&appCon,configMap)
   
   indexCtrl := &IndexControl{}
   shopListControl := &ShopListControl{}
   
   app.AddRoute("/login",indexCtrl,"Index",IndexForm{})
   app.AddRoute("/logout",indexCtrl,"Logout",IndexForm{})
   app.AddRoute("/loging",indexCtrl,"Login",IndexForm{})
   app.AddRoute("/index",shopListControl,"ShopList",ShopForm{})
   app.InitDB()
   dbmoudle := app.GetDefaultDB()
   InitMoudle(dbmoudle)
   
   app.Start()
   webapp.StartCommanListener(app)
   
}