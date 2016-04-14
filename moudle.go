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
  UserInfo   UserInfo `relation_type:"manytoone" column_name:"UserId" referenced_column_name:"UserId"`
  OrdersItemList []OrdersItem  `relation_type:"onetomany" column_name:"OrdersId" referenced_column_name:"OrdersItemsId"`
}


type UserInfo struct {
  UserId int `id:"true"   auto_increment:"true"`
  UserName    string  `notnull:"true"     length:"128" `
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
  ItemImage   string  `notnull:"true"     length:"64"`
  ItemLank        int `notnull:"true"`
  ItemsOptionList []ItemsOptions  `relation_type:"onetomany" column_name:"ItemId" referenced_column_name:"ItemId"`
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
  ItemsInfo   Items  `relation_type:"onetoone" column_name:"ItemId" referenced_column_name:"ItemId"`
}



func InitMoudle(moulde *moudle.Moudle) {
   moulde.AddTable(UserInfo{})
   moulde.AddTable(Address{})
   moulde.AddTable(Orders{})
   moulde.AddTable(OrdersItem{})
   moulde.AddTable(ItemsOptions{})
   moulde.AddTable(Items{})
   moulde.InitialDB(true)
    
   //TEST CODE
   moulde.Insert(UserInfo{Email:"wpxiong@gmail.com",Password:"1234567",UserName:"花田 太郎"}).InsertExecute()
   moulde.Insert(UserInfo{Email:"test1@gmail.com",Password:"1234567",UserName:"花田 次郎"}).InsertExecute()
   moulde.Insert(UserInfo{Email:"test2@gmail.com",Password:"1234567",UserName:"花田 三郎"}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test001",ItemImage:"001.jpg",ItemDescription:"001image",ItemLank:2}).InsertExecute()
   serial := moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production1",OptionPrice:23.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test002",ItemImage:"002.jpg",ItemDescription:"002image",ItemLank:3}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production2",OptionPrice:24.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test003",ItemImage:"003.jpg",ItemDescription:"003image",ItemLank:4}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production3",OptionPrice:25.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test004",ItemImage:"004.jpg",ItemDescription:"004image",ItemLank:5}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production4",OptionPrice:26.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test005",ItemImage:"005.jpg",ItemDescription:"005image",ItemLank:1}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production5",OptionPrice:27.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test006",ItemImage:"006.jpg",ItemDescription:"006image",ItemLank:2}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production6",OptionPrice:28.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test007",ItemImage:"007.jpg",ItemDescription:"007image",ItemLank:5}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production7",OptionPrice:128.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test008",ItemImage:"008.jpg",ItemDescription:"008image",ItemLank:2}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production8",OptionPrice:129.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test009",ItemImage:"009.jpg",ItemDescription:"009image",ItemLank:4}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production9",OptionPrice:130.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test010",ItemImage:"0010.jpg",ItemDescription:"010image",ItemLank:2}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production10",OptionPrice:131.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test011",ItemImage:"0011.jpg",ItemDescription:"011image",ItemLank:3}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production11",OptionPrice:133.4}).InsertExecute()
   
   moulde.Insert(Items{ItemName:"test012",ItemImage:"0012.jpg",ItemDescription:"012image",ItemLank:2}).InsertExecute()
   serial = moulde.GetCurrentSerialValue(Items{})
   moulde.Insert(ItemsOptions{ItemId:int(serial),OptionName:"Production12",OptionPrice:141.4}).InsertExecute()
   
   // TEST CODE
}

   
