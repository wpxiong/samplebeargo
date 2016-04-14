package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/appcontext"
  "github.com/wpxiong/beargo/session"
  "github.com/wpxiong/beargo/controller"
)

func init() {
  log.InitLog()
}

type ShoppingCartController struct {
  controller.Controller
}

func (this *ShoppingCartController) GetShoppingList (ctx *appcontext.AppContext,form interface{}) {
   request := ctx.Request.HttpRequest
   response := ctx.Writer.HttpResponseWriter
   var sess session.Session = session.NewSession(request , *response)
   var formlist []*AddCartForm = make([]*AddCartForm,0)
   sess.GetSessionValue("shoppingcart",&formlist)
   
   var ShoppingCartList []AddCartForm = make([] AddCartForm,len(formlist))
   for i,val := range formlist {
     ShoppingCartList[i] = *val
   }
   ctx.SetRenderData("shopcartlist",ShoppingCartList)
}

