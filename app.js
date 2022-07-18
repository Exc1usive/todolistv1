const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const mongoose = require("mongoose");
require('dotenv').config()

const app = express();

let port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://xc1uDB:" + process.env.MONGODB_PWD + "@xc1udb.bmfa7on.mongodb.net/todolistDB")

const itemsSchema = {
  name: {
    type: String,
    required: true,
  }
}

const listSchema = {
  name: String,
  items: [itemsSchema],
}

const Item = mongoose.model("Item", itemsSchema)
const List = mongoose.model("List", listSchema)

const first = new Item({
  name: "Україна понад усе"
})

const second = new Item({
  name: "Cook Food"
})

const third = new Item({
  name: "Eat Food"
})

const defaultItems = [first, second, third];

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

  let items = [];
  const day = date.getDate()

  Item.find({}, function(err, item) {
    if (item.length === 0) {
      // add items to our DB
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfuly add defalut items");
        }
      })
      res.redirect("/")
    } else {
      List.find({}, function(err, listItem) {
        res.render("list", {
          listTitle: day,
          newListItems: item,
          listItem: listItem,
        });

      })
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const day = date.getDate()

  const item = new Item({
    name: itemName,
  });

  if (listName === day) {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/list/" + listName)
      }
    })
  }

})

app.get("/list/:listName", function(req, res) {

  const listName = _.capitalize(req.params.listName);

  List.findOne({
    name: listName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultItems,
        })
        list.save();
        res.redirect("/" + listName)
      } else {
        List.find({}, function(err, listItem) {
          res.render("list", {
            listTitle: listName,
            newListItems: foundList.items,
            listItem: listItem,
          });
        })
      }
    }
  })
})

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.list;
  const day = date.getDate()

  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        res.redirect("/")
      }
    })

  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/list/" + listName)
      }
    })
  }
})

app.post("/newList", function(req, res) {
  const listName = _.capitalize(req.body.newItem);
  List.create({
    name: listName
  }, function(err) {
    if (!err) {
      res.redirect("/list/" + listName)
    }
  })

})

app.get("/deleteList/:listName", function(req, res) {
  List.findOneAndDelete({
    name: req.params.listName
  }, function(err) {
    if (!err) {
      res.redirect("/");
    }
  })
})

app.listen(port, function() {
  console.log("server started on port - " + port);
})
