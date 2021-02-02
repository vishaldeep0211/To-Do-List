require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');

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

mongoose.connect("mongodb+srv://admin-vishal:"+process.env.ATLAS_PASS+"@mycluster.wczve.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, err => {
  if (err) {
    console.log(err);
  } else {
    console.log("Mongo is running on port 27017");
  }
});

// mongoose.connect("mongodb://localhost:27017/todolistDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }, function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Mongo is runnig on port 27017");
//   }
// });

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

exports.dbData = {
    app: app,
    passport: passport,
    Item: Item,
    List: List,
    User: User
}