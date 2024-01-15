const router = require("express")();
const LessonController = require("../controller/lessonController");
const { uploader } = require("../middleware/file_upload");

router.get("/category", LessonController.getCategory);
router.post("/category/post", LessonController.addCategory);
router.put("/category/:id", LessonController.updateCategory);
router.delete("/category/:id", LessonController.deleteCategory);

router.get("/", LessonController.getLesson);
router.get("/:id", LessonController.detailLesson);
router.post("/post", uploader.single("photo_url"), LessonController.addLesson);
router.put(
  "/update/:id",
  uploader.single("photo_url"),
  LessonController.updateLesson
);
router.delete("/delete/:id", LessonController.deleteLesson)
// stages
router.post("/stages/post", LessonController.addStage);
router.get("/stages/:id", LessonController.getStage);
router.put("/stages/update/:id", LessonController.updateStage);
router.post("/stages/content/:id", LessonController.addDetailStage);
router.put("/stages/content/:id", LessonController.updateDetailStage);
router.get("/stages/content/:id", LessonController.getDetailStage);
router.delete("/stages/delete/:id", LessonController.deleteStage);
// quizz
router.get("/quiz/:id", LessonController.getQuiz);
router.post("/quiz/post", LessonController.addQuiz);


module.exports = { lessonRoute: router };
