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

type ItemForm struct {
  ItemImage   string
  AltMessage  string
}

type  ShopForm struct{
   UserId    int
   ItemList  []ItemForm
}

type ShopListControl struct {
  controller.Controller
}

func (this *ShopListControl) Before(ctx *appcontext.AppContext,form interface{}) bool {
     request := ctx.Request.HttpRequest
     response := ctx.Writer.HttpResponseWriter
     var sess session.Session = session.NewSession(request , *response)
     var user User = User{}
     if sess.GetSessionValue("authuser",&user) {
        shopform := form.(*ShopForm)
        shopform.UserId = user.UserId
        return true
     }else {
        render.RedirectTo(ctx,"/index")
        return false
     }
}

func initShopForm (ctx *appcontext.AppContext, shopform *ShopForm) {
   dbtran := ctx.GetDefaultDBTransaction()
   itemList := dbtran.SimpleQuery(Items{}).FetchAll()
   shopform.ItemList = make([]ItemForm,len(itemList))
   for i:=0 ;i<len(itemList) ;i++ {
     item := itemList[i].(Items)
     shopform.ItemList[i] = ItemForm {ItemImage: item.ItemImage, AltMessage:item.ItemDescription }
   }
}

func (this *ShopListControl) ShopList(ctx *appcontext.AppContext,form interface{}){
     shopForm := form.(*ShopForm)
     initShopForm(ctx,shopForm)
     ctx.SetLayoutBaseName("layout")
     log.Debug(shopForm)
}
