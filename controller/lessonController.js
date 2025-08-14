const { default: jwtDecode } = require("jwt-decode");
const {
  Lesson,
  Question,
  Quiz,
  Stage,
  Category,
  StageDetail,
} = require("../models/lessonModel");
const { default: mongoose } = require("mongoose");
const { UserQuiz, UserStages } = require("../models/userModel");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY_CLOUD,
  api_secret: process.env.API_SECRET_CLOUD,
});
class LessonController {
  async getCategory(req, res) {
    try {
      const data = await Category.find().sort({ categoryName: "asc" });
      return res.status(200).json({
        status: "Success",
        data: data,
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

  async addCategory(req, res) {
    try {
      const body = req.body;
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const result = await Category.create(body);
      return res.status(200).json({
        status: "Success",
        data: result,
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

  async updateCategory(req, res) {
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
      let { id } = req.params;
      const body = req.body;
      const category = await Category.findOne({ _id: new ObjectId(id) });
      if (!category) {
        return res.status(404).json({
          status: "Failed",
          message: "Category's not found",
        });
      }
      await Category.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name: body.name,
            description: body.description,
          },
        }
      );
      return res.status(200).json({
        status: "Success",
        message: "Data has been updated",
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

  async deleteCategory(req, res) {
    try {
      const headers = req.headers;
      const ObjectId = mongoose.Types.ObjectId;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const categoryId = new ObjectId(req.params.id);

      
      await Lesson.updateMany(
        { id_category: categoryId },
        { $unset: { id_category: "" } }
      );

      await Category.deleteOne({ _id: categoryId });
      return res.status(200).json({
        status: "Success",
        message: "Category has been deleted",
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
  async addLesson(req, res) {
    try {
      let body = req.body;
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      if (req.file?.path != undefined) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          req.file.path,
          { folder: "/pulse/lessons" }
        );
        body.photo_url = secure_url;
        body.public_id = public_id;
      } else {
        return res.status(400).json({
          status: "Failed",
          message: "Image is required.",
        });
      }
      const lesson = await Lesson.create({
        title: body.title,
        description: body.description,
        // color_way: body.color_way,
        id_category: body.id_category,
        photo_url: body.photo_url,
        public_id: body.public_id,
      });

      res.status(200).json({
        status: "Success",
        data: lesson,
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

  async deleteLesson(req, res) {
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
      await Lesson.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({
        status: "Success",
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

  async getLesson(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;

      const { key, category } = req.query;
      const data = await Lesson.aggregate([
        {
          $match: {
            title: key ? { $regex: key, $options: "i" } : { $exists: true },
            id_category: category ? new ObjectId(category) : { $exists: true },
          },
        },
        {
          $lookup: {
            from: "categories", // Assuming the name of the collection is "categories"
            localField: "id_category",
            foreignField: "_id",
            as: "categories",
          },
        },
        {
          $group: {
            _id: "$_id",
            title: { $first: "$title" },
            description: { $first: "$description" },
            photo_url: { $first: "$photo_url" },
            id_category: { $first: "$id_category" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            __v: { $first: "$__v" },
            categories: { $push: "$categories" },
          },
        },
        {
          $unwind: "$categories",
        },
        {
          $project: {
            id_category: 0,
          },
        },
        {
          $lookup: {
            from: "stages",
            localField: "_id",
            foreignField: "id_lesson",
            as: "stages",
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
        message: "Something's wrong",
        error: error,
      });
    }
  }

  async detailLesson(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const { id } = req.params;
      const data = await Lesson.aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "categories", // Assuming the name of the collection is "categories"
            localField: "id_category",
            foreignField: "_id",
            as: "categories",
          },
        },
        {
          $group: {
            _id: "$_id",
            title: { $first: "$title" },
            description: { $first: "$description" },
            photo_url: { $first: "$photo_url" },
            id_category: { $first: "$id_category" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            __v: { $first: "$__v" },
            categories: { $push: "$categories" },
          },
        },
        {
          $unwind: "$categories",
        },
        {
          $project: {
            id_category: 0,
          },
        },
        {
          $lookup: {
            from: "stages",
            localField: "_id",
            foreignField: "id_lesson",
            as: "stages",
          },
        },
      ]);
      if (data.length == 0) {
        return res
          .status(404)
          .json({ status: "Failed", message: "Lesson's not found" });
      }
      return res.status(200).json({ status: "Success", data: data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: "Something's wrong",
        error: error,
      });
    }
  }
  async updateLesson(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const body = req.body;
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const { id } = req.params;
      const check = await Lesson.findOne({ _id: new ObjectId(id) });
      if (!check) {
        return res.status(404).json({
          status: "Failed",
          message: "Lesson's not found",
        });
      }
      if (req.file?.path != undefined) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          req.file.path,
          { folder: "/pulse/lessons" }
        );
        body.photo_url = secure_url;
        body.public_id = public_id;
        if (check.photo_url != null) {
          await cloudinary.uploader.destroy(check.public_id);
        }
      } else {
        body.photo_url = check.photo_url;
        body.public_id = check.public_id;
      }
      await Lesson.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            title: body.title,
            description: body.description,
            photo_url: body.photo_url,
            public_id: body.public_id,
            id_category: body.id_category,
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
        message: "Something's wrong",
        error: error,
      });
    }
  }
  async addStage(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;

      let body = req.body;
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }

      const check_lesson = await Lesson.findOne({
        _id: new ObjectId(body.id_lesson),
      });
      if (!check_lesson) {
        return res.status(404).json({
          status: "Failed",
          message: "Lesson's not found",
        });
      }
      const stages = await Stage.create(body);
      await StageDetail.create({
        id_stages: stages._id,
        title: "Your Content",
      });
      return res.status(200).json({
        status: "Success",
        data: stages,
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

  async addDetailStage(req, res) {
    try {
      const { id } = req.params;
      const detail = req.body;
      const ObjectId = mongoose.Types.ObjectId;
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const stage = await Stage.findOne({ _id: new ObjectId(id) });
      if (!stage) {
        return res.status(404).json({
          status: "Failed",
          message: "Stage's not found",
        });
      }
      const check = await StageDetail.findOne({ id_stages: new ObjectId(id) });
      if (check) {
        return res.status(401).json({
          status: "Failed",
          message: "Content's already exist",
        });
      }
      detail.id_stages = id;
      const data = await StageDetail.create(detail);
      return res.status(200).json({
        status: "Success",
        data: data,
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
  async updateDetailStage(req, res) {
    try {
      const { id } = req.params;
      const detail = req.body;
      const ObjectId = mongoose.Types.ObjectId;
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      const stage = await StageDetail.findOne({ id_stages: new ObjectId(id) });
      if (!stage) {
        return res.status(404).json({
          status: "Failed",
          message: "Stage's not found",
        });
      }
      await StageDetail.updateOne(
        { id_stages: new ObjectId(id) },
        {
          $set: {
            title: detail.title,
            content: detail.content,
            url_videos: detail.url_videos
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
        message: "Something's wrong",
        error: error,
      });
    }
  }
  async getStage(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const { id } = req.params;
      const headers = req.headers;
      const jwt = jwtDecode(headers.authorization);
      const stage = await Stage.aggregate([
        { $match: { id_lesson: new ObjectId(id) } },
        {
          $lookup: {
            from: "quizzes",
            localField: "_id",
            foreignField: "id_stages",
            as: "quizzes",
          },
        },
      ]);
      if (!stage) {
        return res.status(404).json({
          status: "Failed",
          message: "Stage's not found",
        });
      }
    
      return res.status(200).json({
        status: "Success",
        data: stage,
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

  async getDetailStage(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;

      const { id } = req.params;
      const detail = await StageDetail.findOne({ id_stages: new ObjectId(id) });
      return res.status(200).json({
        status: "Success",
        data: detail,
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
  async addQuiz(req, res) {
    try {
      let body = req.body;
      let headers = req.headers;
      const type = jwtDecode(headers.authorization).type;
      if (type != "admin") {
        return res.status(401).json({
          status: "Failed",
          message: "Unauthorized",
        });
      }
      // Get the question from the request body and create it in the database
      const quiz = await Quiz.create({
        title: body.title,
        questions: body.questions,
        id_stages: body.id_stages,
      });
      return res.status(200).json({
        status: "Success",
        data: quiz,
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

  async updateStage(req, res) {
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
      const check = await Stage.findOne({ _id: new ObjectId(id) });
      if (!check) {
        return res.status(404).json({
          status: "Failed",
          message: "Stage's not found",
        });
      }
      const data = await Stage.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name: body.name,
            difficulty: body.difficulty,
            id_lesson: body.id_lesson,
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
        message: "Something's wrong",
        error: error,
      });
    }
  }

  async deleteStage(req, res) {
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
      const check = await Stage.findOne({ _id: new ObjectId(id) });
      if (!check) {
        return res.status(404).json({
          status: "Failed",
          message: "Stage's not found",
        });
      }
      await StageDetail.deleteOne({ id_stages: new ObjectId(id) });
      await Stage.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({
        status: "Success",
        message: "Delete Successfully",
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

  async getQuiz(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      let { id } = req.params;
      const headers = req.headers;
      const jwt = jwtDecode(headers.authorization);
      const quiz = await Quiz.aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "questions", // Replace 'questions' with the actual name of your questions collection
            localField: "questions",
            foreignField: "_id",
            as: "questions",
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            id_stages: 1,
            createdAt: 1,
            updatedAt: 1,
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
      if (!quiz) {
        return res.status(404).json({
          status: "Failed",
          message: "The requested resource was not found.",
        });
      }
      if (jwt.type == "user") {
        const check = await UserQuiz.aggregate([
          {
            $match: {
              $and: [
                { id_quiz: new ObjectId(id) },
                { id_user: new ObjectId(jwt.id) },
              ],
            },
          },
        ]);
        if (check.length == 0) {
          await UserQuiz.create({
            id_user: jwt.id,
            id_quiz: id,
          });
        }
        if (!check) {
          await UserQuiz.create({
            id_user: jwt.id,
            id_quiz: quiz[0]._id,
          });
        }
      }
      return res.status(200).json({
        status: "Success",
        data: quiz,
      });
    } catch (error) {
      return res.status(500).json({
        status: "Failed",
        message: "Something's wrong",
        error: error,
      });
    }
  }

  async updateQuizz(req, res) {
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
      const check = await Quiz.findOne({ _id: new ObjectId(id) });
      if (!check) {
        return res.status(404).json({
          status: "Failed",
          message: "Quiz's not found",
        });
      }
      const updatedQuiz = await Quiz.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            title: body.title,
            questions: body.questions,
            id_stages: body.id_stages,
          },
        }
      );
      return res.status(200).json({
        status: "Success",
        data: updatedQuiz,
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

  async deleteQuizz(req, res) {
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
      const check = await Quiz.findOne({ _id: new ObjectId(id) });
      if (!check) {
        return res.status(404).json({
          status: "Failed",
          message: "Quiz's not found",
        });
      }
      await Quiz.deleteOne({ _id: new ObjectId(id) });
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
}

module.exports = new LessonController();
