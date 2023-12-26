const express = require("express");
const router = express.Router();

const {jwtMiddleWare} = require("../middleware/jwt_middleware");
const { register } = require("../controller/userController");

router.post("/register", register)



module.exports = { userRouter: router };
