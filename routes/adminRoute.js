const router = require("express")();
const passport = require("passport");
const adminController = require("../controller/adminController");


router.post("/register", adminController.registerAdmin)
router.post("/login", adminController.loginAdmin)

// log
router.get("/log", adminController.getLog)

module.exports = { adminRoute: router };
