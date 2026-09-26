const service = require("../services/seoService");

// -------------------------------------------------------------
// Global SEO
// -------------------------------------------------------------
exports.getGlobal = async (req, res) => {
  try {
    const data = await service.getGlobalSeo();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGlobal = async (req, res) => {
  try {
    const data = await service.updateGlobalSeo(req.body);
    res.json({ success: true, message: "Global SEO updated successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// Page SEO
// -------------------------------------------------------------
exports.getPageByPath = async (req, res) => {
  try {
    const path = req.query.path || "/";
    const data = await service.getPageSeoByPath(path);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPages = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await service.getAllSeoPages({ page, limit, search });
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPage = async (req, res) => {
  try {
    const data = await service.createSeoPage(req.body);
    res.status(201).json({ success: true, message: "Page SEO rule created", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const data = await service.updateSeoPage(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: "Page SEO not found" });
    res.json({ success: true, message: "Page SEO updated", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const data = await service.deleteSeoPage(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Page SEO not found" });
    res.json({ success: true, message: "Page SEO deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.seedPages = async (req, res) => {
  try {
    const data = await service.seedDefaultPages();
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// Redirects
// -------------------------------------------------------------
exports.getAllRedirects = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await service.getAllRedirects({ page, limit, search });
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRedirect = async (req, res) => {
  try {
    const data = await service.createRedirect(req.body);
    res.status(201).json({ success: true, message: "Redirect created", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateRedirect = async (req, res) => {
  try {
    const data = await service.updateRedirect(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: "Redirect not found" });
    res.json({ success: true, message: "Redirect updated", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteRedirect = async (req, res) => {
  try {
    const data = await service.deleteRedirect(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Redirect not found" });
    res.json({ success: true, message: "Redirect deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkRedirect = async (req, res) => {
  try {
    const path = req.query.path || "";
    const data = await service.checkRedirect(path);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// Dynamic Sitemap & Robots Data
// -------------------------------------------------------------
exports.getSitemapData = async (req, res) => {
  try {
    const data = await service.getSitemapData();
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRobotsData = async (req, res) => {
  try {
    const data = await service.getRobotsData();
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// SEO Health Audit
// -------------------------------------------------------------
exports.getAudit = async (req, res) => {
  try {
    const data = await service.getSeoAuditStats();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
