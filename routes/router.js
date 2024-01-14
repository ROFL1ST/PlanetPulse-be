const { jwtMiddleWare } = require("../middleware/jwt_middleware");
const { adminRoute } = require("./adminRoute");
const { lessonRoute } = require("./lessonRoute");
const { userRouter } = require("./userRouter");

const router = require("express")();

router.get("/", (req, res) => {
  res.json({
    status: "Ok",
    messege: "Anda Berhasil Mengakses Kami",
  });
});

router.use("/admin", adminRoute)
router.use("/user", userRouter);
router.use(jwtMiddleWare);
router.use("/lesson", lessonRoute);

module.exports = router;

