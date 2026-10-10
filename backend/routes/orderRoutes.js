
const router = require("express").Router();
const controller = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// User routes
router.post("/create", authMiddleware, controller.createOrder);
router.post("/verify", authMiddleware, controller.verifyPayment);
router.post("/cancel-payment", authMiddleware, controller.cancelPayment);
router.post("/:id/cancel-payment", authMiddleware, controller.cancelPayment);
router.post("/:id/send-email", authMiddleware, controller.sendOrderEmail);
router.get("/user", authMiddleware, controller.getUserOrders);
router.get("/user/:id", authMiddleware, controller.getOrderById);
router.delete("/user/:id", authMiddleware, controller.deleteUserOrder);

// Public customer tracking (token-based)
router.get("/public/:token", controller.getPublicOrderByToken);

// Public order-status action links used from the admin notification email.
// Protected by a signed token (see utils/orderActionToken.js), not by login,
// since these links are clicked straight from Gmail/Outlook.
router.get("/email-action/:id/:status", controller.emailActionPreview);
router.post("/email-action/:id/:status", controller.emailActionConfirm);

// Admin routes
const orderAccess = adminMiddleware.requireRole(
  ["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent"],
  ["/orders", "/orders/board"]
);
const orderDelete = adminMiddleware.requireRole(
  ["super_admin", "admin"],
  ["/orders"]
);
const paymentsAccess = adminMiddleware.requireRole(
  ["super_admin", "admin"],
  ["/payments"]
);

router.get("/admin/export/:format", authMiddleware, adminMiddleware, orderAccess, controller.exportOrders);
router.get("/admin/all", authMiddleware, adminMiddleware, orderAccess, controller.getAllOrders);
router.get("/admin/unviewed", authMiddleware, adminMiddleware, orderAccess, controller.getUnviewedOrders);
router.get("/admin/detail/:id", authMiddleware, adminMiddleware, orderAccess, controller.getOrderById);
router.put("/admin/:id/status", authMiddleware, adminMiddleware, orderAccess, controller.updateOrderStatus);
router.post("/admin/test-whatsapp", authMiddleware, adminMiddleware, orderAccess, controller.testWhatsApp);
router.put("/admin/:id/kitchen-status", authMiddleware, adminMiddleware, orderAccess, controller.updateKitchenStatus);
router.post("/admin/bulk-delete", authMiddleware, adminMiddleware, orderDelete, controller.deleteMultipleOrders);
router.delete("/admin/:id", authMiddleware, adminMiddleware, orderDelete, controller.deleteOrder);
router.put("/admin/:id/viewed", authMiddleware, adminMiddleware, orderAccess, controller.markOrderAsViewed);
router.get("/admin/payments", authMiddleware, adminMiddleware, paymentsAccess, controller.getPaymentHistory);
router.get("/admin/:id/invoice", authMiddleware, adminMiddleware, orderAccess, controller.downloadInvoice);

module.exports = router;