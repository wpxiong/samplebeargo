package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/controller"
  "github.com/wpxiong/beargo/appcontext"
  "github.com/wpxiong/beargo/session"
  "github.com/wpxiong/beargo/render"
)

func init() {
  log.InitLog()
}

type  ShopForm struct{
   UserId    int
   
}

type ShopListControl struct {
  controller.Controller
}

func (this *ShopListControl) Before(ctx *appcontext.AppContext,form interface{}) bool {
     request := ctx.Request.HttpRequest
     response := ctx.Writer.HttpResponseWriter
     var sess session.Session = session.NewSession(request , *response)
     if val,ok := sess.GetSessionValue("authuser") ;ok {
        user := val.(User)
        shopform := form.(*ShopForm)
        shopform.UserId = user.UserId
        return true
     }else {
        render.RedirectTo(ctx,"/index")
        return false
     }
}

func (this *ShopListControl) ShopList(ctx *appcontext.AppContext,form interface{}){
     shopForm := form.(*ShopForm)
     log.Debug(shopForm)
}
