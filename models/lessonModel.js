const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});
const lessonSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    color_way: {
      type: String,
      default: null,
    },
    id_category: [
      {
        type: mongoose.Types.ObjectId,
        ref: "categories",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const stagesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    id_lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lessons",
      required: true,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  {
    timestamps: true,
  },
  { versionKey: false }
);

const quizSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questions",
        required: true,
      },
    ],
    id_stages: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "stages",
    },
  },
  {
    timestamps: true,
  },
  { versionKey: false }
);

const questionSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctOptionIndex: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false }
);

const Category = mongoose.model("categories", categorySchema);
const Lesson = mongoose.model("lessons", lessonSchema);
const Quiz = mongoose.model("quizzes", quizSchema);
const Stage = mongoose.model("stages", stagesSchema);
const Question = mongoose.model("questions", questionSchema);

module.exports = { Category, Lesson, Quiz, Stage, Question };
