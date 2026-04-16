const User = require("../models/User");
const Admin = require("../models/Admin");

exports.getUsers = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const skip = (page - 1) * limit;
  const query = search ? {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ]
  } : {};

  const users = await User.find(query)
    .select("name email city state mobileNumber profilePic createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  return {
    data: users,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

exports.getAdmins = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const skip = (page - 1) * limit;
  const query = search ? {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ]
  } : {};

  const admins = await Admin.find(query)
    .select("name email city state mobileNumber profilePic role createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Admin.countDocuments(query);

  return {
    data: admins,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
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
