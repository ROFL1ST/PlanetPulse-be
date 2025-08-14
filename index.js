require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose"); 
const cors = require("cors");
const session = require('express-session');
const app = express();
const { createServer } = require("http");
const router = require("./routes/router");
const server = createServer(app);
const port = process.env.PORT || 9000;
const uri = process.env.DB_HOST;
app.use(cors());
app.use(express.json());

  

app.use("/api", router);
app.use((req, res, next) => {
  const currentTime = new Date().toISOString();
  console.log(`[${currentTime}] ${req.method} request to ${req.url}`);
  next();
});


mongoose
  .connect(uri)
  .then(() => {
    console.log("Connect");
  })
  .catch((err) => {
    console.log(err);
  });


  // add logs in terminal everytime someone access the server


  

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


