require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

async function RunDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1/userDB");
    console.log("Connected to database.");
    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  } catch (DBerr) {
    console.log("Failed connect to database.");
  }
}

RunDB().catch((err) => {
  console.log("error check mongodb server.");
});

//  userSchema email  password
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//  create model
const userModle = mongoose.model("user", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    const { username, password } = req.body;

    const saltRounds = 10;

    try {
      const doc = await userModle.findOne({ email: username });

      if (doc) {
        const result = await bcrypt.compare(password, doc.password);
        if (result) {
          res.render("secrets");
        } else {
          res.send({ message: "Your password not correct !!" });
        }
      } else {
        res.send({ message: "You are not registered yet!" });
      }
    } catch (errFindUser) {}
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post(async (req, res) => {
    const { username, password } = req.body;
    const saltRounds = 10;
    try {
      const hash = await bcrypt.hash(password, saltRounds);
      const new_user = userModle({
        email: username,
        password: hash,
      });
      await new_user.save();
      res.render("secrets");
    } catch (err) {
      res.send({ message: "Failed to register the new user: " + err });
    }
  });

app
  .route("/submit")
  .get((req, res) => {})
  .post((req, res) => {});
