require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const https = require('https');
const _ = require('lodash');
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');
const date = require(__dirname + '/date.js')
const weather = require('./weatherDb.js');
const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');

var expiryDate = new Date("July 21, 2021 01:15:00");

app.use(session({
  cookie: {
    expires: expiryDate
  },
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Mongo is runnig on port 27017");
  }
});

const weatherSchema = new mongoose.Schema({
  city: String,
  temperature: String,
  weatherDescription: String,
  weatherIconUrl: String
});

const Weather = mongoose.model("Weather", weatherSchema);

const itemsSchema = new mongoose.Schema({
  itemName: String
});

const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  listName: String,
  listItmes: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

const userSchema = new mongoose.Schema({
  username: String,
  customList: [listSchema]
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {

  const city = "Sandi"
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + process.env.APIKEY + "&units=metric";
  https.get(url, response => {
    response.on("data", data => {

      const weatherData = JSON.parse(data);
      const temp = weatherData.main.temp;
      const icon = weatherData.weather[0].icon;
      const img_url = "http://openweathermap.org/img/wn/" + icon + "@2x.png"
      const weatherDescription = weatherData.weather[0].description;

      var items = []
      var isLoggedIn;
      var listTitle = ((typeof req.query.List === "undefined") ? "Home" : req.query.List);
      //console.log(req.user);
      if (!req.isAuthenticated()) {
        items.push({
          itemName: "This is your To-Do List"
        });
        items.push({
          itemName: "Hit the plus button to add new items"
        });
        isLoggedIn = false;
        res.render('index', {
          currTime: date.formatAMPM(),
          ListTitle: listTitle,
          KindofDay: date.getDate(),
          newItem: items,
          temperature: Math.round(temp),
          img_url: img_url,
          weatherDescription: _.startCase(weatherDescription),
          isLoggedIn: isLoggedIn
        });

      } else {
        isLoggedIn = true;
        User.findOne({
          username: req.user.username
        }, (err, foundItem) => {
          if (!err) {
            foundItem.customList.forEach(element => {
              if (element.listName === listTitle) {
                items = element.listItmes.slice();
              }
            });
          }
          res.render('index', {
            currTime: date.formatAMPM(),
            ListTitle: listTitle,
            KindofDay: date.getDate(),
            newItem: items,
            temperature: Math.round(temp),
            img_url: img_url,
            weatherDescription: _.startCase(weatherDescription),
            isLoggedIn: isLoggedIn
          });
        });
      }
    });
  });
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
        weather.updateWeatherData(Weather);
        Weather.findOne({
          city: "Sandi"
        }, (err, data) => {

          res.render("listDisplay", {
            currTime: date.formatAMPM(),
            customLists: foundItem.customList,
            KindofDay: date.getDate(),
            temperature: Math.round(data.temperature),
            img_url: data.weatherIconUrl,
            weatherDescription: _.startCase(data.weatherDescription),
            isLoggedIn: true
          });
        });
      } else {
        console.log(err);
      }
    });
  }
});

app.get("/fetchWeatherData", (req, res) => {
  console.log("Updating Weather Data");
  weather.updateWeatherData(Weather);
  Weather.findOne({
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
  console.log(req.params.customListName);
  res.redirect("/?List=" + req.params.customListName);
});

app.post("/deleteList", (req, res) => {
  //console.log(req.body.delete);
  if (req.isAuthenticated()) {

    User.findOne({
      username: req.user.username
    }, (err, foundItem) => {
      foundItem.customList = foundItem.customList.filter(list => String(list._id) !== req.body.delete);
      console.log(foundItem.customList);
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