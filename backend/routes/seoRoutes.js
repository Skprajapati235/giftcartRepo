const router = require("express").Router();
const controller = require("../controllers/seoController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public endpoints (used by frontend website and search bots)
router.get("/global", controller.getGlobal);
router.get("/page", controller.getPageByPath);
router.get("/sitemap-data", controller.getSitemapData);
router.get("/robots-data", controller.getRobotsData);
router.get("/check-redirect", controller.checkRedirect);

// Admin endpoints (protected by adminMiddleware)
router.put("/global", adminMiddleware, controller.updateGlobal);

// Page SEO CRUD
router.get("/pages", adminMiddleware, controller.getAllPages);
router.post("/pages", adminMiddleware, controller.createPage);
router.post("/seed", adminMiddleware, controller.seedPages);
router.put("/pages/:id", adminMiddleware, controller.updatePage);
router.delete("/pages/:id", adminMiddleware, controller.deletePage);

// Redirects CRUD
router.get("/redirects", adminMiddleware, controller.getAllRedirects);
router.post("/redirects", adminMiddleware, controller.createRedirect);
router.put("/redirects/:id", adminMiddleware, controller.updateRedirect);
router.delete("/redirects/:id", adminMiddleware, controller.deleteRedirect);

// SEO Health Audit
router.get("/audit", adminMiddleware, controller.getAudit);

module.exports = router;
