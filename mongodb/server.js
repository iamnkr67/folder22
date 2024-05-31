const express = require("express");
const session = require("express-session");
const path = require("path");
const multer = require("multer");
const { MongoClient } = require("mongodb");
const { emit } = require("process");

const uri =
  "mongodb+srv://nitesh:nkr1483@database01.3liapmy.mongodb.net/?retryWrites=true&w=majority&appName=DataBase01";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    saveUninitialized: true,
    resave: false,
    secret: "nameee",
  })
);

app.set("view engine", "ejs");
app.set("views", "./views");

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
});

const upload = multer({ storage: storage });

let database;
//connection
async function connect(cb) {
  try {
    const client = await new MongoClient(uri).connect();
    const db = await client.db("UserDetails");
    cb(db);
    console.log("Connected to DB");
  } catch (err) {
    console.log(err);
  }
}

connect((db) => {
  database = db;
});

app.get("/", async (req, res) => {
  if (req.session.userEmail) {
    try {
      const user = await database
        .collection("Users")
        .findOne({ email: req.session.userEmail });
      if (user) {
        res.render("home", { user });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.redirect("/login");
  }
});

const checkAuth = (req, res, next) => {
  if (req.session.userEmail) {
    res.redirect("/");
  } else {
    next();
  }
};

app.get("/login", checkAuth, (req, res) => {
  res.render("login");
});
app.get("/signup", checkAuth, (req, res) => {
  res.render("signup");
});

app.post("/signup", upload.single("file"), async (req, res) => {
  const { name, email, pass } = req.body;
  try {
    const user = await database.collection("Users").findOne({ email: email });
    if (user) {
      res.redirect("/login");
    } else {
      const newUser = await database.collection("Users").insertOne({
        name: name,
        email: email,
        pass: pass,
        profile: req.file.filename,
      });

      if (newUser) {
        req.session.userEmail = newUser.email;
        res.render("home", { user });
      } else {
        res.send("Failed to sign up");
      }
    }
  } catch (err) {
    res.send("Something went wrong");
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const { email, pass } = req.body;
  try {
    const user = await database.collection("Users").findOne({ email: email });

    if (user && user.pass === pass) {
      req.session.userEmail = user.email;
      res.render("home", { user });
    } else {
      res.send("User not exist or wrong password");
    }
  } catch (err) {
    console.log("Something went wrong", err);
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("App started");
});
