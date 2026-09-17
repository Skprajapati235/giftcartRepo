const inventoryService = require("../services/inventoryService");
const inventoryPdfGenerator = require("../utils/inventoryPdfGenerator");

/**
 * Helper to escape CSV cell value
 */
const escapeCsv = (val) => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * GET /api/inventory/summary
 */
exports.getSummary = async (req, res) => {
  try {
    const summary = await inventoryService.getInventorySummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/inventory
 */
exports.getItems = async (req, res) => {
  try {
    const result = await inventoryService.getInventoryItems(req.query);
    res.json({
      success: true,
      data: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/inventory/:id/stock
 */
exports.updateStock = async (req, res) => {
  try {
    const updated = await inventoryService.updateProductStock(req.params.id, req.body);
    res.json({
      success: true,
      message: "Stock updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/inventory/bulk-stock
 */
exports.bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: "updates must be a non-empty array" });
    }
    const results = await inventoryService.bulkUpdateStock(updates);
    res.json({
      success: true,
      message: `${results.filter((r) => r.success).length} items updated`,
      data: results,
    });
  } catch (error) {
    console.error("Error in bulk stock update:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/inventory/export/excel
 * Exports complete inventory as an Excel-ready CSV (with UTF-8 BOM)
 */
exports.exportExcel = async (req, res) => {
  try {
    const items = await inventoryService.getAllInventoryForExport(req.query);

    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "Flower Count / Weight",
      "Price MRP (INR)",
      "Sale Price (INR)",
      "Discount (%)",
      "Stock Quantity",
      "Low Stock Threshold",
      "Stock Status",
      "Valuation Selling (INR)",
      "Valuation MRP (INR)",
      "Created At",
      "Last Updated",
    ];

    const rows = items.map((item) => [
      escapeCsv(item.sku),
      escapeCsv(item.name),
      escapeCsv(item.category?.name || "Uncategorized"),
      escapeCsv(item.flowerCount || item.weight || (item.flowerCountOptions?.length ? `${item.flowerCountOptions.length} Sizes` : "—")),
      escapeCsv(item.price),
      escapeCsv(item.salePrice),
      escapeCsv(item.discount),
      escapeCsv(item.stock),
      escapeCsv(item.lowStockThreshold),
      escapeCsv(item.stockStatusLabel),
      escapeCsv(item.totalValuation),
      escapeCsv(item.totalValuationMRP),
      escapeCsv(item.createdAt ? new Date(item.createdAt).toISOString() : "—"),
      escapeCsv(item.updatedAt ? new Date(item.updatedAt).toISOString() : "—"),
    ]);

    // UTF-8 BOM (\uFEFF) ensures Excel correctly displays special characters and utf-8 text
    const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="giftora-inventory-${dateStr}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting inventory to Excel/CSV:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/inventory/export/pdf
 * Generates and streams PDF report using pdfkit
 */
exports.exportPdf = async (req, res) => {
  try {
    const items = await inventoryService.getAllInventoryForExport(req.query);
    const summary = await inventoryService.getInventorySummary();

    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="giftora-inventory-${dateStr}.pdf"`);

    await inventoryPdfGenerator.generateInventoryPDF(items, summary, res);
  } catch (error) {
    console.error("Error exporting inventory to PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
