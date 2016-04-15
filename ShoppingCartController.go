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

type  ShopCartForm struct{
   ItemId    int
   ItemCount int
}


type ShoppingCartController struct {
  controller.Controller
}

func (this *ShoppingCartController) Before(ctx *appcontext.AppContext,form interface{}) bool {
   return true
}

func (this *ShoppingCartController) GetShoppingList (ctx *appcontext.AppContext,form interface{}) {
   request := ctx.Request.HttpRequest
   response := ctx.Writer.HttpResponseWriter
   var sess session.Session = session.NewSession(request , *response)
   var formlist map[int]*AddCartForm = make(map[int]*AddCartForm,0)
   sess.GetSessionValue("shoppingcart",&formlist)
   
   var ShoppingCartList []AddCartForm = make([] AddCartForm,len(formlist))
   var i int =0
   for _,val := range formlist {
     ShoppingCartList[i] = *val
     i+=1
   }
   ctx.SetRenderData("shopcartlist",ShoppingCartList)
}

func (this *ShoppingCartController) Delete(ctx *appcontext.AppContext,form interface{}) {
   request := ctx.Request.HttpRequest
   response := ctx.Writer.HttpResponseWriter
   var sess session.Session = session.NewSession(request , *response)
   var formlist map[int]*AddCartForm = make(map[int]*AddCartForm,0)
   sess.GetSessionValue("shoppingcart",&formlist)
   shopcart := form.(*ShopCartForm)
   if val,ok := formlist[shopcart.ItemId];ok {
      val.Count -= 1
      if  val.Count == 0 {
         delete(formlist,shopcart.ItemId)
      }
      shopcart.ItemCount = val.Count
   }
   sess.SaveSessionValue("shoppingcart",formlist)
}

