const service = require("../services/productService");

exports.create = async (req, res) => {
  try {
    const data = await service.createProduct(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.getAll = async (req, res) => {
//   try {
//     const { page, limit, search, category } = req.query;
//     console.log("Fetching products with filters:", { page, limit, search, category });
//     const data = await service.getProducts({ 
//       page: parseInt(page) || 1, 
//       limit: parseInt(limit) || 10, 
//       search: search || "",
//       category: category || ""
//     });
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search, category, flavor, city, occasion } = req.query;
    console.log("Fetching products with filters:", { page, limit, search, category, flavor, city, occasion });
    const data = await service.getProducts({ 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 10, 
      search: search || "",
      category: category || "",
      flavor: flavor || "",
      city: city || "",
      occasion: occasion || ""
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await service.getProductById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateProduct(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await service.deleteProduct(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const escapeCsv = (val) => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// GET /api/product/export/:format
exports.exportProducts = async (req, res) => {
  try {
    const format = (req.params.format || "csv").toLowerCase();
    const Product = require("../models/Product");
    const products = await Product.find().populate("category", "name").limit(1000).lean();

    const { logActivity } = require("../utils/auditLogger");
    await logActivity({
      req,
      action: `Exported Products (${format.toUpperCase()})`,
      module: "Catalog",
      details: `Exported ${products.length} product items with SKU, prices, stock, and categories in ${format.toUpperCase()} format.`,
      format,
      severity: "info",
      metadata: { count: products.length, format },
    });

    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === "json") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="giftfestive-products-${dateStr}.json"`);
      return res.status(200).send(JSON.stringify(products, null, 2));
    }

    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "MRP Price",
      "Sale Price",
      "Stock",
      "Eggless Option",
      "Created At",
    ];

    const rows = products.map((p) => [
      escapeCsv(p.sku || p._id),
      escapeCsv(p.name),
      escapeCsv(p.category?.name || "Uncategorized"),
      escapeCsv(p.price || 0),
      escapeCsv(p.salePrice || p.price || 0),
      escapeCsv(p.stock !== undefined ? p.stock : "In Stock"),
      escapeCsv(p.hasEgglessOption ? "Yes" : "No"),
      escapeCsv(p.createdAt ? new Date(p.createdAt).toISOString() : ""),
    ]);

    const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="giftfestive-products-${dateStr}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export Products Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};