const router = require("express")();
const passport = require("passport");
const adminController = require("../controller/adminController");
const { jwtMiddleWare } = require("../middleware/jwt_middleware");
const { jwtAdmin } = require("../middleware/jwt_admin");


router.post("/register", adminController.registerAdmin)
router.post("/login", adminController.loginAdmin)


router.use(jwtAdmin);
router.get("/auth", adminController.auth)

// log
router.get("/log", adminController.getLog)
router.get("/user", adminController.totalUser)

// lesson
router.get("/quizzes", adminController.getAllQuiz)
router.get("/stagges", adminController.getAllStagges)


// question

router.get("/question", adminController.getQuestion);
router.get("/question/:id", adminController.getDetailQuestion);
router.put("/question/:id", adminController.updateQuestion);
router.delete("/question/:id", adminController.deleteQuestion);
router.post("/question/post", adminController.addQuestion);
router.post("/question/bulk-post", adminController.addBulkQuestion);

// logs

router.get("/logs", adminController.getLogs)
router.get("/logs/chart", adminController.logsChart)
module.exports = { adminRoute: router };
