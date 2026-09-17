const express = require("express");
const router = express.Router();
const controller = require("../controllers/supportController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public endpoint for customer to submit inquiry
router.post("/contact", controller.createTicket);

// Admin-only endpoints
router.get("/tickets", authMiddleware, adminMiddleware, controller.getTickets);
router.get("/tickets/:id", authMiddleware, adminMiddleware, controller.getTicketById);
router.put("/tickets/:id/status", authMiddleware, adminMiddleware, controller.updateTicketStatus);
router.put("/tickets/:id/reply", authMiddleware, adminMiddleware, controller.replyTicket);
router.delete("/tickets/:id", authMiddleware, adminMiddleware, controller.deleteTicket);
router.post("/bulk-delete", authMiddleware, adminMiddleware, controller.bulkDeleteTickets);

module.exports = router;
