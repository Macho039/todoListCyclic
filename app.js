//jshint esversion:6
//url to connect local : mongodb://127.0.0.1:27017/fruitsDB"
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

// req.element from html
app.use(bodyParser.urlencoded({extended: true}));
// req stye
app.use(express.static("public"));
//mobgoose connect // password : vd1rGIFNXRAPh1fI
//"mongodb+srv://marutch039:<password>@cluster0.x5x1k5z.mongodb.net/<databaseName>?retryWrites=true&w=majority"
mongoose.connect("mongodb+srv://marutch039:vd1rGIFNXRAPh1fI@cluster0.x5x1k5z.mongodb.net/todoList?retryWrites=true&w=majority")
.then(function() {
  console.log("connected")
});

// create schema for db
const itemsSchema = new mongoose.Schema({
  name: String,
});
//create item model
const item = mongoose.model("item", itemsSchema);
// insert data to db collection
const startingItem1 = new item(
  {
    name: "Welcome to your todolist"
  });
const startingItem2 = new item({
  name: "Hit + to add"
});
const startingItem3 = new item({
  name: "Have a try"
});

const defaultItems =[startingItem1,startingItem2,startingItem3];

// /work route items //
// create schema for db
// const workSchema = new mongoose.Schema({
//   name: String,
// });
// //create item model
// const work = mongoose.model("work", workSchema);
// const workItems =[];

//create list schema
const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);
// save many //

// item.insertMany(defaultItems).then( function() {
//   console.log("Insert successfully");
// });

app.post("/", function(req, res){

  const listName = req.body.list;
  const newItem = new item({
    name: req.body.newItem,
  });
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    // add new item different route //
    List.findOne({name: listName}).then( function(foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.get("/", function(req, res) {

  //read document and show item on home route//
  item.find().then( function (foundItems) { // found items is item that found in mongodb

    // save if db is empty //
    if( foundItems.length === 0) {
      item.insertMany(defaultItems).then( function() {
        console.log("Insert successfully");
        });
      res.redirect("/");
    } else {
      const day = date.getDate();
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
    
  });
});



// delete process //
app.post("/delete", function(req, res){
  const deletedId = req.body.delete;
  const listName = req.body.listName;

  if (listName === "Today" ){
    item.findByIdAndRemove(deletedId).then(function() {
      console.log("Delete successfully");
    });
    // update items //
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id : deletedId}}})
    .then(function(foundList) {
      if(foundList) {
        res.redirect("/" + listName);
      }
    });
  }

});


// app.get("/work", function(req,res){
//   work.find().then(function(foundItems){
//     res.render("list", {listTitle: "Work List", newListItems: foundItems});
//   });
// });

// params route //
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName})
  .then( function(foundList) {
    if (!foundList) {
       // create new lists //
       const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      // show the list basically redirect //
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  })
  .catch( function(err){
    console.log(err);
  });
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
