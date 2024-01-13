const { default: mongoose } = require("mongoose");
const {
  User,
  Verify,
  Forgot,
  Admin,
  UserAcademy,
} = require("../models/userModel");
const { sendEmail } = require("../mail");
const bcrypt = require("bcrypt");
const { generateRandomColor } = require("../colors/generate");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const { default: jwtDecode } = require("jwt-decode");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY_CLOUD,
  api_secret: process.env.API_SECRET_CLOUD,
});

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
      const link = `${process.env.MAIL_CLIENT_DEPLOY}/user/verify/${kode}`;
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
        const currentDate = new Date();
        const dateExpired = new Date(check.dateExpired);
        if (currentDate < dateExpired) {
          return res.status(401).json({
            status: "Failed",
            message:
              "You have already sent the code. Please wait until the current code expires.",
          });
        }
      }
      const code = Math.floor(1000 + Math.random() * 9000);
      const today = new Date();
      const expirationDate = new Date(today);
      expirationDate.setMinutes(today.getMinutes() + 5); 
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
      let { code } = req.query;
      let body = req.body;
      const ObjectId = mongoose.Types.ObjectId;
      const check = await Forgot.findOne({ code: code });
      if (!body.email || !body.password) {
        return res.status(400).json({
          status: "Failed",
          message: "Please enter your password",
        });
      }
      if (!check) {
        return res.status(404).json({
          status: "Failed",
          message: "Code's not found",
        });
      }
      const data = await User.findOne({
        $and: [{ email: body.email }, { _id: new ObjectId(check.id_user) }],
      });
      if (!data) {
        return res.status(404).json({
          status: "Failed",
          message: "User's not found",
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
      await User.updateOne(
        { _id: new ObjectId(data._id) },
        { password: body.password }
      );
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

  async profle(req, res) {
    try {
      const headers = req.headers;
      const ObjectId = mongoose.Types.ObjectId;
      let { id } = jwtDecode(headers.authorization);
      const data = await User.aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "user-academies",
            localField: "_id",
            foreignField: "id_user",
            as: "academy",
          },
        },
        {
          $project: {
            password: 0,
            token: 0,
          },
        },
      ]);

      if (data.length == 0) {
        return res.status(404).json({
          status: "Failed",
          message: "User's not found",
        });
      }
      return res.status(200).json({
        status: "Success",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: error,
      });
    }
  }

  async updateProfile(req, res) {
    try {
      let headers = req.headers;
      const ObjectId = mongoose.Types.ObjectId;
      let id = jwtDecode(headers.authorization).id;
      let body = req.body;
      let checkUser = await User.find({ _id: new ObjectId(id) });
      if (!checkUser) {
        return res.status(404).json({
          status: "Failed",
          message: "User's not found",
        });
      }
      if (req.file?.path != undefined) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          req.file.path,
          { folder: "/pulse/users" }
        );
        body.photo_profile = secure_url;
        body.public_id = public_id;
        if (checkUser.photo_profile != null) {
          await cloudinary.uploader.destroy(checkUser.public_id);
        }
      } else {
        body.photo_profile = checkUser.photo_profile;
        body.public_id = checkUser.public_id;
      }
      await User.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            username: body.username,
            name: body.name,
            photo_profile: body.photo_profile,
            public_id: body.public_id,
          },
        }
      );
      return res.status(200).json({
        status: "Success",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: error,
      });
    }
  }

  async searchUser(req, res) {
    try {
      const { page = 1, limit = 8, key } = req.query;
      const size = (parseInt(page) - 1) * parseInt(limit);
      let pipeline = [
        {
          $project: {
            username: "$username",
            name: "$name",
            status: "$status",
            photo_profile: "$photo_profile",
          },
        },
        {
          $skip: size,
        },
        {
          $limit: parseInt(limit),
        },
      ];

      // Add $match stage if key is present
      if (key) {
        pipeline.splice(1, 0, {
          $match: {
            $or: [
              { name: { $regex: key, $options: "i" } },
              { username: { $regex: key, $options: "i" } },
            ],
          },
        });
      }

      let user = await User.aggregate(pipeline);
      return res.status(200).json({
        status: "Success",
        data: user,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: error,
      });
    }
  }

  async addAcademy(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const body = req.body;

      const headers = req.headers;
      const id_user = jwtDecode(headers.authorization).id;
      const user = await User.findOne({ _id: new ObjectId(id_user) });
      if (!user) {
        return res.status(404).json({
          status: "Failed",
          message: "User's not found",
        });
      }
      const academy = await UserAcademy.findOne({
        id_lesson: new ObjectId(body.id_lesson),
      });
      if (academy) {
        return res.status(401).json({
          status: "Failed",
          message: "Academy's already on your list",
        });
      }
      body.id_user = id_user;
      body.id_lesson = body.id_lesson;
      const data = await UserAcademy.create(body);
      return res.status(200).json({
        status: "Success",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: error,
      });
    }
  }
  async getAcademy(req, res) {
    try {
      const headers = req.headers;
      const ObjectId = mongoose.Types.ObjectId;
      const { id } = jwtDecode(headers.authorization);
      const data = await UserAcademy.aggregate([
        { $match: { id_user: new ObjectId(id) } },
        {
          $lookup: {
            from: "lessons",
            localField: "id_lesson",
            foreignField: "_id",
            as: "info_lesson",
          },
        },
        { $unwind: "$info_lesson" },
        {
          $project: {
            _id: 1, // Include other fields you want to keep from UserAcademy
            // Include fields from the lessons collection
            id_lesson: "$info_lesson._id",
            title: "$info_lesson.title",
            description: "$info_lesson.description",
            photo_url: "$info_lesson.photo_url",
            public_id: "$info_lesson.public_id",
            categories: "$info_lesson.id_category",
            createdAt: "$info_lesson.createdAt",
            updatedAt: "$info_lesson.updatedAt",
            // Add more fields as needed
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
        message: error,
      });
    }
  }
  async updateAcademy(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const headers = req.headers;
      const { id } = req.params;
      const id_user = jwtDecode(headers.authorization).id;
      const body = req.body;
      const academy = await UserAcademy.findOne({
        $and: [
          { id_lesson: new ObjectId(id) },
          { id_user: new ObjectId(id_user) },
        ],
      });
      if (!academy) {
        return res.status(404).json({
          status: "Failed",
          message: "Academy's not found",
        });
      }
      const data = await UserAcademy.updateOne(
        { id_lesson: new ObjectId(id) },
        {
          $set: {
            progress: body.progress,
          },
        }
      );
      return res.status(200).json({
        status: "Success",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: error,
      });
    }
  }
  // async initiateGoogle(req, res) {
  //   try {
  //     const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI_LOCAL}&response_type=code&scope=profile email`;
  //     res.redirect(url);
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({
  //       status: "Failed",
  //       message: error,
  //     });
  //   }
  // }

  // async signGoogle(req, res) {
  //   try {
  //     // Passport.js middleware would have populated user information in req.user
  //     const googleUser = req.user;

  //     // Check if the Google user exists in your database
  //     let isUserExist = await User.findOne({ googleId: googleUser.id });

  //     // If the user doesn't exist, register them in your database
  //     if (!isUserExist) {
  //       isUserExist = await User.create({
  //         googleId: googleUser.id,
  //         username: googleUser.displayName || "GoogleUser", // Default to 'GoogleUser' if display name is not available
  //         email: googleUser.emails[0].value,
  //         // Other fields...
  //       });
  //     }

  //     // Perform any additional checks or actions based on your requirements
  //     // ...

  //     // Check the user's verification status
  //     if (!isUserExist.isVerified) {
  //       return res.status(401).json({
  //         status: "Failed",
  //         message: "Your email's not verified. Check your email",
  //       });
  //     }

  //     // Verify the user's password (you can skip this for Google Sign-In)
  //     // const verify = bcrypt.compareSync(body.password, isUserExist.password);
  //     // if (!verify) {
  //     //   return res.status(401).json({
  //     //     status: 'Failed',
  //     //     message: 'Your password is wrong',
  //     //   });
  //     // }

  //     // Generate JWT token for the user
  //     const token = jwt.sign(
  //       {
  //         email: isUserExist.email,
  //         id: isUserExist._id,
  //         name: isUserExist.name,
  //       },
  //       process.env.JWT_ACCESS_TOKEN,
  //       { expiresIn: "7d" }
  //     );

  //     // Update user token in the database
  //     await User.updateOne(
  //       { _id: isUserExist._id },
  //       { $set: { token: token } }
  //     );

  //     return res.status(200).json({
  //       status: "Success",
  //       token: token,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({
  //       status: "Failed",
  //       message: error.message,
  //     });
  //   }
  // }
}

module.exports = new userControl();
