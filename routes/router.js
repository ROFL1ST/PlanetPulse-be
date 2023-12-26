const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
      status: "Ok",
      messege: "Anda Berhasil Mengakses Kami",
    });
  });


module.exports = router;
