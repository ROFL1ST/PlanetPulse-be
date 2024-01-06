const router = require("express")();
const passport = require("passport");
const adminController = require("../controller/adminController");


router.post("/register", adminController.registerAdmin)
router.post("/login", adminController.loginAdmin)

module.exports = { adminRoute: router };
