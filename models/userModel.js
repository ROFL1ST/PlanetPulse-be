const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter your username"],
    },
    password: {
      type: String,
      min: [8, "Minimum 8 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your fullname"],
    },
    name: {
      type: String,
      required: [true, "Please enter your fullname"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: null,
    },
    default_color: {
      type: String,
      default: null,
    },
    photo_profile: {
      type: String,
      default: null,
    },
    public_id: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    googleId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const detailUserModel = mongoose.Schema({
  id_user: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
  },
  country: {
    type: String,
  },
  address: {
    type: String,
  },
});

const verifyModel = mongoose.Schema({
  id_user: {
    type: ObjectId,
    ref: "users",
    required: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
});
const forgotModel = mongoose.Schema({
  id_user: {
    type: ObjectId,
    ref: "users",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  dateExpired: {
    type: Date,
    required: true,
  },
});

const adminModel = mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    enum: ["admin", "worker"],
    default: "worker",
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    //required: [true, 'Please provide an Email address'],
  },
  token: {
    type: String,
    default: null,
  },
});

const userAcademyModel = mongoose.Schema({
  id_lesson: {
    type: mongoose.Types.ObjectId,
    ref: "lessons",
    required: true,
  },
  id_user: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
});

const userQuizModel = mongoose.Schema({
  id_quiz: {
    type: mongoose.Types.ObjectId,
    ref: "quizzes",
    required: true,
  },
  id_user: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
    unique: true,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
});

const userStageModel = mongoose.Schema({
  id_stages: {
    type: mongoose.Types.ObjectId,
    ref: "stages",
    required: true,
  },
  id_user: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
    unique: true,

  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
});

const log_userModel = mongoose.Schema({
  dateLog: {
    type: Date,
    default: new Date(),
    required: true,
  },
  action: {
    type: String,
    enum: ["login", "logout"],
    required: true,
  },
  id_user: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
  },
});
const User = mongoose.model("users", userSchema);
const UserDetail = mongoose.model("user-detail", detailUserModel);
const UserAcademy = mongoose.model("user-academies", userAcademyModel);
const Verify = mongoose.model("veryfies", verifyModel);
const Forgot = mongoose.model("forgots", forgotModel);
const Admin = mongoose.model("admins", adminModel);
const UserQuiz = mongoose.model("user-quizzes", userQuizModel);
const UserStages = mongoose.model("user-stages", userStageModel);
const UserLog = mongoose.model("user-logs", log_userModel);

module.exports = {
  User,
  UserDetail,
  Verify,
  Forgot,
  Admin,
  UserAcademy,
  UserQuiz,
  UserStages,
  UserLog,
};
