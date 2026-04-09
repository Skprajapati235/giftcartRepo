const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  mobileNumber: String,
  profilePic: String,
  state: String,
  city: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);