const service = require("../services/leadService");

exports.create = async (req, res) => {
  try {
    const data = await service.createLead(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await service.getLeads(req.query);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getLeadById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateLead(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await service.deleteLead(req.params.id);
    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
