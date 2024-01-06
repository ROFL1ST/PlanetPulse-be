const router = require("express")();
const LessonController = require("../controller/lessonController");

router.get("/category", LessonController.getCategory)

router.get("/", LessonController.getLesson)
router.post("/post", LessonController.addLesson);
// stages
router.post("/stages/post", LessonController.addStage)
router.get("/stages/:id", LessonController.getStage)

// quizz
router.get("/quiz/:id", LessonController.getQuiz);
router.post("/quiz/post", LessonController.addQuiz);

// question
router.get("/question", LessonController.getQuestion);
router.get("/question/:id", LessonController.getDetailQuestion);
router.post("/question/post", LessonController.addQuestion);
module.exports = { lessonRoute: router };
