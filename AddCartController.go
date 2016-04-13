package main

import (
  "github.com/wpxiong/beargo/log"
  "github.com/wpxiong/beargo/controller"
  "github.com/wpxiong/beargo/appcontext"
)

func init() {
  log.InitLog()
}

type  AddCartForm struct{
   ItemId int
}

type AddCartController struct {
  controller.Controller
}


func (this *AddCartController) Index(ctx *appcontext.AppContext,form interface{}){
  addcartForm := form.(*AddCartForm)
  log.Debug(addcartForm)
}


