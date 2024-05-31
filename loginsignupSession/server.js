const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;


app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profilePics");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

const readData = (file) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "data", file)));
const writeData = (file, data) =>
  fs.writeFileSync(
    path.join(__dirname, "data", file),
    JSON.stringify(data, null, 2)
  );


app.post("/signup", (req, res) => {
  const users = readData("users.json");
  const { username, password } = req.body;
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return res.send("Username already exists");
  }
  users.push({ username, password, role: "user" });
  writeData("users.json", users);
  res.send("Signup successful");
});


app.post("/login", (req, res) => {
  const users = readData("users.json");
  const { username, password } = req.body;
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (!user) {
    return res.send("Invalid username or password");
  }
  req.session.user = user;
  res.send("Login successful");
});


const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login.html");
  }
};

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    next();
  } else {
    res.redirect("/dashboard.html");
  }
};


app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login.html");
});


app.get("/dashboard", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});


app.get("/admin", isAuthenticated, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.post(
  "/admin",
  isAuthenticated,
  isAdmin,
  upload.single("profilePic"),
  (req, res) => {
    const userDetails = readData("userdetails.json");
    const { name } = req.body;
    const profilePic = req.file ? req.file.filename : null;
    if (!profilePic) {
      return res.send("Profile picture is required");
    }
    userDetails.push({ name, profilePic });
    writeData("userdetails.json", userDetails);
    res.send("User details uploaded successfully");
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
