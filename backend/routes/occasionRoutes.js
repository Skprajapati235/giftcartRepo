const express = require("express");
const router = express.Router();
const controller = require("../controllers/occasionController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public — navbar list + category filter (supports ?all=true for the
// lightweight full list, or ?page/&limit/&search for the admin table).
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);

// Admin — create/edit/delete occasions.
const occasionManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "seo_specialist", "kitchen_manager"],
  ["/occasions"]
);

router.post("/", adminMiddleware, occasionManage, controller.create);
router.put("/:id", adminMiddleware, occasionManage, controller.update);
router.delete("/:id", adminMiddleware, occasionManage, controller.delete);

module.exports = router;
