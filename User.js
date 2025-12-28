const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  phone: { type: String, default: "" },

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },


  isAdmin: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
