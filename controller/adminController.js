const { default: mongoose } = require("mongoose");
const { User, Verify, Forgot, Admin, UserLog } = require("../models/userModel");
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
      if (!body || !body.email || !body.username || !body.password)
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

  async getLog(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const data = await UserLog.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "id_user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            username: "$user.username",
            name: "$user.name",
            email: "$user.email",
            dateLog: 1,
            action: 1,
            id_user: 1,
            _id: 1,
            photo_profile: "$user.photo_profile",
            isVerified: "$user.isVerified",
          },
        },
      ]);
      return res.status(200).json({
        status: "Success",
        data: data,
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

module.exports = new adminController();
