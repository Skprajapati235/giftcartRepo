const Product = require("../models/Product");
const Category = require("../models/Category");

/**
 * Format a single product into a standardized inventory item
 */
const formatInventoryItem = (p) => {
  const stock = typeof p.stock === "number" ? Math.max(0, p.stock) : 0;
  const lowStockThreshold = typeof p.lowStockThreshold === "number" ? Math.max(0, p.lowStockThreshold) : 5;
  const price = typeof p.price === "number" ? p.price : 0;
  const salePrice = typeof p.salePrice === "number" && p.salePrice > 0 ? p.salePrice : price;
  const catName = p.category?.name || "Uncategorized";
  const catCode = catName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "PRD";
  const idSnippet = p._id ? p._id.toString().slice(-4).toUpperCase() : "0000";
  const sku = p.sku && p.sku.trim() ? p.sku.trim() : `GC-${catCode}-${idSnippet}`;

  let stockStatus = "in_stock";
  let stockStatusLabel = "In Stock";
  if (stock === 0) {
    stockStatus = "out_of_stock";
    stockStatusLabel = "Out of Stock";
  } else if (stock <= lowStockThreshold) {
    stockStatus = "low_stock";
    stockStatusLabel = "Low Stock";
  }

  const totalValuation = stock * salePrice;
  const totalValuationMRP = stock * price;

  return {
    _id: p._id,
    name: p.name,
    sku,
    category: p.category ? { _id: p.category._id, name: p.category.name } : null,
    image: p.image || (p.images && p.images[0]) || "",
    price,
    salePrice,
    discount: p.discount || 0,
    tax: p.tax || 0,
    shippingCost: p.shippingCost || 0,
    stock,
    lowStockThreshold,
    stockStatus,
    stockStatusLabel,
    totalValuation,
    totalValuationMRP,
    flowerCount: p.flowerCount || "",
    weight: p.weight || "",
    flowerCountOptions: p.flowerCountOptions || [],
    weightOptions: p.weightOptions || [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

/**
 * Get high-level summary KPIs of inventory
 */
exports.getInventorySummary = async () => {
  const products = await Product.find()
    .populate("category", "name")
    .lean();

  let totalProducts = products.length;
  let totalStock = 0;
  let totalValueSelling = 0;
  let totalValueMRP = 0;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const categoryMap = {};
  const lowStockAlerts = [];

  for (const raw of products) {
    const item = formatInventoryItem(raw);
    totalStock += item.stock;
    totalValueSelling += item.totalValuation;
    totalValueMRP += item.totalValuationMRP;

    if (item.stockStatus === "out_of_stock") {
      outOfStockCount++;
      lowStockAlerts.push({
        _id: item._id,
        name: item.name,
        sku: item.sku,
        stock: item.stock,
        status: "out_of_stock",
      });
    } else if (item.stockStatus === "low_stock") {
      lowStockCount++;
      lowStockAlerts.push({
        _id: item._id,
        name: item.name,
        sku: item.sku,
        stock: item.stock,
        status: "low_stock",
      });
    } else {
      inStockCount++;
    }

    const catName = item.category?.name || "Other";
    if (!categoryMap[catName]) {
      categoryMap[catName] = { name: catName, productCount: 0, totalStock: 0, totalValue: 0 };
    }
    categoryMap[catName].productCount++;
    categoryMap[catName].totalStock += item.stock;
    categoryMap[catName].totalValue += item.totalValuation;
  }

  return {
    totalProducts,
    totalStock,
    totalValueSelling: Math.round(totalValueSelling),
    totalValueMRP: Math.round(totalValueMRP),
    inStockCount,
    lowStockCount,
    outOfStockCount,
    categoriesCount: Object.keys(categoryMap).length,
    categoryBreakdown: Object.values(categoryMap),
    lowStockAlerts: lowStockAlerts.slice(0, 10),
  };
};

/**
 * Get paginated, filtered, searchable inventory items
 */
exports.getInventoryItems = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
  category = "all",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);

  const conditions = [];

  if (search && search.trim()) {
    const s = search.trim();
    conditions.push({
      $or: [
        { name: { $regex: s, $options: "i" } },
        { sku: { $regex: s, $options: "i" } },
        { flowerCount: { $regex: s, $options: "i" } },
        { weight: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ],
    });
  }

  if (category && category !== "all" && category !== "null" && category !== "undefined") {
    conditions.push({ category });
  }

  const query = conditions.length ? { $and: conditions } : {};

  // Fetch candidate products
  const products = await Product.find(query)
    .populate("category", "name")
    .lean();

  // Format and compute inventory fields
  let items = products.map(formatInventoryItem);

  // Apply status filter in memory (allows dynamic threshold comparison)
  if (status && status !== "all") {
    if (status === "out_of_stock") {
      items = items.filter((item) => item.stockStatus === "out_of_stock");
    } else if (status === "low_stock") {
      items = items.filter((item) => item.stockStatus === "low_stock");
    } else if (status === "in_stock") {
      items = items.filter((item) => item.stockStatus === "in_stock");
    }
  }

  // Sorting
  items.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === "valuation") {
      valA = a.totalValuation;
      valB = b.totalValuation;
    } else if (sortBy === "name") {
      return sortOrder === "asc"
        ? (a.name || "").localeCompare(b.name || "")
        : (b.name || "").localeCompare(a.name || "");
    } else if (sortBy === "category") {
      const catA = a.category?.name || "";
      const catB = b.category?.name || "";
      return sortOrder === "asc" ? catA.localeCompare(catB) : catB.localeCompare(catA);
    }

    if (valA === undefined || valA === null) valA = 0;
    if (valB === undefined || valB === null) valB = 0;

    if (sortOrder === "asc") {
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    } else {
      return valA < valB ? 1 : valA > valB ? -1 : 0;
    }
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limitNum));
  const skip = (pageNum - 1) * limitNum;
  const paginatedItems = items.slice(skip, skip + limitNum);

  return {
    items: paginatedItems,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
  };
};

