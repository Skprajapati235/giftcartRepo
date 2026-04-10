const User = require("../models/User");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

exports.registerUser = async (data) => {
  const { name, email, password } = data;

  const userExists = await User.findOne({ email });
  if (userExists) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  return await User.create({ name, email, password: hashed });
};

exports.loginUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return user;
};

exports.googleLogin = async (data) => {
  const { email, name } = data;

  let admin = await Admin.findOne({ email });

  if (!admin) {
    admin = await Admin.create({
      name,
      email,
      password: "google-login",
      role: "admin",
    });
  }

  return admin;
};

// export default authService;

exports.updateUserProfile = async (userId, data) => {
  const { name, mobileNumber, profilePic, state, city } = data;
  
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
  if (profilePic !== undefined) updateData.profilePic = profilePic;
  if (state !== undefined) updateData.state = state;
  if (city !== undefined) updateData.city = city;

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  if (!user) throw new Error("User not found");

  return user;
};

exports.registerAdmin = async (data) => {
  const { name, email, password } = data;

  const adminExists = await Admin.findOne({ email });
  if (adminExists) throw new Error("Admin already exists");

  const hashed = await bcrypt.hash(password, 10);

  return await Admin.create({ name, email, password: hashed, role: "admin" });
};

exports.loginAdmin = async (data) => {
  const { email, password } = data;

  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Admin not found");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return admin;
};