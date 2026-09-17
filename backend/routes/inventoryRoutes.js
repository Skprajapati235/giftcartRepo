const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// All inventory endpoints require admin authentication
router.use(authMiddleware, adminMiddleware);

// High-level summary metrics
router.get("/summary", inventoryController.getSummary);

// Export endpoints (placed before parametric routes)
router.get("/export/excel", inventoryController.exportExcel);
router.get("/export/pdf", inventoryController.exportPdf);

// Bulk stock update
router.post("/bulk-stock", inventoryController.bulkUpdateStock);

// Paginated, searchable, filterable items list
router.get("/", inventoryController.getItems);

// Quick stock update for a single product
router.put("/:id/stock", inventoryController.updateStock);

module.exports = router;
