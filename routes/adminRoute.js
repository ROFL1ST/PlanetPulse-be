const router = require("express")();
const passport = require("passport");
const adminController = require("../controller/adminController");
const { jwtMiddleWare } = require("../middleware/jwt_middleware");


router.post("/register", adminController.registerAdmin)
router.post("/login", adminController.loginAdmin)


router.use(jwtMiddleWare);
router.get("/auth", adminController.auth)

// log
router.get("/log", adminController.getLog)
router.get("/user", adminController.totalUser)

// lesson
router.get("/quizzes", adminController.getAllQuiz)
router.get("/stagges", adminController.getAllStagges)

module.exports = { adminRoute: router };
