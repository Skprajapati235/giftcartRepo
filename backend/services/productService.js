const Product = require("../models/Product");

exports.createProduct = async (data) => {
  if (data.flavor === "" || data.flavor === "null" || data.flavor === "undefined") {
    data.flavor = undefined;
  }
  if (data.flowerCount === "" || data.flowerCount === "null" || data.flowerCount === "undefined") {
    data.flowerCount = undefined;
  } else if (typeof data.flowerCount === "string") {
    data.flowerCount = data.flowerCount.trim();
  }
  if (data.weight === "" || data.weight === "null" || data.weight === "undefined") {
    data.weight = undefined;
  } else if (typeof data.weight === "string") {
    data.weight = data.weight.trim();
  }
  if (data.sku !== undefined && typeof data.sku === "string") {
    data.sku = data.sku.trim();
  }
  if (data.stock !== undefined) {
    data.stock = Math.max(0, parseInt(data.stock, 10) || 0);
  }
  if (data.lowStockThreshold !== undefined) {
    data.lowStockThreshold = Math.max(0, parseInt(data.lowStockThreshold, 10) || 5);
  }
  console.log("Creating Product with cleaned data:", data);
  try {
    const product = await Product.create(data);
    console.log("Saved Product:", product);
    return product;
  } catch (error) {
    console.error("Error creating product details:", {
      message: error.message,
      stack: error.stack,
      data: data
    });
    throw error;
  }
};

// exports.getProducts = async ({ page = 1, limit = 10, search = "", category = "" } = {}) => {
//   const skip = (page - 1) * limit;
//   let query = {};
//   if (search) {
//     query.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { description: { $regex: search, $options: "i" } },
//     ];
//   }
//   if (category && category !== "all" && category !== "null" && category !== "undefined") {
//     query.category = category;
//   }

//   const products = await Product.find(query)
//     .populate("category")
//     .populate("flavor")
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//   const total = await Product.countDocuments(query);

//   return {
//     data: products,
//     total,
//     page: Number(page),
//     totalPages: Math.ceil(total / limit),
//   };
// };


exports.getProducts = async ({ page = 1, limit = 10, search = "", category = "", flavor = "", city = "", occasion = "" } = {}) => {
  const skip = (page - 1) * limit;
  const conditions = [];

  if (search) {
    conditions.push({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    });
  }
  if (category && category !== "all" && category !== "null" && category !== "undefined") {
    conditions.push({ category });
  }
  if (flavor && flavor !== "all" && flavor !== "null" && flavor !== "undefined") {
    conditions.push({ flavor });
  }
  if (occasion && occasion !== "all" && occasion !== "null" && occasion !== "undefined") {
    conditions.push({ occasions: occasion });
  }
  if (city && city !== "all" && city !== "null" && city !== "undefined") {
    // A product with no availableCities set is available everywhere.
    conditions.push({
      $or: [
        { availableCities: { $exists: false } },
        { availableCities: { $size: 0 } },
        { availableCities: { $regex: `^${city}$`, $options: "i" } },
      ],
    });
  }

  const query = conditions.length ? { $and: conditions } : {};

  const products = await Product.find(query)
    .populate("category")
    .populate("flavor")
    .populate("occasions")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);

  return {
    data: products,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};
exports.getProductById = async (id) => {
  return await Product.findById(id).populate("category").populate("flavor").populate("occasions");
};

exports.updateProduct = async (id, data) => {
  if (data.flavor === "" || data.flavor === "null" || data.flavor === "undefined") {
    data.flavor = null;
  }
  if (data.flowerCount === "" || data.flowerCount === "null" || data.flowerCount === "undefined") {
    data.flowerCount = null;
  } else if (typeof data.flowerCount === "string") {
    data.flowerCount = data.flowerCount.trim();
  }
  if (data.weight === "" || data.weight === "null" || data.weight === "undefined") {
    data.weight = null;
  } else if (typeof data.weight === "string") {
    data.weight = data.weight.trim();
  }
  if (data.sku !== undefined && typeof data.sku === "string") {
    data.sku = data.sku.trim();
  }
  if (data.stock !== undefined) {
    data.stock = Math.max(0, parseInt(data.stock, 10) || 0);
  }
  if (data.lowStockThreshold !== undefined) {
    data.lowStockThreshold = Math.max(0, parseInt(data.lowStockThreshold, 10) || 5);
  }
  try {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    console.error("Error updating product details:", {
      message: error.message,
      stack: error.stack,
      id,
      data
    });
    throw error;
  }
};

exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};