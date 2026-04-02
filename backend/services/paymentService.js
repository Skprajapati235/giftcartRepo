const Razorpay = require("razorpay");
const Order = require("../models/Order");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a Razorpay order
exports.createRazorpayOrder = async (totalAmount) => {
  const options = {
    amount: Math.round(totalAmount * 100), // paise
    currency: "INR",
    receipt: `order_${Date.now()}`,
  };
  return await razorpay.orders.create(options);
};

// Get all successful payments (admin payment history)
exports.getPaymentHistory = async () => {
  return await Order.find({ paymentStatus: "Success" })
    .populate("user", "name email")
    .sort("-createdAt");
};

// Get payment summary stats (total revenue, count)
exports.getPaymentStats = async () => {
  const payments = await Order.find({ paymentStatus: "Success" });
  const totalRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  return {
    totalRevenue,
    totalPayments: payments.length,
  };
};
