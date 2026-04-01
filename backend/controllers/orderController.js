const Razorpay = require("razorpay");
const Order = require("../models/Order");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    const userId = req.user.id;

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const newOrder = new Order({
      user: userId,
      items: items.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
      })),
      totalAmount,
      shippingAddress, // Expecting object { fullName, phone, address, pinCode }
      razorpayOrderId: razorpayOrder.id,
      status: "Pending",
      paymentStatus: "Pending",
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      order: newOrder,
      razorpayOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isMatch = expectedSignature === razorpay_signature;

    if (isMatch) {
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          razorpayPaymentId: razorpay_payment_id,
          paymentStatus: "Success",
          status: "Processing",
        }
      );
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: "Failed" }
      );
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort("-createdAt");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "image name");
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching order detail" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort("-createdAt");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Order.findByIdAndUpdate(id, { status });
    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Order.find({ paymentStatus: "Success" })
      .populate("user", "name email")
      .sort("-createdAt");
    res.json(payments);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching payments" });
  }
};
