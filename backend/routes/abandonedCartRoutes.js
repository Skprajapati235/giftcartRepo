const express = require("express");
const router = express.Router();
const controller = require("../controllers/abandonedCartController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", authMiddleware, adminMiddleware, controller.getAbandonedCarts);
router.post("/:id/recover", authMiddleware, adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin", "support_agent"]), controller.recordRecoveryDispatch);
router.put("/:id/mark-recovered", authMiddleware, adminMiddleware, adminMiddleware.requireRole(["super_admin", "admin", "support_agent"]), controller.markRecovered);

module.exports = router;
