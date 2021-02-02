const _ = require('lodash');
const date = require(__dirname + '/date.js')
const page = require('./renderPage.js');
const db = require('./dbFile.js');


const app = db.dbData.app;
const passport = db.dbData.passport;
const List = db.dbData.List;
const Item = db.dbData.Item;
const User = db.dbData.User;

app.get("/", function (req, res) {

  var items = [];

  if (!req.isAuthenticated()) {
    page.renderPage('index', "Home", items, false, res);
  }
  else {
    User.findOne({
      username: req.user.username
    }, (err, foundItem) => {
      if (!err) {

        if(typeof req.query.List === "undefined")
        {
          if(foundItem.customList.length !== 0)
          {
            items = foundItem.customList[0].listItmes.slice();
            page.renderPage('index', foundItem.customList[0].listName, items, true, res);
          }
          else{
            res.redirect("/displayLists");
          }
        }
        else{
          foundItem.customList.forEach(element => {
            if (element.listName === req.query.List) {
              items = element.listItmes.slice();
            }
          });
          // console.log(items);
          page.renderPage('index', req.query.List, items, true, res);
        }

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

  const weather = require('./weatherDb.js');
  weather.updateWeatherData();
  weather.Model.findOne({
    city: "Sandi"
  }, (err, data) => {
    if(!err)
      res.json(data);
    else
      console.log(err);
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


app.post("/login", passport.authenticate("local", {
  successRedirect: '/',
  failureRedirect: '/'
}));


app.post("/register", (req, res) => {

  User.register({
    username: req.body.username,
    customList: []
  }, req.body.password, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      // This invoke login method to automatically log in the newly registered user, by creating a session.
      passport.authenticate("local")(req, res, function () {
        res.redirect("/displayLists");
      });
    }
  });
});


app.post("/updateList", function (req, res) {

  if (req.isAuthenticated()) {

    let listName = req.body.list.split(",")[0];
    let requestType = req.body.list.split(",")[1];

    User.findOne({
      username: req.user.username
    }, (err, foundItem) => {
      if (!err) {
        if(requestType === "add")
        {
          const newItem = new Item({
            itemName: req.body.newItem
          });
          foundItem.customList.forEach(element => {
            if (element.listName === listName) {
              element.listItmes.push(newItem);
            }
          });
        }
        else{
          var checkedBoxesId;
          if (Array.isArray(req.body.checkBox))
            checkedBoxesId = req.body.checkBox;
          else
            checkedBoxesId = [req.body.checkBox];

          foundItem.customList.forEach(element => {
            if (element.listName === listName) {
              element.listItmes = element.listItmes.filter(value => {
                return String(value._id) !== checkedBoxesId.find(element => element === String(value._id));
              });
            }
          });
        }
        foundItem.save();
      } else {
        console.log(err);
      }
    });

    res.redirect("/?List=" + listName);
  }
});


app.post("/updatecustomLists", (req, res) => {

  let listName = req.body.queryType.split(",")[0];
  let requestType = req.body.queryType.split(",")[1];

  if (req.isAuthenticated()) {
    User.findOne({
      username: req.user.username
    }, (err, foundItem) => {
      if (!err) {
        if(requestType === "add")
        {
          const newList = new List({
            listName: req.body.newItem,
            listItmes: []
          });
          foundItem.customList.push(newList);
          foundItem.save();
          res.redirect('/?List=' + req.body.newItem);
        }
        else{
          var checkedBoxesId;
          if (Array.isArray(req.body.checkBox))
            checkedBoxesId = req.body.checkBox;
          else
            checkedBoxesId = [req.body.checkBox];

          foundItem.customList = foundItem.customList.filter(list => {
            return String(list._id) !== checkedBoxesId.find(element => element === String(list._id));
          });
          foundItem.save();
          res.redirect("/displayLists");
        }
      }
    });
  }
});


app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});