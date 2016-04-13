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

type  RegistForm struct{
   Email string
   Password string
   Username string
   RePassword string
}

type RegistController struct {
  controller.Controller
}

func (this *RegistController) validateRegister (ctx *appcontext.AppContext,form interface{}) bool  {
   registform :=  form.(*RegistForm)
   result := true
   if len(registform.Username) == 0  {
       ctx.SetError("UsernameError","Username must not be empty string")
       result = false
   }
   
   if len(registform.Password) < 8  {
       ctx.SetError("PasswordError","Password must be more than 8 letters")
       result = false
   }
   
   if registform.Password != registform.RePassword {
       ctx.SetError("RePasswordError","Confirm Password is not equal to Password")
       result = false
   }
   
   if result {
       dbtran := ctx.GetDefaultDBTransaction()
       if _,ok := dbtran.SimpleQuery(UserInfo{Email:registform.Email}).WhereAnd([]string{"Email"}).FetchOne(); ok {
           ctx.SetError("EmailError","This Email has been registed")
           result = false
       }
   }
   return result
}


func (this *RegistController) Before(ctx *appcontext.AppContext,form interface{}) bool {
   if ctx.UrlPath == "/registing" {
      res := this.validateRegister(ctx,form)
      if !res {
         log.Debug("xxxx")
         render.RedirectTo(ctx,"/regist")
         return false
      } 
   }
   return true
}

func (this *RegistController) Index(ctx *appcontext.AppContext,form interface{}){

}

func (this *RegistController) Regist(ctx *appcontext.AppContext,form interface{}){
   registform :=  form.(*RegistForm)
   dbtran := ctx.GetDefaultDBTransaction()
   dbtran.Insert(UserInfo{Email:registform.Email,Password:registform.Password,UserName:registform.Username}).InsertExecute()
   render.RedirectTo(ctx,"/login")
}

