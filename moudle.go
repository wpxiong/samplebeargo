package main

import (
  "github.com/wpxiong/beargo/moudle"
  "time"
)

type Orders struct {
  OrdersId   int `id:"true"   auto_increment:"true"`
  UserId     int  
  OrderPurchasedDate  time.Time `notnull:"true"`
  OrderStatus  string  `notnull:"true"     length:"1" `
  OrdersFinishedDate  time.Time
  AddressId   int `notnull:"true"`
  AddressInfo  Address `relation_type:"manytoone" column_name:"AddressId" referenced_column_name:"AddressId"`
  UserInfo   User `relation_type:"manytoone" column_name:"UserId" referenced_column_name:"UserId"`
}


type User struct {
  UserId int `id:"true"   auto_increment:"true"`
  Email   string  `notnull:"true"     length:"128" `
  Password  string  `notnull:"true"     length:"128" `
  OrderList []Orders  `relation_type:"onetomany" column_name:"UserId" referenced_column_name:"UserId"`
}

type Address struct {
  AddressId int `id:"true"   auto_increment:"true"`
  AddressName string  `notnull:"true"     length:"256"`
}

type Items struct {
  ItemId int `id:"true"   auto_increment:"true"`
  ItemName string  `notnull:"true"     length:"256"`
  ItemDescription   string `length:"256" `
  
}

type ItemsOptions struct {
  OptionId int `id:"true"   auto_increment:"true"`
  ItemId int
  OptionName string  `notnull:"true"     length:"256"`
  OptionPrice   float32 `scale:"2" length:"12" `
}


type OrdersItem struct {
  OrdersItemsId  int `id:"true"   auto_increment:"true"`
  OrdersId   int
  ItemId     int
  ItemName   string `length:"128" `
  ItemDescription   string `length:"256" `
  OptionId   int
  OptionName string `length:"128" `
  OptionPrice  float32 `scale:"2" length:"12" `
}



func InitMoudle(moulde *moudle.Moudle) {
   moulde.AddTable(User{})
   moulde.AddTable(Address{})
   moulde.AddTable(Orders{})
   moulde.AddTable(OrdersItem{})
   moulde.AddTable(ItemsOptions{})
   moulde.AddTable(Items{})
   moulde.InitialDB(true)
    
   //TEST CODE
   moulde.Insert(User{Email:"wpxiong@gmail.com",Password:"1234567"}).InsertExecute()
   moulde.Insert(User{Email:"test1@gmail.com",Password:"1234567"}).InsertExecute()
   moulde.Insert(User{Email:"test2@gmail.com",Password:"1234567"}).InsertExecute()
   // TEST CODE
}

   
