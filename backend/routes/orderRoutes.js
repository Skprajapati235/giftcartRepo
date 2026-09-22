// const router = require("express").Router();
// const controller = require("../controllers/orderController");
// const authMiddleware = require("../middleware/authMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");

// // User routes
// router.post("/create", authMiddleware, controller.createOrder);
// router.post("/verify", authMiddleware, controller.verifyPayment);
// router.get("/user", authMiddleware, controller.getUserOrders);
// router.get("/user/:id", authMiddleware, controller.getOrderById);
// router.delete("/user/:id", authMiddleware, controller.deleteUserOrder);

// // Public customer tracking (token-based)
// router.get("/public/:token", controller.getPublicOrderByToken);

// // Admin routes
// router.get("/admin/all", authMiddleware, adminMiddleware, controller.getAllOrders);
// router.get("/admin/unviewed", authMiddleware, adminMiddleware, controller.getUnviewedOrders);
// router.get("/admin/detail/:id", authMiddleware, adminMiddleware, controller.getOrderById);
// router.put("/admin/:id/status", authMiddleware, adminMiddleware, controller.updateOrderStatus);
// router.post("/admin/bulk-delete", authMiddleware, adminMiddleware, controller.deleteMultipleOrders);
// router.delete("/admin/:id", authMiddleware, adminMiddleware, controller.deleteOrder);
// router.put("/admin/:id/viewed", authMiddleware, adminMiddleware, controller.markOrderAsViewed);
// router.get("/admin/payments", authMiddleware, adminMiddleware, controller.getPaymentHistory);
// router.get("/admin/:id/invoice", authMiddleware, adminMiddleware, controller.downloadInvoice);

// module.exports = router;



const router = require("express").Router();
const controller = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// User routes
router.post("/create", authMiddleware, controller.createOrder);
router.post("/verify", authMiddleware, controller.verifyPayment);
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
router.get("/admin/all", authMiddleware, adminMiddleware, controller.getAllOrders);
router.get("/admin/unviewed", authMiddleware, adminMiddleware, controller.getUnviewedOrders);
router.get("/admin/detail/:id", authMiddleware, adminMiddleware, controller.getOrderById);
router.put("/admin/:id/status", authMiddleware, adminMiddleware, controller.updateOrderStatus);
router.post("/admin/bulk-delete", authMiddleware, adminMiddleware, controller.deleteMultipleOrders);
router.delete("/admin/:id", authMiddleware, adminMiddleware, controller.deleteOrder);
router.put("/admin/:id/viewed", authMiddleware, adminMiddleware, controller.markOrderAsViewed);
router.get("/admin/payments", authMiddleware, adminMiddleware, controller.getPaymentHistory);
router.get("/admin/:id/invoice", authMiddleware, adminMiddleware, controller.downloadInvoice);

module.exports = router;