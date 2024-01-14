const { default: mongoose } = require("mongoose");
const { User, Verify, Forgot, Admin } = require("../models/userModel");
const { sendEmail } = require("../mail");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { default: jwtDecode } = require("jwt-decode");

class adminController {
  async registerAdmin(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const body = req.body;
      console.log(body);
      const key = req.headers.key;
      if (!key || key !== process.env.KEY) {
        return res.status(401).json({
          status: "Failed",
          message: "Invalid Key!",
        });
      }
      if (
        !body ||
        !body.email ||
        !body.username ||
        !body.password
      )
        return res.status(400).json({
          status: "Failed",
          message: "Please enter your username, password and email correctly",
        });
      let isEmailExist = await Admin.findOne({
        email: body.email,
      });
      if (isEmailExist) {
        return res.status(400).json({
          status: "Failed",
          message: "Your email is already exist",
        });
      }
      let isUsernameExist = await Admin.findOne({
        username: body.username,
      });
      if (isUsernameExist) {
        return res.status(400).json({
          status: "Failed",
          message: "Your username is already exist",
        });
      }
      body.password = bcrypt.hashSync(body.password, 10);
      let newUser = await Admin.create(body);
      return res.status(200).json({
        status: "Success",
        message: "you have registered an account",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: error.message,
      });
    }
  }

  async loginAdmin(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      let body = req.body;
      let isUserExist = await Admin.findOne({
        email: body.email,
      });
      if (!isUserExist) {
        return res.status(404).json({
          status: "Failed",
          message: "User's not found",
        });
      }
      let verify = bcrypt.compareSync(body.password, isUserExist.password);

      if (!verify) {
        return res.status(401).json({
          status: "Failed",
          message: "Your password's wrong",
        });
      }
      const token = jwt.sign(
        {
          email: isUserExist.email,
          id: isUserExist._id,
          username: isUserExist.username,
          type: "admin",
        },
        process.env.JWT_ACCESS_TOKEN
      );
      await Admin.updateOne(
        {
          _id: new ObjectId(jwtDecode(token).id),
        },
        { $set: { token: token } }
      );
      return res.status(200).json({
        status: "Success",
        token: token,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: error.message,
      });
    }
  }
}

module.exports = new adminController()