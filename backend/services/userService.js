const User = require("../models/User");
const Admin = require("../models/Admin");

exports.getUsers = async () => {
  return await User.find().select("name email city state mobileNumber profilePic createdAt");
};

exports.getAdmins = async () => {
  return await Admin.find().select("name email city state mobileNumber profilePic role createdAt");
};

exports.updateUser = async (id, data) => {
  const updateFields = {
    name: data.name,
    email: data.email,
    city: data.city,
    profilePic: data.profilePic,
  };

  let updated = await User.findByIdAndUpdate(id, updateFields, { new: true }).select("name email city profilePic createdAt");
  if (updated) return updated;

  updated = await Admin.findByIdAndUpdate(id, updateFields, { new: true }).select("name email city profilePic role createdAt");
  if (updated) return updated;

  throw new Error("User not found");
};

exports.deleteUser = async (id) => {
  const deletedUser = await User.findByIdAndDelete(id);
  if (deletedUser) return deletedUser;

  const deletedAdmin = await Admin.findByIdAndDelete(id);
  if (deletedAdmin) return deletedAdmin;

  throw new Error("User not found");
};
