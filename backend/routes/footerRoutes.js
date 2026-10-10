const router = require("express").Router();
const controller = require("../controllers/footerController");
const adminMiddleware = require("../middleware/adminMiddleware");

// -------------------------------------------------------------
// Public Endpoints (Consumed by Storefront Website)
// -------------------------------------------------------------
router.get("/", controller.getPublic);

// Role check for footer management
const footerManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "seo_specialist"],
  ["/footer"]
);

// -------------------------------------------------------------
// Admin Endpoints (Protected by JWT and Role)
// -------------------------------------------------------------
router.get("/admin", adminMiddleware, footerManage, controller.getAdmin);
router.put("/", adminMiddleware, footerManage, controller.updateFooter);
router.post("/reset-defaults", adminMiddleware, footerManage, controller.resetDefaults);

// Section-level updates
router.put("/brand", adminMiddleware, footerManage, controller.updateBrand);
router.put("/newsletter", adminMiddleware, footerManage, controller.updateNewsletter);
router.put("/bottom", adminMiddleware, footerManage, controller.updateBottom);
router.put("/seo", adminMiddleware, footerManage, controller.updateSeo);

// Badges CRUD
router.post("/badges", adminMiddleware, footerManage, controller.addBadge);
router.put("/badges/:id", adminMiddleware, footerManage, controller.updateBadge);
router.delete("/badges/:id", adminMiddleware, footerManage, controller.deleteBadge);

// Navigation Columns CRUD
router.post("/columns", adminMiddleware, footerManage, controller.addColumn);
router.put("/columns/:id", adminMiddleware, footerManage, controller.updateColumn);
router.delete("/columns/:id", adminMiddleware, footerManage, controller.deleteColumn);

// Links within Columns CRUD
router.post("/columns/:id/links", adminMiddleware, footerManage, controller.addLink);
router.put("/columns/:columnId/links/:linkId", adminMiddleware, footerManage, controller.updateLink);
router.delete("/columns/:columnId/links/:linkId", adminMiddleware, footerManage, controller.deleteLink);

module.exports = router;
