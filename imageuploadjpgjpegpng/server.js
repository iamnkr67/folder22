const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") {
      cb(null, "public/jpg");
    } else if (ext === ".png") {
      cb(null, "public/other");
    } else {
      cb({ message: "File type not allowed" }, null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: 2 * 1024 * 1024,
}).single("file");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/upload/image", upload, (req, res) => {
  if (req.file) {
    res.status(200).json({ message: "File uploaded successfully" });
  } else {
    res.status(400).json({ message: "No file uploaded" });
  }
});

app.listen(3200, () => {
  console.log("App running on 3200");
});
