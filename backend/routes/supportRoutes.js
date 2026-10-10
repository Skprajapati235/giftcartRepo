const express = require("express");
const router = express.Router();
const controller = require("../controllers/supportController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public endpoint for customer to submit inquiry
router.post("/contact", controller.createTicket);

// Admin-only endpoints
const supportManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "support_agent"],
  ["/support"]
);

router.get("/tickets", authMiddleware, adminMiddleware, supportManage, controller.getTickets);
router.get("/tickets/:id", authMiddleware, adminMiddleware, supportManage, controller.getTicketById);
router.put("/tickets/:id/status", authMiddleware, adminMiddleware, supportManage, controller.updateTicketStatus);
router.put("/tickets/:id/reply", authMiddleware, adminMiddleware, supportManage, controller.replyTicket);
router.delete("/tickets/:id", authMiddleware, adminMiddleware, supportManage, controller.deleteTicket);
router.post("/bulk-delete", authMiddleware, adminMiddleware, supportManage, controller.bulkDeleteTickets);

module.exports = router;
