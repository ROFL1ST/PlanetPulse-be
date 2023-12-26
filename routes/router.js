const express = require("express");
const { userRouter } = require("./userRoutes");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "Ok",
    messege: "Anda Berhasil Mengakses Kami",
  });
});

router.use("/user", userRouter);

module.exports = router;
