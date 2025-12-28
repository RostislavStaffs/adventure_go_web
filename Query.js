const mongoose = require("mongoose");

const QuerySchema = new mongoose.Schema(
  {
    queryNumber: { type: Number, required: true, unique: true, index: true },

    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },

    message: { type: String, default: "", trim: true, maxlength: 250 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Query", QuerySchema);
