const express = require("express");
const router = express.Router();
const controller = require("../controllers/abandonedCartController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const supportAccess = adminMiddleware.requireRole(
  ["super_admin", "admin", "support_agent"],
  ["/abandoned-carts"]
);

router.get("/", authMiddleware, adminMiddleware, supportAccess, controller.getAbandonedCarts);
router.post("/:id/recover", authMiddleware, adminMiddleware, supportAccess, controller.recordRecoveryDispatch);
router.put("/:id/mark-recovered", authMiddleware, adminMiddleware, supportAccess, controller.markRecovered);

module.exports = router;
