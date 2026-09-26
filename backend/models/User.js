const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  // Optional now — mobile OTP is the primary way customers sign up/in.
  // sparse so multiple users without an email don't collide on the
  // unique index.
  // email: { type: String, unique: true, sparse: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: undefined,
  },
  password: String,
  resetOtpHash: { type: String, select: false },
  resetOtpExpiresAt: { type: Date, select: false },
  // Primary login identifier for customers (mobile OTP flow).
  mobileNumber: { type: String, unique: true, sparse: true },
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

userSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { email: { $type: "string" } } 
  }
);

module.exports = mongoose.model("User", userSchema);