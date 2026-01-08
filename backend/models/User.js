const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  phone: { type: String, default: "" },

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  isAdmin: { type: Boolean, default: false },
  avatarBase64: { type: String, default: "" },

  // Password reset (set by admin, used by reset page)
  passwordResetTokenHash: { type: String, default: null },
  passwordResetExpiresAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
