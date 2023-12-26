const router = require("express")();
const userController = require("../controller/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/verify/:id", userController.verify);

module.exports = { userRouter: router };
