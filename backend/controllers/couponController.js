const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

// Admin: Create Coupon
exports.create = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: Get all coupons
exports.getAll = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const skip = (p - 1) * l;
    const query = search ? { code: { $regex: search, $options: "i" } } : {};

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l);

    const total = await Coupon.countDocuments(query);

    res.json({
      data: coupons,
      total,
      page: p,
      totalPages: Math.ceil(total / l),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update Coupon
exports.update = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: Delete Coupon
exports.delete = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: Validate Coupon
// Requires login (route has authMiddleware) so isNewUserOnly can be
// checked against req.user.id. `items` (optional) lets the frontend send
// the cart's product/occasion ids so product- and occasion-specific
// offers can be checked too — if omitted, only amount/expiry/usage/
// new-user rules are checked.
exports.validate = async (req, res) => {
  const { code, amount, items } = req.body;
  try {
    const coupon = await Coupon.findOne({ code: String(code || "").toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or inactive coupon code" });
    }

    // Check expiry
    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    // Check minimum order amount
    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}` });
    }

    // New-user-only offers — "new" means this account has never had a
    // paid/placed order before (Pending counts too — it means they've
    // already completed checkout once).
    if (coupon.isNewUserOnly) {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Please login to use this offer" });
      }
      const priorOrder = await Order.exists({ user: req.user.id });
      if (priorOrder) {
        return res.status(400).json({ message: "This offer is only valid for new users" });
      }
    }

    // Product-specific offers — every item in the cart must be one of the
    // allowed products.
    if (Array.isArray(coupon.applicableProducts) && coupon.applicableProducts.length > 0) {
      const allowed = new Set(coupon.applicableProducts.map((p) => String(p)));
      const cartProductIds = (items || []).map((i) => String(i.productId || i._id || ""));
      const allMatch = cartProductIds.length > 0 && cartProductIds.every((id) => allowed.has(id));
      if (!allMatch) {
        return res.status(400).json({ message: "This offer applies only to specific products in your cart" });
      }
    }

    // Occasion-specific offers — every item in the cart must belong to at
    // least one of the allowed occasions.
    if (Array.isArray(coupon.applicableOccasions) && coupon.applicableOccasions.length > 0) {
      const allowed = new Set(coupon.applicableOccasions.map((o) => String(o)));
      const cartItems = items || [];
      const allMatch =
        cartItems.length > 0 &&
        cartItems.every((i) => (i.occasions || []).some((occId) => allowed.has(String(occId))));
      if (!allMatch) {
        return res.status(400).json({ message: "This offer applies only to specific occasions" });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      message: "Coupon applied successfully",
      discountAmount,
      coupon: coupon.code
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: Get active coupons for display
exports.getActive = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const skip = (p - 1) * l;

    const query = { 
      isActive: true, 
      expiryDate: { $gt: new Date() } 
    };

    const coupons = await Coupon.find(query)
      .select("code discountType discountValue minOrderAmount maxDiscount expiryDate image isNewUserOnly applicableProducts applicableOccasions")
      .populate("applicableProducts", "name image")
      .populate("applicableOccasions", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l);

    const total = await Coupon.countDocuments(query);

    res.json({
      data: coupons,
      total,
      page: p,
      totalPages: Math.ceil(total / l),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
