const { default: jwtDecode } = require("jwt-decode");
const {
  Lesson,
  Question,
  Quiz,
  Stage,
  Category,
} = require("../models/lessonModel");
const { default: mongoose } = require("mongoose");

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
      const lesson = await Lesson.create({
        title: body.title,
        description: body.description,
        color_way: body.color_way,
        id_category: body.id_category,
      });

      console.log(body);
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
            color_way: { $first: "$color_way" },
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

  async getStage(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;

      const { id } = req.params;
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

  async getQuiz(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      let { id } = req.params;
      const quiz = await Quiz.findOne({
        id_stages: new ObjectId(id),
      });
      if (!quiz) {
        return res.status(404).json({
          status: "Failed",
          message: "The requested resource was not found.",
        });
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

  async getQuestion(req, res) {
    try {
      let question = await Question.find();
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

module.exports = new LessonController();
