const { default: mongoose } = require("mongoose");
const { User, Verify, Forgot, Admin } = require("../models/userModel");
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
      const link = `${process.env.MAIL_CLIENT_URL}/user/verify/${kode}`;
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
      return res.status(200).json({
        status: "Success",
        message: "Verification has been sent to your email",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
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
          type: "user",
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

  async auth(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;

      const { authorization } = req.headers;
      if (authorization === undefined)
        return res
          .status(401)
          .json({ status: "Failed", message: "Token is required" });
      const token = authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_ACCESS_TOKEN, async (err, decode) => {
        if (err) {
          return res.status(401).json({
            status: "Failed",
            message: "Token is not valid",
          });
        }
        const { id, email, name } = jwt.decode(token);
        const newToken = jwt.sign(
          { email, id, name },
          process.env.JWT_ACCESS_TOKEN,
          {
            expiresIn: "7d",
          }
        );
        await User.updateOne(
          {
            _id: new ObjectId(jwtDecode(token).id),
          },
          { $set: { token: newToken } }
        );
        return res.status(200).json({
          status: "Success",
          token: newToken,
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
      });
    }
  }

  async forgot_password(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;

      const { email } = req.body;
      const data = await User.findOne({ email: email });
      if (!data) {
        return res.status(404).json({
          status: "Failed",
          message: "User's not found",
        });
      }
      const check = await Forgot.findOne({ id_user: new ObjectId(data._id) });
      if (check) {
        return res.status(401).json({
          status: "Failed",
          message: "You have sent the code",
        });
      }
      const code = Math.floor(1000 + Math.random() * 9000);
      const today = new Date();
      const expirationDate = new Date(today);
      expirationDate.setDate(today.getDate() + 7);
      let expired = expirationDate.toISOString();
      const context = {
        code: code,
        name: data.name,
        dateExpired: expired,
      };
      const mail = await sendEmail(
        email,
        "Forgot Password",
        "forgot_password",
        context
      );
      if (mail == " error") {
        return res.status(422).json({
          status: "Failed",
          message: "Email's not sent",
        });
      }
      await Forgot.create({
        id_user: data._id,
        code: code,
        dateExpired: expired,
      });
      return res.status(200).json({
        status: "Success",
        message: "The code has been sent to your email",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
      });
    }
  }
  async resendEmail(req, res) {
    try {
      const { email } = req.body;
      const data = await User.findOne({ email: email });
      if (!data) {
        return res.status(404).json({
          status: "Failed",
          message: "User's not found",
        });
      }

      const code = Math.floor(1000 + Math.random() * 9000);
      const today = new Date();
      const expirationDate = new Date(today);
      expirationDate.setDate(today.getDate() + 7);
      let expired = expirationDate.toISOString();
      const context = {
        code: code,
        name: data.name,
        dateExpired: expired,
      };
      const mail = await sendEmail(
        email,
        "Forgot Password",
        "forgot_password",
        context
      );
      if (mail == " error") {
        return res.status(422).json({
          status: "Failed",
          message: "Email's not sent",
        });
      }
      await Forgot.deleteOne({
        id_user: data._id,
      });
      await Forgot.create({
        id_user: data._id,
        code: code,
        dateExpired: expired,
      });
      return res.status(200).json({
        status: "Success",
        message: "The code has been sent to your email",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
      });
    }
  }
  async verifyForgot(req, res) {
    try {
      const { email } = req.params;
      const { code } = req.body;
      const data = await User.findOne({ email: email });
      if (!data) {
        return res.status(404).json({
          status: "Failed",
          message: "User's not found",
        });
      }
      const check = await Forgot.findOne({ code: code });
      if (!check) {
        return res.status(404).json({
          status: "Failed",
          message: "Code's not found",
        });
      }
      if (check.code != code) {
        return res.status(401).json({
          status: "Failed",
          message: "Code's not valid",
        });
      }
      // check expired
      const currentTime = new Date().getTime();
      if (currentTime > check.dateExpired) {
        return res.status(401).json({
          status: "Failed",
          message: "Code's expired. Please generate a new code",
        });
      }
      return res
        .status(200)
        .json({ status: "Success", message: "success to verify code" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: error,
      });
    }
  }
  async resetPassword(req, res) {
    try {
      let { code } = req.params;
      let body = req.body;
      const ObjectId = mongoose.Types.ObjectId;
      const data = await User.findOne({ email: body.email });
      if (!data) {
        return res.status(404).json({
          status: "Failed",
          message: "User's not found",
        });
      }
      const check = await Forgot.findOne({ code: code });
      if (!check) {
        return res.status(404).json({
          status: "Failed",
          message: "Code's not found",
        });
      }
      if (check.code != code) {
        return res.status(401).json({
          status: "Failed",
          message: "Code's not valid",
        });
      }
      await Forgot.deleteOne({ id_user: new ObjectId(data._id) });
      body.password = bcrypt.hashSync(body.password, 10);
      await User.updateOne({ _id: new ObjectId(data._id) });
      return res.status(200).json({
        status: "Success",
        message: "Password's updated",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: error,
      });
    }
  }

  async initiateGoogle(req, res) {
    try {
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI_LOCAL}&response_type=code&scope=profile email`;
      res.redirect(url);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: error,
      });
    }
  }

  async signGoogle(req, res) {
    try {
      // Passport.js middleware would have populated user information in req.user
      const googleUser = req.user;

      // Check if the Google user exists in your database
      let isUserExist = await User.findOne({ googleId: googleUser.id });

      // If the user doesn't exist, register them in your database
      if (!isUserExist) {
        isUserExist = await User.create({
          googleId: googleUser.id,
          username: googleUser.displayName || "GoogleUser", // Default to 'GoogleUser' if display name is not available
          email: googleUser.emails[0].value,
          // Other fields...
        });
      }

      // Perform any additional checks or actions based on your requirements
      // ...

      // Check the user's verification status
      if (!isUserExist.isVerified) {
        return res.status(401).json({
          status: "Failed",
          message: "Your email's not verified. Check your email",
        });
      }

      // Verify the user's password (you can skip this for Google Sign-In)
      // const verify = bcrypt.compareSync(body.password, isUserExist.password);
      // if (!verify) {
      //   return res.status(401).json({
      //     status: 'Failed',
      //     message: 'Your password is wrong',
      //   });
      // }

      // Generate JWT token for the user
      const token = jwt.sign(
        {
          email: isUserExist.email,
          id: isUserExist._id,
          name: isUserExist.name,
        },
        process.env.JWT_ACCESS_TOKEN,
        { expiresIn: "7d" }
      );

      // Update user token in the database
      await User.updateOne(
        { _id: isUserExist._id },
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

  // admin
 
}

module.exports = new userControl();
