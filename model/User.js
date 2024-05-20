const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String, // Optional, for users who sign up without Google Auth
});

const User = mongoose.model("User", userSchema);
module.exports = User;
