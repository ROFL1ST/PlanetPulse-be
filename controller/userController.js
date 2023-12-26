const { default: mongoose } = require("mongoose");
const { User, Verify } = require("../models/userModel");
const { sendEmail } = require("../mail");
const bcrypt = require("bcrypt");
const { generateRandomColor } = require("../colors/generate");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { default: jwtDecode } = require("jwt-decode");

class userControl {
  async register(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const body = req.body;
      if (
        !body ||
        !body.email ||
        !body.username ||
        !body.name ||
        !body.password
      )
        return res.status(400).json({
          status: "Failed",
          message: "Please enter your username, password and name correctly",
        });
      let isEmailExist = await User.findOne({
        email: body.email,
      });
      if (isEmailExist) {
        return res.status(400).json({
          status: "Failed",
          message: "Your email is already exist",
        });
      }
      let isUsernameExist = await User.findOne({
        username: body.username,
      });
      if (isUsernameExist) {
        return res.status(400).json({
          status: "Failed",
          message: "Your username is already exist",
        });
      }
      body.password = bcrypt.hashSync(body.password, 10);
      const randomColor = generateRandomColor();
      body.default_color = randomColor;
      let newUser = await User.create(body);
      let kode = crypto.randomBytes(32).toString("hex");
      const link = `${process.env.MAIL_CLIENT_URL}/verify/${kode}`;
      const context = {
        url: link,
      };
      const mail = await sendEmail(
        newUser.email,
        "Verify email",
        "verify_email",
        context
      );
      if (mail == " error") {
        return res.status(422).json({
          status: "Failed",
          message: "Email's not sent",
        });
      }
      await Verify.create({
        id_user: new ObjectId(newUser._id),
        code: kode,
      });
      res.status(200).json({
        status: "Success",
        message: "Verification has been sent to your email",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "Failed",
        message: "Something's wrong",
        error: error,
      });
    }
  }

  async verify(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const { id } = req.params;
      const user = await Verify.findOne({ code: id });
      if (!user) {
        return res.status(404).json({ message: "Invalid verification code" });
      }
      if (user.isUsed) {
        return res.sendFile(__dirname + "/public/verification-used.html");
      }
      await User.updateOne(
        {
          _id: new ObjectId(user.id_user),
        },
        {
          $set: { isVerified: true },
        }
      );
      await Verify.updateOne(
        {
          code: id,
        },
        {
          $set: {
            isUsed: true,
          },
        }
      );
     
      return res.sendFile(__dirname + "/public/verification-success.html");
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "Failed",
        message: "Something's wrong",
        error: error,
      });
    }
  }

  async login(req, res) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
    
      let body = req.body;
      let isUserExist = await User.findOne({
        username: body.username,
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
      if (!isUserExist.isVerified) {
        return res.status(401).json({
          status: "Failed",
          message: "Your email's not verified. Check your email",
        });
      }
      const token = jwt.sign(
        {
          email: isUserExist.email,
          id: isUserExist._id,
          name: isUserExist.name,
        },
        process.env.JWT_ACCESS_TOKEN,
        { expiresIn: "7d" }
      );
      await User.updateOne(
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
      });
    }
  }

}

module.exports = new userControl();