/**
 * Quick stock update for a single product or its variants
 */
exports.updateProductStock = async (productId, {
  stock,
  operation = "set",
  lowStockThreshold,
  sku,
  variantType,
  variantId,
}) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  // If updating a variant's stock
  if (variantType && variantId) {
    if (variantType === "flowerCountOptions" && product.flowerCountOptions) {
      const variant = product.flowerCountOptions.id(variantId);
      if (variant) {
        let currentStock = variant.stock || 0;
        let newStock = Number(stock) || 0;
        if (operation === "add") newStock = Math.max(0, currentStock + newStock);
        else if (operation === "subtract") newStock = Math.max(0, currentStock - newStock);
        else newStock = Math.max(0, newStock);
        variant.stock = newStock;
        if (sku !== undefined) variant.sku = sku;
      }
    } else if (variantType === "weightOptions" && product.weightOptions) {
      const variant = product.weightOptions.id(variantId);
      if (variant) {
        let currentStock = variant.stock || 0;
        let newStock = Number(stock) || 0;
        if (operation === "add") newStock = Math.max(0, currentStock + newStock);
        else if (operation === "subtract") newStock = Math.max(0, currentStock - newStock);
        else newStock = Math.max(0, newStock);
        variant.stock = newStock;
        if (sku !== undefined) variant.sku = sku;
      }
    }
  } else {
    // Root level product stock
    if (stock !== undefined && stock !== null) {
      const currentStock = product.stock || 0;
      const numStock = Number(stock) || 0;
      let newStock = numStock;
      if (operation === "add") newStock = Math.max(0, currentStock + numStock);
      else if (operation === "subtract") newStock = Math.max(0, currentStock - numStock);
      else newStock = Math.max(0, numStock);
      product.stock = newStock;
    }

    if (lowStockThreshold !== undefined && lowStockThreshold !== null) {
      product.lowStockThreshold = Math.max(0, Number(lowStockThreshold) || 0);
    }

    if (sku !== undefined && typeof sku === "string") {
      product.sku = sku.trim();
    }
  }

  await product.save();
  const populated = await Product.findById(product._id).populate("category", "name").lean();
  return formatInventoryItem(populated);
};

/**
 * Bulk update stock for multiple products
 */
exports.bulkUpdateStock = async (updates = []) => {
  const results = [];
  for (const update of updates) {
    if (!update.id) continue;
    try {
      const updated = await exports.updateProductStock(update.id, update);
      results.push({ id: update.id, success: true, item: updated });
    } catch (err) {
      results.push({ id: update.id, success: false, error: err.message });
    }
  }
  return results;
};

/**
 * Get all inventory items for full unpaginated export
 */
exports.getAllInventoryForExport = async ({
  search = "",
  status = "all",
  category = "all",
} = {}) => {
  const conditions = [];

  if (search && search.trim()) {
    const s = search.trim();
    conditions.push({
      $or: [
        { name: { $regex: s, $options: "i" } },
        { sku: { $regex: s, $options: "i" } },
        { flowerCount: { $regex: s, $options: "i" } },
        { weight: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ],
    });
  }

  if (category && category !== "all" && category !== "null" && category !== "undefined") {
    conditions.push({ category });
  }

  const query = conditions.length ? { $and: conditions } : {};

  const products = await Product.find(query)
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();

  let items = products.map(formatInventoryItem);

  if (status && status !== "all") {
    if (status === "out_of_stock") {
      items = items.filter((item) => item.stockStatus === "out_of_stock");
    } else if (status === "low_stock") {
      items = items.filter((item) => item.stockStatus === "low_stock");
    } else if (status === "in_stock") {
      items = items.filter((item) => item.stockStatus === "in_stock");
    }
  }

  return items;
};
