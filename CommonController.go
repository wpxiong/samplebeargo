package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/appcontext"
  "github.com/wpxiong/beargo/session"
)

func init() {
  log.InitLog()
}


type ItemForm struct {
  ItemImage   string
  AltMessage  string
  ItemId      int
  ItemName    string
  ItemDescription  string
  ItemLank    []int
  ItemLankRetain    []int
  ItemPrice   float32
}

type  ShopForm struct{
   UserId    int
   ItemList  []ItemForm
}


type CommonController struct {
}

func (this *CommonController) GetCommonInfo (ctx *appcontext.AppContext,form interface{}) {
     request := ctx.Request.HttpRequest
     response := ctx.Writer.HttpResponseWriter
     var sess session.Session = session.NewSession(request , *response)
     var user UserInfo = UserInfo{}
     shopform := form.(*ShopForm)
     initShopForm(ctx,shopform)
     if sess.GetSessionValue("authuser",&user) {
        ctx.SetRenderData("LoginUserName",user.UserName)
        ctx.SetRenderData("Logined",true)
        shopform.UserId = user.UserId
     }
     
}



func initShopForm (ctx *appcontext.AppContext, shopform *ShopForm) {
   dbtran := ctx.GetDefaultDBTransaction()
   itemList := dbtran.SimpleQuery(Items{}).FetchAll()
   
   shopform.ItemList = make([]ItemForm,len(itemList))
   for i:=0 ;i<len(itemList) ;i++ {
     item := itemList[i].(Items)
     dbtran.FetchLazyField(&item,[]string{"ItemsOptionList"})
     shopform.ItemList[i] = ItemForm {ItemName:item.ItemName,ItemDescription:item.ItemDescription,ItemId:item.ItemId , ItemImage: item.ItemImage, AltMessage:item.ItemDescription ,ItemLank : make([]int,item.ItemLank),ItemLankRetain :make([]int,5 - item.ItemLank) }
     shopform.ItemList[i].ItemPrice = item.ItemsOptionList[0].OptionPrice
   }
}
