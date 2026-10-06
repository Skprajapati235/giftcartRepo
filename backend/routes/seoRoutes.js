const router = require("express").Router();
const controller = require("../controllers/seoController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public endpoints (used by frontend website and search bots)
router.get("/global", controller.getGlobal);
router.get("/page", controller.getPageByPath);
router.get("/category", controller.getCategorySeo);
router.get("/occasion", controller.getOccasionSeo);
router.get("/sitemap-data", controller.getSitemapData);
router.get("/robots-data", controller.getRobotsData);
router.get("/check-redirect", controller.checkRedirect);

const seoManage = adminMiddleware.requireRole(["super_admin", "admin", "seo_specialist"]);

// Admin endpoints (protected by adminMiddleware and seoManage)
router.put("/global", adminMiddleware, seoManage, controller.updateGlobal);

// Page SEO CRUD
router.get("/pages", adminMiddleware, seoManage, controller.getAllPages);
router.post("/pages", adminMiddleware, seoManage, controller.createPage);
router.post("/seed", adminMiddleware, seoManage, controller.seedPages);
router.put("/pages/:id", adminMiddleware, seoManage, controller.updatePage);
router.delete("/pages/:id", adminMiddleware, seoManage, controller.deletePage);

// Redirects CRUD
router.get("/redirects", adminMiddleware, seoManage, controller.getAllRedirects);
router.post("/redirects", adminMiddleware, seoManage, controller.createRedirect);
router.put("/redirects/:id", adminMiddleware, seoManage, controller.updateRedirect);
router.delete("/redirects/:id", adminMiddleware, seoManage, controller.deleteRedirect);

// SEO Health Audit
router.get("/audit", adminMiddleware, seoManage, controller.getAudit);

module.exports = router;
