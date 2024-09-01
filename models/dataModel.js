const mongoose = require("mongoose");

const logsSchema = mongoose.Schema(
  {
    machine_id: {
      type: String,
      required: true,
    },
  },
  {
    job_id: {
      type: String,
      required: true,
    },
  },
  {
    time: {
      type: String,
      required: true,
    },
  },
  {
    pid: {
      type: String,
      required: true,
    },
  },
  {
    ip_address: {
      type: String,
    },
  },
  {
    db: {
      type: String,
    },
  },
  {
    user_id: {
      type: String,
    },
  },
  {
    state: {
      type: String,
    },
  },
  {
    log_activity: {
      type: String,
    },
  }
);

const Log = mongoose.model("logs", logsSchema);

module.exports = { Log };
