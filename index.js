require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require('express-session');
const app = express();
const { createServer } = require("http");
const router = require("./routes/router");
const { passport } = require("./middleware/passport");
const server = createServer(app);
const port = process.env.PORT || 9000;
const uri = process.env.DB_HOST;
app.use(cors());
app.use(express.json());
app.use(
    session({
      secret: process.env.GOOGLE_CLIENT_SECRET, // Change this to a secure, random value
      resave: false,
      saveUninitialized: true,
    })
  );
  
app.use(passport.initialize());
app.use(passport.session());
app.use("/", router);
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connect");
  })
  .catch((err) => {
    console.log(err);
  });


server.listen(port);


