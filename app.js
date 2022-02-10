//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const date = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://VladanD:vladan123@cluster0.ispkc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/todolistDB",{useNewUrlParser:true});
const itemSchema = {

  name:String
};
const Item = mongoose.model("item",itemSchema);

const item1 = new Item({name:"Welcome to your to do list"});
const item2 = new Item({name:"Hit the + button to add new item."});
const item3 = new Item({name:"<-- Hit this to delete item."});
const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemSchema ]

}
const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

//const day = date.getDate();
Item.find(function(err,items){
    if(items.length ===0){
      Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Successfully saved default items to DB.");
  }
    });
    res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
});
 

});
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
    console.log(err);
  });
 

});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
   const item = new Item({name:itemName});
if(listName === "Today"){
  item.save();
  res.redirect("/");

}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);

  });

}


});

app.post("/delete",function(req,res){

  const checkiedItem = req.body.checkbox;
  const listName = req.body.listName;
  if(listName ==="Today"){
  Item.findByIdAndRemove(checkiedItem,function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully deleted item");
      res.redirect("/");
    }
  })
}else{
  
  

  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkiedItem}}},function(err,foundList){
      if(!err){
        console.log("err");

        res.redirect("/" + listName);
      }else{
      }
    });
}

})
 

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,()=>{
  console.log("Server started successfully on port 3000");
});
