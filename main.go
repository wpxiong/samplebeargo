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
   config := appcontext.AppConfigContext{ConfigPath : "./setting.conf"}
   var appCon appcontext.AppContext = appcontext.AppContext{ ConfigContext :  &config}
   app := webapp.New(&appCon,configMap)
   
   indexCtrl := &IndexController{}
   shopListControl := &ShopListController{}
   registControl := &RegistController{}
   addCartControl := &AddCartController{}
   getshoplistControl := &ShoppingCartController{}
   
   app.AddRoute("/login",indexCtrl,"Index",IndexForm{})
   app.AddRoute("/logout",indexCtrl,"Logout",IndexForm{})
   app.AddRoute("/loging",indexCtrl,"Login",IndexForm{})
   app.AddRoute("/regist",registControl,"Index",RegistForm{})
   app.AddRoute("/registing",registControl,"Regist",RegistForm{})
   app.AddRoute("/addcart",addCartControl,"Index",AddCartForm{})
   app.AddRoute("/index",shopListControl,"ShopList",ShopForm{})
   app.AddRoute("/getshopcart",getshoplistControl,"GetShoppingList",ShopCartForm{})
   app.AddRouteWithViewPath("/shopcart/delete/<itemid:int>",getshoplistControl,"Delete",ShopCartForm{},"/delete")
   app.InitDB()
   dbmoudle := app.GetDefaultDB()
   InitMoudle(dbmoudle)
   
   app.Start()
   webapp.StartCommanListener(app)
   
}