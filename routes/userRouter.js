const router = require("express")();
const passport = require("passport");
const userController = require("../controller/userController");
const { jwtMiddleWare } = require("../middleware/jwt_middleware");
const { uploader } = require("../middleware/file_upload");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/verify/:id", userController.verify);
router.get("/auth", jwtMiddleWare, userController.auth);
router.post("/forgot-password", userController.forgot_password);
router.post("/resend-email", userController.resendEmail);
router.post("/verify-password/:email", userController.verifyForgot);
router.post("/reset-password", userController.resetPassword);

// profile
router.get("/", jwtMiddleWare, userController.profle);
router.put(
  "/:id",
  jwtMiddleWare,
  uploader.single("photo_profile"),
  userController.updateProfile
);
router.get("/search", jwtMiddleWare, userController.searchUser);
router.post("/academy/post", jwtMiddleWare, userController.addAcademy);
router.get("/academy", jwtMiddleWare, userController.getAcademy);
router.put("/academy/:id", jwtMiddleWare, userController.updateAcademy);
router.delete("/academy/:id", jwtMiddleWare, userController.deleteAcademy);
// router.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] }),
//   userController.initiateGoogle
// );
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login-failure-route" }),
//   userController.signGoogle
// );
module.exports = { userRouter: router };

// admin
