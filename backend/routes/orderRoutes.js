const router = require("express").Router();
const controller = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// User routes
router.post("/create", authMiddleware, controller.createOrder);
router.post("/verify", authMiddleware, controller.verifyPayment);
router.get("/user", authMiddleware, controller.getUserOrders);

// Admin routes
router.get("/admin/all", authMiddleware, adminMiddleware, controller.getAllOrders);
router.get("/admin/detail/:id", authMiddleware, adminMiddleware, controller.getOrderById);
router.put("/admin/:id/status", authMiddleware, adminMiddleware, controller.updateOrderStatus);
router.get("/admin/payments", authMiddleware, adminMiddleware, controller.getPaymentHistory);

module.exports = router;
