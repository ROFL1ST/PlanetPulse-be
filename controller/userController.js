const { default: mongoose } = require("mongoose");

class userControl {
  async register(req, res) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const body = req.body;
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "Failed",
        message: "Something's wrong",
        error: error,
      });
    }
  }
}


module.exports = new userControl();
