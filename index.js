require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const { createServer } = require("http");
const router = require("./routes/router");
const server = createServer(app);
const port = process.env.PORT || 9000;
const uri = process.env.DB_HOST;
app.use(cors());
app.use(express.json());
app.use("/api", router);
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connect");
  })
  .catch((err) => {
    console.log(err);
  });


server.listen(port);


