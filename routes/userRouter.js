const router = require("express")();
const userController = require("../controller/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/verify/:id", userController.verify);
router.get("/auth", userController.auth)
router.post("/forgot-password", userController.forgot_password)
router.post("/resend-email", userController.resendEmail);
router.post("/verify-password/:email", userController.verifyForgot);
router.post("/reset-password", userController.resetPassword);

module.exports = { userRouter: router };
