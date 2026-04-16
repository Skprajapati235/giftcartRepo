const Coupon = require("../models/Coupon");

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
exports.validate = async (req, res) => {
  const { code, amount } = req.body;
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

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
      .select("code discountType discountValue minOrderAmount maxDiscount expiryDate image")
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
