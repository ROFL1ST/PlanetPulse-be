const { userRouter } = require("./userRouter");

const router = require("express")();

router.get("/", (req, res) => {
  res.json({
    status: "Ok",
    messege: "Anda Berhasil Mengakses Kami",
  });
});

router.use("/user", userRouter);

module.exports = router;
