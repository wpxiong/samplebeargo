package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/controller"
  "github.com/wpxiong/beargo/appcontext"
  "github.com/wpxiong/beargo/render"
  "github.com/wpxiong/beargo/session"
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


func (this *IndexControl) Index(ctx *appcontext.AppContext,form interface{}){

}

func (this *IndexControl) Logout(ctx *appcontext.AppContext,form interface{}){
   request := ctx.Request.HttpRequest
   response := ctx.Writer.HttpResponseWriter
   var sess session.Session = session.NewSession(request , *response)
   sess.DeleteSessionValue("authuser")
   render.RedirectTo(ctx,"/login")
}


func (this *IndexControl) Login(ctx *appcontext.AppContext,form interface{}){
   indexForm := form.(*IndexForm)
   dbtran := ctx.GetDefaultDBTransaction()
   if userinfo,ok := dbtran.SimpleQuery(User{Email:indexForm.Email}).WhereAnd([]string{"Email"}).FetchOne(); ok {
      user := userinfo.(User)
      if user.Password == indexForm.Password {
         request := ctx.Request.HttpRequest
         response := ctx.Writer.HttpResponseWriter
         var sess session.Session = session.NewSession(request , *response)
         sess.SaveSessionValue("authuser",user)
         log.Debug("success")
         render.RedirectTo(ctx,"/index")
      }else {
         ctx.SetError("PasswordError","password is not correct")
         render.RedirectTo(ctx,"/login")
      }
   } else {
      ctx.SetError("PasswordError","user is not registed")
      render.RedirectTo(ctx,"/login")
   }
}
