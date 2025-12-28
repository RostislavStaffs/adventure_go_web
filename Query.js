const mongoose = require("mongoose");

const QuerySchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: "" },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Query", QuerySchema);
