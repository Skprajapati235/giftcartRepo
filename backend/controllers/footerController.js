const service = require("../services/footerService");

// Caching helper for public web performance & SEO
const setPublicCacheHeaders = (res, maxAge = 120, sMaxAge = 600) => {
  res.set("Cache-Control", `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=86400`);
};

// -------------------------------------------------------------
// Public Endpoints (Consumed by Storefront Website)
// -------------------------------------------------------------
exports.getPublic = async (req, res) => {
  try {
    const data = await service.getPublicFooter();
    setPublicCacheHeaders(res, 120, 600);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// Admin Endpoints
// -------------------------------------------------------------
exports.getAdmin = async (req, res) => {
  try {
    const data = await service.getAdminFooter();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFooter = async (req, res) => {
  try {
    const data = await service.updateFooter(req.body, req.user?.id);
    res.json({ success: true, message: "Footer configuration updated successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const data = await service.updateBrand(req.body, req.user?.id);
    res.json({ success: true, message: "Brand & contact details updated", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNewsletter = async (req, res) => {
  try {
    const data = await service.updateNewsletter(req.body, req.user?.id);
    res.json({ success: true, message: "Newsletter configuration updated", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBottom = async (req, res) => {
  try {
    const data = await service.updateBottomStrip(req.body, req.user?.id);
    res.json({ success: true, message: "Bottom strip & legal settings updated", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSeo = async (req, res) => {
  try {
    const data = await service.updateSeo(req.body, req.user?.id);
    res.json({ success: true, message: "Footer SEO & Schema metadata updated", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Badges
exports.addBadge = async (req, res) => {
  try {
    const data = await service.addBadge(req.body, req.user?.id);
    res.status(201).json({ success: true, message: "Trust badge added", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBadge = async (req, res) => {
  try {
    const data = await service.updateBadge(req.params.id, req.body, req.user?.id);
    res.json({ success: true, message: "Trust badge updated", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBadge = async (req, res) => {
  try {
    const data = await service.deleteBadge(req.params.id, req.user?.id);
    res.json({ success: true, message: "Trust badge deleted", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Columns
exports.addColumn = async (req, res) => {
  try {
    const data = await service.addColumn(req.body, req.user?.id);
    res.status(201).json({ success: true, message: "Navigation column created", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateColumn = async (req, res) => {
  try {
    const data = await service.updateColumn(req.params.id, req.body, req.user?.id);
    res.json({ success: true, message: "Navigation column updated", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteColumn = async (req, res) => {
  try {
    const data = await service.deleteColumn(req.params.id, req.user?.id);
    res.json({ success: true, message: "Navigation column deleted", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Links
exports.addLink = async (req, res) => {
  try {
    const data = await service.addLink(req.params.id, req.body, req.user?.id);
    res.status(201).json({ success: true, message: "Link added to column", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateLink = async (req, res) => {
  try {
    const { columnId, linkId } = req.params;
    const data = await service.updateLink(columnId, linkId, req.body, req.user?.id);
    res.json({ success: true, message: "Link updated", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const { columnId, linkId } = req.params;
    const data = await service.deleteLink(columnId, linkId, req.user?.id);
    res.json({ success: true, message: "Link deleted", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Reset
exports.resetDefaults = async (req, res) => {
  try {
    const data = await service.resetDefaults(req.user?.id);
    res.json({ success: true, message: "Footer reset to standard defaults", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
