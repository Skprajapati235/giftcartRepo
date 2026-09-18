const service = require("../services/crmService");

exports.create = async (req, res) => {
  try {
    const data = await service.createCrmContact(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await service.getCrmContacts(req.query);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getCrmContactById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "CRM Contact not found" });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateCrmContact(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: "CRM Contact not found" });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await service.deleteCrmContact(req.params.id);
    res.json({ success: true, message: "CRM Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
