const _ = require('lodash');
const date = require(__dirname + '/date.js')
const weather = require('./weatherDb.js');
const page = require('./renderPage.js');
const db = require('./dbFile.js');


const app = db.dbData.app;
const passport = db.dbData.passport;
const List = db.dbData.List;
const Item = db.dbData.Item;
const User = db.dbData.User;

app.get("/", function (req, res) {

  var items = [{
    itemName: "This is your To-Do List"
  }, {
    itemName: "Hit the plus button to add new items"
  }];
  var listTitle = ((typeof req.query.List === "undefined") ? "Home" : req.query.List);

  if (!req.isAuthenticated()) {
    page.renderPage('index', listTitle, items, false, res);
  } else {
    User.findOne({
      username: req.user.username
    }, (err, foundItem) => {
      if (!err) {
        foundItem.customList.forEach(element => {
          if (element.listName === listTitle) {
            items = element.listItmes.slice();
          }
        });
        page.renderPage('index', listTitle, items, true, res);
      } else {
        console.log(err);
      }
    });
  }
});


app.get("/register", (req, res) => {
  res.render('register');
});


app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});


app.get("/displayLists", (req, res) => {

  if (req.isAuthenticated()) {
    User.findOne({
      username: req.user.username
    }, (err, foundItem) => {
      if (!err) {
        page.renderPage('listDisplay', "My Custom Lists", foundItem.customList, true, res);
      } else {
        console.log(err);
      }
    });
  }
});


app.get("/fetchWeatherData", (req, res) => {

  weather.updateWeatherData();
  weather.Model.findOne({
    city: "Sandi"
  }, (err, data) => {
    res.json(data);
  });
});


app.get("/fetchTime", (req, res) => {
  let time = {
    time: date.formatAMPM()
  }
  res.json(time);
})


app.get("/:customListName", (req, res) => {
  //console.log(req.params.customListName);
  res.redirect("/?List=" + req.params.customListName);
});


app.post("/deleteList", (req, res) => {
  //console.log(req.body.delete);
  if (req.isAuthenticated()) {

    User.findOne({
      username: req.user.username
    }, (err, foundItem) => {
      foundItem.customList = foundItem.customList.filter(list => String(list._id) !== req.body.delete);
      //console.log(foundItem.customList);
      foundItem.save();
    });
    res.redirect("/displayLists");
  }
});


app.post("/login", passport.authenticate("local", {
  successRedirect: '/',
  failureRedirect: '/'
}));


app.post("/register", (req, res) => {

  const customLIst = new List({
    listName: "Home",
    listItmes: []
  });

  User.register({
    username: req.body.username,
    customList: customLIst
  }, req.body.password, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      // This invoke login method to automatically log in the newly registered user, by creating a session.
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});


app.post("/add", function (req, res) {

  if (req.isAuthenticated()) {
    User.findOne({
      username: req.user.username
    }, (err, foundItem) => {
      if (!err) {
        const newItem = new Item({
          itemName: req.body.newItem
        });
        foundItem.customList.forEach(element => {
          if (element.listName === req.body.list) {
            element.listItmes.push(newItem);
            foundItem.save();
          }
        });
      } else {
        console.log(err);
      }
    });

    res.redirect("/?List=" + req.body.list);
  }
});


app.post("/delete", function (req, res) {

  if (req.isAuthenticated()) {
    var checkedBoxesId;
    if (Array.isArray(req.body.checkBox))
      checkedBoxesId = req.body.checkBox;
    else
      checkedBoxesId = [req.body.checkBox];

    User.findOne({
      username: req.user.username
    }, (err, foundItem) => {
      foundItem.customList.forEach(element => {
        if (element.listName === req.body.delete) {
          element.listItmes = element.listItmes.filter(value => {
            return String(value._id) !== checkedBoxesId.find(element => element === String(value._id));
          });
          foundItem.save();
        }
      });
    });
    res.redirect("/?List=" + req.body.delete);
  }
});


app.post("/customList", (req, res) => {

  if (req.isAuthenticated()) {
    User.findOne({
      username: req.user.username
    }, (err, foundItem) => {
      if (!err) {
        const newList = new List({
          listName: req.body.newList,
          listItmes: []
        });
        foundItem.customList.push(newList);
        foundItem.save();
      }
    });
    res.redirect('/?List=' + req.body.newList);
  }
});


app.listen(3000, function () {
  console.log("Server is running on port 3000");
});