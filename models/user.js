const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
});

module.exports = mongoose.model("User", userSchema);
