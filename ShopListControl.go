package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/controller"
  "github.com/wpxiong/beargo/appcontext"
)

func init() {
  log.InitLog()
}

type ShopListControl struct {
  controller.Controller
  CommonController
}

func (this *ShopListControl) Before(ctx *appcontext.AppContext,form interface{}) bool {
     this.CommonController.GetCommonInfo(ctx,form)
     return true
}


func (this *ShopListControl) ShopList(ctx *appcontext.AppContext,form interface{}) {
     shopForm := form.(*ShopForm)
     ctx.SetLayoutBaseName("layout")
     log.Debug(shopForm)
}
