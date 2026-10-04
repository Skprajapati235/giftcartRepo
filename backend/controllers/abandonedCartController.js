const Order = require("../models/Order");
const Cart = require("../models/Cart");
const AuditLog = require("../models/AuditLog");

exports.getAbandonedCarts = async (req, res) => {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Find dropped/incomplete checkouts
    const incompleteOrders = await Order.find({
      $or: [
        { isPaymentAbandoned: true },
        { paymentStatus: "Incomplete" },
        { paymentStatus: "Abandoned" },
        {
          paymentMethod: "Online",
          paymentStatus: "Pending",
          createdAt: { $lte: fifteenMinsAgo },
        },
      ],
    })
      .populate("user", "name mobileNumber email")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formatted = incompleteOrders.map((o) => ({
      id: o._id.toString(),
      orderNumber: `ORD-${o._id.toString().slice(-6).toUpperCase()}`,
      customerName: o.user?.name || o.shippingAddress?.fullName || "Shopper",
      phone: o.user?.mobileNumber || o.shippingAddress?.phone || "9818000000",
      email: o.user?.email || "customer@giftfestive.com",
      items: (o.items || []).map((it) => ({
        name: it.name,
        weight: it.weight || "1 Kg",
        qty: it.quantity || 1,
        price: it.price || 0,
      })),
      cartTotal: o.totalAmount || 0,
      droppedAt: o.createdAt,
      status: o.whatsappRecoverySentAt
        ? "WhatsApp Sent"
        : o.paymentStatus === "Success"
        ? "Recovered"
        : "Pending",
      couponSent: o.recoveryCoupon || null,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      total: formatted.length,
    });
  } catch (error) {
    console.error("Get Abandoned Carts Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.recordRecoveryDispatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { couponCode = "SWEET15", method = "whatsapp" } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        whatsappRecoverySentAt: new Date(),
        recoveryCoupon: couponCode,
      },
      { new: true }
    );

    // Record audit log
    await AuditLog.create({
      adminId: req.user?._id || req.user?.id,
      adminName: req.user?.name || "Admin",
      adminEmail: req.user?.email || "admin@giftfestive.com",
      adminRole: req.user?.role || "Support Agent",
      action: "Dispatched Abandoned Cart Recovery",
      module: "Abandoned Carts",
      details: `Triggered ${method.toUpperCase()} discount (${couponCode}) to Order #${id.slice(-6).toUpperCase()}`,
      severity: "success",
      ipAddress: req.ip || "127.0.0.1",
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Recovery dispatch logged successfully",
      data: order,
    });
  } catch (error) {
    console.error("Record Recovery Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markRecovered = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      {
        paymentStatus: "Success",
        isPaymentAbandoned: false,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Cart marked as recovered!",
      data: order,
    });
  } catch (error) {
    console.error("Mark Recovered Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
