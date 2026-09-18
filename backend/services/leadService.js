const Lead = require("../models/Lead");

exports.createLead = async (data) => {
  return await Lead.create(data);
};

exports.getLeads = async (query = {}) => {
  const { page = 1, limit = 10, search = "", status, source } = query;
  const skip = (page - 1) * limit;

  const searchQuery = {};
  
  if (search) {
    searchQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    searchQuery.status = status;
  }
  if (source) {
    searchQuery.source = source;
  }

  const leads = await Lead.find(searchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Lead.countDocuments(searchQuery);

  return {
    data: leads,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

exports.getLeadById = async (id) => {
  return await Lead.findById(id);
};

exports.updateLead = async (id, data) => {
  return await Lead.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteLead = async (id) => {
  return await Lead.findByIdAndDelete(id);
};
