const { default: mongoose } = require("mongoose");
const { User, Verify, Forgot, Admin, UserLog } = require("../models/userModel");
const { sendEmail } = require("../mail");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { default: jwtDecode } = require("jwt-decode");
const { Quiz, Stage, Question } = require("../models/lessonModel");

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
        process.env.JWT_ACCESS_TOKEN,
        { expiresIn: "30d" }
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
        const { id, email, username } = jwt.decode(token);
        const newToken = jwt.sign(
          {
            email: email,
            id: id,
            username: username,
            type: "admin",
          },
          process.env.JWT_ACCESS_TOKEN,
          { expiresIn: "30d" }
        );
        await Admin.updateOne(
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

  async totalUser(req, res) {
    try {
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const data = await User.aggregate([
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            photo_profile: 1,
            status: 1,
            isVerified: 1,
          },
        },
      ]);
      const count = data.length;
      return res.status(200).json({
        status: "Success",
        count: count,
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

  async getAllQuiz(req, res) {
    try {
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const data = await Quiz.aggregate([
        {
          $lookup: {
            from: "questions", // Replace 'questions' with the actual name of your questions collection
            localField: "questions",
            foreignField: "_id",
            as: "questions",
          },
        },
        {
          $lookup: {
            from: "stages",
            localField: "id_stages",
            foreignField: "_id",
            as: "stage",
          },
        },
        { $unwind: "$stage" },
        {
          $project: {
            _id: 1,
            title: 1,
            id_stages: 1,
            createdAt: 1,
            updatedAt: 1,
            stage_name: "$stage.name",
            __v: 1,
            questions: {
              $map: {
                input: "$questions",
                as: "question",
                in: {
                  _id: "$$question._id",
                  text: "$$question.text",
                  options: "$$question.options",
                  correctOptionIndex: "$$question.correctOptionIndex",
                },
              },
            },
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

  async getAllStagges(req, res) {
    try {
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      const { key } = req.query;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const data = await Stage.aggregate([
        {
          $lookup: {
            from: "quizzes",
            localField: "_id",
            foreignField: "id_stages",
            as: "quizzes",
          },
        },
        {
          $lookup: {
            from: "lessons",
            localField: "id_lesson",
            foreignField: "_id",
            as: "lessons",
          },
        },
        {
          $lookup: {
            from: "stages-details",
            localField: "_id",
            foreignField: "id_stages",
            as: "detail",
          },
        },
        { $unwind: "$lessons" },
        { $unwind: "$detail" },
        {
          $project: {
            _id: 1,
            name: 1,
            id_lesson: 1,
            difficulty: 1,
            quizzes: "$quizzes",
            detail: "$detail",
            lesson_name: "$lessons.title",
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $match: {
            name: key ? { $regex: key, $options: "i" } : { $exists: true },
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

  // question
  async addQuestion(req, res) {
    try {
      let headers = req.headers;
      let body = req.body;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const question = await Question.create({
        text: body.text,
        options: body.options,
        correctOptionIndex: body.correctOptionIndex,
      });
      return res.status(200).json({
        status: "Success",
        data: question,
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

  async addBulkQuestion(req, res) {
    try {
      let headers = req.headers;
      let body = req.body;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const questionsData = body;

      if (!Array.isArray(questionsData) || questionsData.length === 0) {
        return res.status(400).json({
          status: "Failed",
          message: "Invalid data format",
        });
      }

      const questions = await Question.insertMany(questionsData);
      return res.status(200).json({
        status: "Success",
        data: questions,
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
  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const body = req.body;
      const ObjectId = mongoose.Types.ObjectId;
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const check = await Question.findOne({ _id: new ObjectId(id) });
      if (!check) {
        return res
          .status(404)
          .json({ status: "Failed", message: "Question's not found" });
      }
      console.log(body);
      await Question.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            text: body.text,
            options: body.options,
            correctOptionIndex: body.correctOptionIndex,
          },
        }
      );
      return res.status(200).json({ status: "Success" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: "Something's wrong",
        error: error,
      });
    }
  }

  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const ObjectId = mongoose.Types.ObjectId;
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const check = await Question.findOne({ _id: new ObjectId(id) });
      if (!check) {
        return res
          .status(404)
          .json({ status: "Failed", message: "Question's not found" });
      }
      await Question.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ status: "Success" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: "Something's wrong",
        error: error,
      });
    }
  }

  async getQuestion(req, res) {
    try {
      const { page = 1, limit = 30, key } = req.query;
      const totalQuestions = await Question.countDocuments({});
      const maxPage = Math.ceil(totalQuestions / parseInt(limit)); 

      const pageToShow = Math.min(parseInt(page), maxPage);
      let question = await Question.aggregate([
        {
          $match: {
            text: key ? { $regex: key, $options: "i" } : { $exists: true },
          },
        },
        {
          $skip: (parseInt(page) - 1) * parseInt(limit),
        },
        {
          $limit: parseInt(limit),
        },
      ]);

      return res.status(200).json({
        status: "Success",
        maxPage: maxPage,
        currentPage: pageToShow,
        data: question,
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

  async getDetailQuestion(req, res) {
    try {
      const id = req.params.id;
      const ObjectId = mongoose.Types.ObjectId;

      let question = await Question.findOne({
        _id: new ObjectId(id),
      });
      if (!question) {
        return res.status(404).json({
          status: "Failed",
          message: "No such question",
        });
      }
      res.status(200).json({
        status: "Success",
        data: question,
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
}

module.exports = new adminController();
