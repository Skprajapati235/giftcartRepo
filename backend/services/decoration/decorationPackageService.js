const DecorationPackage = require("../../models/DecorationPackage");

/**
 * Service for Decoration Packages Catalog CRUD operations
 */
class DecorationPackageService {
  /**
   * Get all active decoration packages (Public & Storefront) with pagination & filters
   */
  async getPackages({ category, city, search, page = 1, limit = 12 } = {}) {
    const conditions = [{ isActive: true }];

    if (category && category !== "all") {
      conditions.push({ category });
    }

    if (city && city !== "all") {
      conditions.push({
        $or: [{ availableCities: { $size: 0 } }, { availableCities: city }],
      });
    }

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      conditions.push({
        $or: [
          { title: { $regex: escaped, $options: "i" } },
          { summary: { $regex: escaped, $options: "i" } },
          { description: { $regex: escaped, $options: "i" } },
        ],
      });
    }

    const query = conditions.length === 1 ? conditions[0] : { $and: conditions };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 12);
    const skip = (pageNum - 1) * limitNum;

    const packages = await DecorationPackage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await DecorationPackage.countDocuments(query);

    return {
      packages,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Get package by slug or Mongo ID
   */
  async getPackageBySlugOrId(slugOrId) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
    const query = isObjectId ? { $or: [{ slug: slugOrId }, { _id: slugOrId }] } : { slug: slugOrId };

    const pkg = await DecorationPackage.findOne(query);
    if (!pkg) {
      throw new Error("Decoration package not found");
    }
    return pkg;
  }

  /**
   * Create new package (Admin)
   */
  async createPackage(data) {
    const {
      title,
      slug,
      price,
      salePrice,
      category,
      images,
      coverImage,
      summary,
      description,
      inclusions,
      estimatedSetupTime,
      colorThemes,
      availableCities,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = data;

    if (!title || !price) {
      throw new Error("Title and price are required");
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newPkg = new DecorationPackage({
      title: title.trim(),
      slug: finalSlug,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      category: category || "Hotel Room Decor",
      images: Array.isArray(images) ? images : [],
      coverImage: coverImage || (images && images[0]) || "",
      summary: summary || "",
      description: description || "",
      inclusions: Array.isArray(inclusions) ? inclusions : [],
      estimatedSetupTime: estimatedSetupTime || "1.5 to 2 hours",
      colorThemes: Array.isArray(colorThemes) && colorThemes.length ? colorThemes : undefined,
      availableCities: Array.isArray(availableCities) ? availableCities : [],
      seoTitle: seoTitle || `${title} - Surprise Party & Hotel Decor`,
      seoDescription: seoDescription || summary || description,
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : [],
    });

    return await newPkg.save();
  }

  /**
   * Update existing package
   */
  async updatePackage(id, data) {
    const pkg = await DecorationPackage.findById(id);
    if (!pkg) {
      throw new Error("Package not found");
    }

    Object.assign(pkg, data);
    return await pkg.save();
  }

  /**
   * Delete package
   */
  async deletePackage(id) {
    const pkg = await DecorationPackage.findByIdAndDelete(id);
    if (!pkg) {
      throw new Error("Package not found");
    }
    return true;
  }
}

module.exports = new DecorationPackageService();

