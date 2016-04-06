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

type  IndexForm struct{
}

type IndexControl struct {
  controller.Controller
}

func (this *IndexControl) Before(ctx *appcontext.AppContext,form interface{}) bool {
     log.Debug("Index Before")
     return true
}

func (this *IndexControl) Index(ctx *appcontext.AppContext,form interface{}){
     return 
}
