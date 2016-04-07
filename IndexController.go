package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/controller"
  "github.com/wpxiong/beargo/appcontext"
  "github.com/wpxiong/beargo/render"
)

func init() {
  log.InitLog()
}

type  IndexForm struct{
   Email string
   Password string
}

type IndexControl struct {
  controller.Controller
}

func (this *IndexControl) Before(ctx *appcontext.AppContext,form interface{}) bool {
     log.Debug("Index Before")
     return true
}

func (this *IndexControl) Index(ctx *appcontext.AppContext,form interface{}){
     
}

func (this *IndexControl) Login(ctx *appcontext.AppContext,form interface{}){
   indexForm := form.(*IndexForm)
   log.Debug(indexForm)
   dbtran := ctx.GetDefaultDBTransaction()
   if userinfo,ok := dbtran.SimpleQuery(User{Email:indexForm.Email}).WhereAnd([]string{"Email"}).FetchOne(); ok {
      user := userinfo.(User)
      log.Debug(user)
      if user.Password == indexForm.Password {
         render.RedirectTo(ctx,"/shop")
      }else {
         render.RedirectTo(ctx,"/index")
      }
   } else {
      render.RedirectTo(ctx,"/index")
   }
}
