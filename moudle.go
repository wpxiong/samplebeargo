package main

import (
  "github.com/wpxiong/beargo/moudle"
)


type User struct {
  UserId int `id:"true"   auto_increment:"true"`
  Email   string  `notnull:"true"     length:"128" `
  Password  string  `notnull:"true"     length:"128" `
}

func InitMoudle(moulde *moudle.Moudle) {
   moulde.AddTable(User{})
   
   moulde.InitialDB(true)
   //TEST CODE
   moulde.Insert(User{Email:"wpxiong@gmail.com",Password:"1234567"}).InsertExecute()
   moulde.Insert(User{Email:"test1@gmail.com",Password:"1234567"}).InsertExecute()
   moulde.Insert(User{Email:"test2@gmail.com",Password:"1234567"}).InsertExecute()
   // TEST CODE
}

   
