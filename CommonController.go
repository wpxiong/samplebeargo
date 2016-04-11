package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/appcontext"
  "github.com/wpxiong/beargo/session"
)

func init() {
  log.InitLog()
}


type CommonController struct {
}

func (this *CommonController) GetCommonInfo (ctx *appcontext.AppContext) {
     request := ctx.Request.HttpRequest
     response := ctx.Writer.HttpResponseWriter
     var sess session.Session = session.NewSession(request , *response)
     var user User = User{}
     if sess.GetSessionValue("authuser",&user) {
        ctx.SetRenderData("LoginUserName",user.UserName)
        ctx.SetRenderData("Logined",true)
     }
}
