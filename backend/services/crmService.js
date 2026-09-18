const CrmContact = require("../models/CrmContact");

exports.createCrmContact = async (data) => {
  return await CrmContact.create(data);
};

exports.getCrmContacts = async (query = {}) => {
  const { page = 1, limit = 10, search = "", type, status, source } = query;
  const skip = (page - 1) * limit;

  const searchQuery = {};
  
  if (search) {
    searchQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  if (type) {
    searchQuery.type = type;
  }
  if (status) {
    searchQuery.status = status;
  }
  if (source) {
    searchQuery.source = source;
  }

  const contacts = await CrmContact.find(searchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await CrmContact.countDocuments(searchQuery);

  return {
    data: contacts,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

exports.getCrmContactById = async (id) => {
  return await CrmContact.findById(id);
};

exports.updateCrmContact = async (id, data) => {
  return await CrmContact.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCrmContact = async (id) => {
  return await CrmContact.findByIdAndDelete(id);
};
