package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/controller"
  "github.com/wpxiong/beargo/appcontext"
)

func init() {
  log.InitLog()
}

type  ShopForm struct{
   UserName  string
   Password  string
}

type ShopListControl struct {
  controller.Controller
}

func (this *ShopListControl) Before(ctx *appcontext.AppContext,form interface{}) bool {
     log.Debug("Index Before")
     return true
}

func (this *ShopListControl) ShopList(ctx *appcontext.AppContext,form interface{}){
     shopForm := form.(*ShopForm)
     log.Debug(shopForm)
}
