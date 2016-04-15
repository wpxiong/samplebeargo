package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/controller"
  "github.com/wpxiong/beargo/appcontext"
  "github.com/wpxiong/beargo/session"
)

func init() {
  log.InitLog()
}

type  AddCartForm struct{
   ItemId int
   ItemName string
   ItemPrice   float32
   ItemDescription  string
   Result  string
   ImagePath  string
   Count   int
}

type AddCartController struct {
  controller.Controller
}


func (this *AddCartController) Index(ctx *appcontext.AppContext,form interface{}){
  addcartForm := form.(*AddCartForm)
  defer func() {
     if r := recover(); r != nil {
         log.Error(r)
         addcartForm.Result = "error"
     }
  }()
  dbtran := ctx.GetDefaultDBTransaction()
  log.Debug(addcartForm.ItemId)
  items,err := dbtran.SimpleQuery(Items{ItemId:addcartForm.ItemId}).WhereAnd([]string{"ItemId"}).FetchOne()
  if !err {
    panic("db error")
  }
  item := items.(Items)
  log.Debug(item)
  dbtran.FetchLazyField(&item,[]string{"ItemsOptionList"})
  
  request := ctx.Request.HttpRequest
  response := ctx.Writer.HttpResponseWriter
  var sess session.Session = session.NewSession(request , *response)
  var formlist map[int]*AddCartForm = make(map[int]*AddCartForm,0)
  sess.GetSessionValue("shoppingcart",&formlist)
   
  addcartForm.ItemPrice = item.ItemsOptionList[0].OptionPrice
  addcartForm.ItemName = item.ItemName
  addcartForm.ItemDescription = item.ItemDescription
  addcartForm.ImagePath  = item.ItemImage
  addcartForm.Result = "ok"
  if elem,ok := formlist[addcartForm.ItemId]; ok {
      elem.Count += 1
  }else {
      addcartForm.Count = 1
      formlist[addcartForm.ItemId] = addcartForm
  }
  sess.SaveSessionValue("shoppingcart",formlist)
  log.Debug(formlist)
}


