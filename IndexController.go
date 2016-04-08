package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/controller"
  "github.com/wpxiong/beargo/appcontext"
  "github.com/wpxiong/beargo/render"
  "github.com/wpxiong/beargo/form"
  "github.com/wpxiong/beargo/session"
)

func init() {
  log.InitLog()
}

type  IndexForm struct{
   Email string
   Password string
   form.BaseForm
}

type IndexControl struct {
  controller.Controller
}


func (this *IndexControl) Index(ctx *appcontext.AppContext,form interface{}){

}

func (this *IndexControl) Login(ctx *appcontext.AppContext,form interface{}){
   indexForm := form.(*IndexForm)
   log.Debug(indexForm)
   dbtran := ctx.GetDefaultDBTransaction()
   if userinfo,ok := dbtran.SimpleQuery(User{Email:indexForm.Email}).WhereAnd([]string{"Email"}).FetchOne(); ok {
      log.Debug(userinfo)
      user := userinfo.(User)
      if user.Password == indexForm.Password {
         request := ctx.Request.HttpRequest
         response := ctx.Writer.HttpResponseWriter
         var sess session.Session = session.NewSession(request , *response)
         sess.SaveSessionValue("authuser",user)
         render.RedirectTo(ctx,"/shop")
      }else {
         ctx.SetError("PasswordError","password is not correct")
         render.RedirectTo(ctx,"/index")
      }
   } else {
      ctx.SetError("PasswordError","user is not registed")
      render.RedirectTo(ctx,"/index")
   }
}
