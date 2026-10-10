const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { logActivity } = require("../utils/auditLogger");

// Admin: Create Coupon
exports.create = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    await logActivity({
      req,
      action: "Created Coupon",
      module: "Coupons",
      details: `Created promo code "${coupon.code}" (${coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}).`,
      severity: "info",
      metadata: { couponId: coupon._id, code: coupon.code, discountValue: coupon.discountValue },
    });
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
    if (coupon) {
      await logActivity({
        req,
        action: "Updated Coupon",
        module: "Coupons",
        details: `Updated coupon "${coupon.code}".`,
        severity: "info",
        metadata: { couponId: coupon._id, code: coupon.code },
      });
    }
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: Delete Coupon
exports.delete = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    await logActivity({
      req,
      action: "Deleted Coupon",
      module: "Coupons",
      details: `Permanently removed coupon "${coupon?.code || req.params.id}".`,
      severity: "warning",
      metadata: { couponId: req.params.id, code: coupon?.code },
    });
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
      const diff = Math.ceil(coupon.minOrderAmount - amount);
      return res.status(400).json({ 
        message: `Add ₹${diff} more to unlock coupon ${coupon.code} (Min order: ₹${coupon.minOrderAmount})` 
      });
    }

    // New-user-only offers — "new" means this account has never had an active/placed order
    if (coupon.isNewUserOnly) {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Please login to use this new-user exclusive offer" });
      }
      const priorOrder = await Order.exists({ user: req.user.id, status: { $ne: "Cancelled" } });
      if (priorOrder) {
        return res.status(400).json({ message: "This offer is only valid on your first order" });
      }
    }

    // Per-user usage limit check
    if (coupon.perUserLimit && coupon.perUserLimit > 0 && req.user?.id) {
      const userUsageCount = await Order.countDocuments({
        user: req.user.id,
        couponCode: coupon.code,
        status: { $ne: "Cancelled" },
      });
      if (userUsageCount >= coupon.perUserLimit) {
        return res.status(400).json({
          message: `You have already used this coupon the maximum allowed number of times (${coupon.perUserLimit} time${coupon.perUserLimit > 1 ? "s" : ""})`,
        });
      }
    }

    const cartItems = items || [];
    const cartProductIds = cartItems.map((i) => String(i.productId || i._id || i.product || "")).filter(Boolean);

    // Product-specific offers — at least one product in the cart must be in applicableProducts
    if (Array.isArray(coupon.applicableProducts) && coupon.applicableProducts.length > 0) {
      const allowed = new Set(coupon.applicableProducts.map((p) => String(p)));
      const hasMatch = cartProductIds.length > 0 && cartProductIds.some((id) => allowed.has(id));
      if (!hasMatch) {
        return res.status(400).json({ message: "This coupon is not applicable to any items currently in your cart" });
      }
    }

    // Occasion-specific offers — at least one product in the cart must match the occasion
    if (Array.isArray(coupon.applicableOccasions) && coupon.applicableOccasions.length > 0) {
      const allowed = new Set(coupon.applicableOccasions.map((o) => String(o)));
      let hasMatch = cartItems.some((i) => (i.occasions || []).some((occId) => allowed.has(String(occId?._id || occId))));

      if (!hasMatch && cartProductIds.length > 0) {
        const dbProducts = await Product.find({ _id: { $in: cartProductIds } }).select("occasions");
        hasMatch = dbProducts.some((p) => (p.occasions || []).some((occId) => allowed.has(String(occId?._id || occId))));
      }

      if (!hasMatch) {
        return res.status(400).json({ message: "This coupon is only valid for specific occasions" });
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

    discountAmount = Math.min(discountAmount, amount);
    discountAmount = Number(discountAmount.toFixed(2));

    res.json({
      success: true,
      message: `Coupon applied! You saved ₹${discountAmount}`,
      discountAmount,
      coupon: coupon.code,
      couponDetails: {
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minOrderAmount: coupon.minOrderAmount,
      },
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
    const l = parseInt(limit) || 20;
    const skip = (p - 1) * l;

    const query = { 
      isActive: true, 
      expiryDate: { $gt: new Date() },
      $expr: { $lt: ["$usedCount", "$usageLimit"] },
    };

    const coupons = await Coupon.find(query)
      .select("code title description discountType discountValue minOrderAmount maxDiscount expiryDate image isNewUserOnly perUserLimit usageLimit usedCount applicableProducts applicableOccasions")
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
