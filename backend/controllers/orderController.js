// const crypto = require("crypto");
// const Coupon = require("../models/Coupon");
// const Order = require("../models/Order");
// const orderService = require("../services/orderService");
// const paymentService = require("../services/paymentService");
// const { calculateItemPricing } = require("../utils/priceCalculator");
// const { generateInvoicePDF } = require("../utils/pdfGenerator");
// const mongoose = require("mongoose");
// const deliveryHoursService = require("../services/deliveryHoursService");
// const { verifyActionToken } = require("../utils/orderActionToken");
// const emailService = require("../utils/emailService");


// const VALID_EMAIL_ACTION_STATUSES = [
//   "Received",
//   "Pending",
//   "In Kitchen",
//   "Processing",
//   "Packed",
//   "Out for Delivery",
//   "Shipping",
//   "Delivered",
//   "Cancelled",
//   "Preparing",
//   "OutForDelivery",
//   "Shipped",
// ];

// function sendActionPage(res, { title, message, ok, confirmForm }) {
//   res.setHeader("Content-Type", "text/html; charset=utf-8");
//   res.send(`<!doctype html>
// <html lang="en">
// <head>
//   <meta charset="utf-8" />
//   <meta name="viewport" content="width=device-width,initial-scale=1" />
//   <title>${title}</title>
//   <style>
//     body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f6f7fb;margin:0;padding:40px 16px;display:flex;justify-content:center}
//     .card{max-width:440px;width:100%;background:#fff;border-radius:12px;padding:28px;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.08)}
//     h2{margin:0 0 10px;color:${ok ? "#16A34A" : "#DC2626"}}
//     p{color:#444;margin:0 0 6px;line-height:1.5}
//     button{margin-top:16px;padding:12px 22px;border:none;border-radius:6px;background:#D82B76;color:#fff;font-size:15px;font-weight:bold;cursor:pointer}
//   </style>
// </head>
// <body>
//   <div class="card">
//     <h2>${ok ? "✅" : "⚠️"} ${title}</h2>
//     <p>${message}</p>
//     ${confirmForm || ""}
//   </div>
// </body>
// </html>`);
// }

// // GET /api/order/email-action/:id/:status — shows a confirmation page (does NOT change status yet).
// // A confirm step keeps this safe from email-client "link scanners" (Outlook Safe Links, spam
// // filters, etc.) that auto-open links in an email — those never submit the confirm button below.
// exports.emailActionPreview = async (req, res) => {
//   try {
//     const { id, status } = req.params;
//     const { token } = req.query;

//     if (!VALID_EMAIL_ACTION_STATUSES.includes(status)) {
//       return sendActionPage(res, { title: "Invalid status", message: "This status is not recognized.", ok: false });
//     }
//     if (!verifyActionToken(id, status, token)) {
//       return sendActionPage(res, {
//         title: "Link invalid",
//         message: "This action link is invalid or has been tampered with. Please open the order from the admin panel instead.",
//         ok: false,
//       });
//     }

//     const order = await orderService.getOrderById(id);
//     if (!order) {
//       return sendActionPage(res, { title: "Order not found", message: "This order could not be found.", ok: false });
//     }

//     return sendActionPage(res, {
//       title: "Confirm status change",
//       message: `Order <strong>#${String(order._id).slice(-6).toUpperCase()}</strong> (${order.user?.name || "Customer"}, ₹${order.totalAmount}) — set status to <strong>${status}</strong>?`,
//       ok: true,
//       confirmForm: `
//         <form method="POST" action="/api/order/email-action/${order._id}/${encodeURIComponent(status)}">
//           <input type="hidden" name="token" value="${token}" />
//           <button type="submit">Confirm: Mark as ${status}</button>
//         </form>`,
//     });
//   } catch (error) {
//     console.error("Email Action Preview Error:", error);
//     res.status(500).send("Something went wrong loading this order.");
//   }
// };

// // POST /api/order/email-action/:id/:status — actually updates the status, only after confirmation.
// exports.emailActionConfirm = async (req, res) => {
//   try {
//     const { id, status } = req.params;
//     const token = req.body?.token || req.query?.token;

//     if (!VALID_EMAIL_ACTION_STATUSES.includes(status)) {
//       return sendActionPage(res, { title: "Invalid status", message: "This status is not recognized.", ok: false });
//     }
//     if (!verifyActionToken(id, status, token)) {
//       return sendActionPage(res, {
//         title: "Link invalid",
//         message: "This action link is invalid or has been tampered with. Please open the order from the admin panel instead.",
//         ok: false,
//       });
//     }

//     const updated = await orderService.updateOrderStatus(id, status);
//     if (!updated) {
//       return sendActionPage(res, { title: "Order not found", message: "This order could not be found.", ok: false });
//     }

//     return sendActionPage(res, {
//       title: "Order updated",
//       message: `Order <strong>#${String(updated._id).slice(-6).toUpperCase()}</strong> status is now <strong>${status}</strong>.`,
//       ok: true,
//     });
//   } catch (error) {
//     console.error("Email Action Confirm Error:", error);
//     res.status(500).send("Something went wrong updating this order.");
//   }
// };

// function normalizeCouponCode(couponCode) {
//   if (!couponCode) return "";
//   if (typeof couponCode === "string") return couponCode.trim();
//   if (typeof couponCode === "object" && couponCode.code) return String(couponCode.code).trim();
//   return "";
// }

// // Same eligibility rules as couponController.validate — re-checked here so
// // a coupon's new-user/product/occasion targeting can never be bypassed by
// // skipping the /coupons/validate call and going straight to order creation.
// async function isCouponEligible(coupon, { userId, items }) {
//   if (coupon.isNewUserOnly) {
//     const priorOrder = await Order.exists({ user: userId });
//     if (priorOrder) return false;
//   }

//   if (Array.isArray(coupon.applicableProducts) && coupon.applicableProducts.length > 0) {
//     const allowed = new Set(coupon.applicableProducts.map((p) => String(p)));
//     const productIds = (items || []).map((i) => String(i._id || i.product || ""));
//     if (productIds.length === 0 || !productIds.every((id) => allowed.has(id))) return false;
//   }

//   if (Array.isArray(coupon.applicableOccasions) && coupon.applicableOccasions.length > 0) {
//     const allowed = new Set(coupon.applicableOccasions.map((o) => String(o)));
//     const cartItems = items || [];
//     const allMatch =
//       cartItems.length > 0 &&
//       cartItems.every((i) => (i.occasions || []).some((occ) => allowed.has(String(occ?._id || occ))));
//     if (!allMatch) return false;
//   }

//   return true;
// }

// // POST /api/order/create
// exports.createOrder = async (req, res) => {
//   try {
//     // Check if delivery operating hours restriction is currently active
//     const deliveryStatus = await deliveryHoursService.getDeliveryHoursStatus();
//     if (deliveryStatus.isCurrentlyRestricted && deliveryStatus.blockOrders) {
//       return res.status(403).json({
//         success: false,
//         message: deliveryStatus.message || `Night delivery is currently paused. Deliveries resume at ${deliveryStatus.nextAvailableTime}.`,
//         isDeliveryRestricted: true,
//         nextAvailableTime: deliveryStatus.nextAvailableTime,
//       });
//     }

//     const {
//       items,
//       shippingAddress,
//       paymentMethod = 'Online',
//       couponCode: rawCouponCode,
//       deliverySlot,
//       messageOnCake,
//       cardMessage,
//       senderName,
//       recipientName,
//       addons,
//     } = req.body;
//     const couponCode = normalizeCouponCode(rawCouponCode);
//     const userId = req.user.id;

//     // Items total
//     const itemsTotal = items.reduce((sum, item) => {
//       const pricing = calculateItemPricing({
//         price: item.price,
//         salePrice: item.salePrice,
//         discount: item.discount,
//         tax: item.tax,
//         shippingCost: item.shippingCost,
//         quantity: item.quantity,
//       });
//       return sum + pricing.itemTotal;
//     }, 0);

//     const slotExtraCharge = Number(deliverySlot?.extraCharge || 0);
//     const addonsTotal = (addons || []).reduce((sum, a) => sum + (Number(a.price || 0) * Number(a.quantity || 1)), 0);
//     const sampleTotal = itemsTotal + slotExtraCharge + addonsTotal;

//     let totalAfterCoupon = sampleTotal;
//     let finalDiscount = 0;

//     if (couponCode) {
//       const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
//       if (coupon) {
//         // Re-validate on server
//         const isExpiried = new Date() > new Date(coupon.expiryDate);
//         const eligible = !isExpiried
//           && coupon.usedCount < coupon.usageLimit
//           && sampleTotal >= coupon.minOrderAmount
//           && (await isCouponEligible(coupon, { userId, items }));
//         if (eligible) {
//           if (coupon.discountType === "percentage") {
//             finalDiscount = (sampleTotal * coupon.discountValue) / 100;
//             if (coupon.maxDiscount > 0 && finalDiscount > coupon.maxDiscount) {
//               finalDiscount = coupon.maxDiscount;
//             }
//           } else {
//             finalDiscount = coupon.discountValue;
//           }
//           totalAfterCoupon = Math.max(0, sampleTotal - finalDiscount);
//         }
//       }
//     }

//     let razorpayOrder = null;
//     if (paymentMethod === 'Online') {
//       razorpayOrder = await paymentService.createRazorpayOrder(totalAfterCoupon);
//     }

//     const newOrder = await orderService.createOrder({
//       userId,
//       items,
//       shippingAddress,
//       razorpayOrderId: razorpayOrder?.id,
//       paymentMethod,
//       couponCode: finalDiscount > 0 ? couponCode.toUpperCase() : null,
//       discountAmount: finalDiscount,
//       deliverySlot,
//       messageOnCake,
//       cardMessage,
//       senderName,
//       recipientName,
//       addons,
//     });

//     res.status(201).json({
//       success: true,
//       order: newOrder,
//       razorpayOrder,
//       razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
//     });
//   } catch (error) {
//     console.error("Create Order Error:", error);
//     res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error creating order" });
//   }
// };

// // POST /api/order/verify
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Missing payment verification fields" });
//     }

//     const secret = process.env.RAZORPAY_KEY_SECRET;
//     if (!secret) {
//       console.error("Verify Payment Error: RAZORPAY_KEY_SECRET is not set");
//       return res.status(500).json({ success: false, message: "Payment verification is not configured on server" });
//     }

//     const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
//     if (existingOrder?.paymentStatus === "Success") {
//       return res.json({
//         success: true,
//         message: "Payment already verified",
//         orderId: existingOrder._id,
//       });
//     }

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", secret)
//       .update(body.toString())
//       .digest("hex");

//     const isMatch = expectedSignature === razorpay_signature;

//     if (isMatch) {
//       const updatedOrder = await orderService.markPaymentSuccess(razorpay_order_id, razorpay_payment_id);
//       if (!updatedOrder) {
//         return res.status(404).json({
//           success: false,
//           message: "Order not found for this Razorpay payment",
//         });
//       }
//       return res.json({
//         success: true,
//         message: "Payment verified successfully",
//         orderId: updatedOrder._id,
//       });
//     }

//     await orderService.markPaymentFailed(razorpay_order_id, "Invalid payment signature verification");
//     return res.status(400).json({ success: false, message: "Invalid payment signature" });
//   } catch (error) {
//     console.error("Verify Payment Error:", error);
//     res.status(500).json({ success: false, message: error.message || "Error verifying payment" });
//   }
// };

// // POST /api/order/:id/cancel-payment and POST /api/order/cancel-payment
// // Called when customer exits/backs out of the payment gateway without completing payment
// exports.cancelPayment = async (req, res) => {
//   try {
//     const orderId = req.params.id || req.body.orderId;
//     const { razorpayOrderId, reason } = req.body;
//     const userId = req.user?.id;

//     if (!orderId && !razorpayOrderId) {
//       return res.status(400).json({ success: false, message: "Order ID or Razorpay Order ID is required" });
//     }

//     const updatedOrder = await orderService.markPaymentIncomplete({
//       orderId,
//       razorpayOrderId,
//       reason: reason || "User returned without completing payment",
//       userId,
//     });

//     if (!updatedOrder) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     return res.json({
//       success: true,
//       message: "Payment marked as incomplete / user backed out",
//       orderId: updatedOrder._id,
//       order: updatedOrder,
//     });
//   } catch (error) {
//     console.error("Cancel Payment Error:", error);
//     res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error recording incomplete payment" });
//   }
// };


// // POST /api/order/:id/send-email
// // Called by the customer app right after an order is placed (COD) so the
// // admin gets the "New Order Received" email even if the automatic send
// // inside orderService.createOrder didn't fire for some reason. Guarded by
// // orderEmailSentAt so it's a safe no-op if the email already went out.
// // exports.sendOrderEmail = async (req, res) => {
// //   try {
// //     const order = await Order.findById(req.params.id).populate("user");
// //     if (!order) {
// //       return res.status(404).json({ success: false, message: "Order not found" });
// //     }

// //     // Only the order's own customer (or an admin) can trigger this
// //     const isOwner = String(order.user?._id) === String(req.user.id);
// //     const isAdmin = req.user.role === "admin";
// //     if (!isOwner && !isAdmin) {
// //       return res.status(403).json({ success: false, message: "Not authorized for this order" });
// //     }

// //     // if (order.orderEmailSentAt) {
// //     //   return res.json({ success: true, alreadySent: true, message: "Order email was already sent" });
// //     // }

// //     await emailService.sendOrderNotification(order, order.user);
// //     order.orderEmailSentAt = new Date();
// //     await order.save();

// //     res.json({ success: true, message: "Order email sent" });
// //   } catch (error) {
// //     console.error("Send Order Email Error:", error);
// //     res.status(500).json({ success: false, message: error.message || "Error sending order email" });
// //   }
// // };

// exports.sendOrderEmail = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate("user");
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // Only the order's own customer (or an admin) can trigger this
//     const isOwner = String(order.user?._id) === String(req.user.id);
//     const isAdmin = req.user.role === "admin";
//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({ success: false, message: "Not authorized for this order" });
//     }

//     await emailService.sendOrderNotification(order, order.user);
//     order.orderEmailSentAt = new Date(); // record-keeping only, does not block future sends
//     await order.save();

//     res.json({ success: true, message: "Order email sent" });
//   } catch (error) {
//     console.error("Send Order Email Error:", error);
//     res.status(500).json({ success: false, message: error.message || "Error sending order email" });
//   }
// };

// // GET /api/order/user
// exports.getUserOrders = async (req, res) => {
//   try {
//     const orders = await orderService.getUserOrders(req.user.id);
//     res.json(orders);
//   } catch (error) {
//     console.error("Get User Orders Error:", error);
//     res.status(500).json({ success: false, message: "Error fetching user orders" });
//   }
// };

// // DELETE /api/order/user/:id
// exports.deleteUserOrder = async (req, res) => {
//   try {
//     await orderService.deleteUserOrder(req.user.id, req.params.id);
//     res.json({ success: true, message: "Order deleted successfully" });
//   } catch (error) {
//     console.error("Delete User Order Error:", error);
//     res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error deleting order" });
//   }
// };

// // GET /api/order/admin/all
// exports.getAllOrders = async (req, res) => {
//   try {
//     const { page, limit, search } = req.query;
//     const data = await orderService.getAllOrders({
//       page: parseInt(page) || 1,
//       limit: parseInt(limit) || 10,
//       search: search || ""
//     });
//     res.json(data);
//   } catch (error) {
//     console.error("Get All Orders Error:", error);
//     res.status(500).json({ success: false, message: "Error fetching orders" });
//   }
// };

// // GET /api/order/admin/detail/:id
// exports.getOrderById = async (req, res) => {
//   try {
//     const order = await orderService.getOrderById(req.params.id);
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     res.json(order);
//   } catch (error) {
//     console.error("Get Order Detail Error:", error);
//     res.status(500).json({ success: false, message: "Error fetching order detail" });
//   }
// };

// // PUT /api/order/admin/:id/status
// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const order = await orderService.updateOrderStatus(req.params.id, status);
//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });
//     res.json({ success: true, message: "Order status updated" });
//   } catch (error) {
//     console.error("Update Order Status Error:", error);
//     res.status(error.statusCode || 500).json({ success: false, message: error.statusCode === 400 ? error.message : "Error updating order status" });
//   }
// };

// // DELETE /api/order/admin/:id
// exports.deleteOrder = async (req, res) => {
//   try {
//     await orderService.deleteOrder(req.params.id);
//     res.json({ success: true, message: "Order deleted" });
//   } catch (error) {
//     console.error("Delete Order Error:", error);
//     res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error deleting order" });
//   }
// };

// // POST /api/order/admin/bulk-delete
// exports.deleteMultipleOrders = async (req, res) => {
//   try {
//     const { ids } = req.body;
//     const result = await orderService.deleteMultipleOrders(ids);
//     res.json({ success: true, message: `${result.deletedCount} orders deleted`, deletedCount: result.deletedCount });
//   } catch (error) {
//     console.error("Bulk Delete Order Error:", error);
//     res.status(500).json({ success: false, message: error.message || "Error deleting orders" });
//   }
// };

// // PUT /api/order/admin/:id/viewed
// exports.markOrderAsViewed = async (req, res) => {
//   try {
//     await orderService.markOrderAsViewed(req.params.id);
//     res.json({ success: true, message: "Order marked as viewed" });
//   } catch (error) {
//     console.error("Mark Order Viewed Error:", error);
//     res.status(500).json({ success: false, message: "Error marking order as viewed" });
//   }
// };

// // GET /api/order/admin/unviewed
// exports.getUnviewedOrders = async (req, res) => {
//   try {
//     const orders = await orderService.getUnviewedOrders();
//     res.json(orders);
//   } catch (error) {
//     console.error("Get Unviewed Orders Error:", error);
//     res.status(500).json({ success: false, message: "Error fetching unviewed orders" });
//   }
// };

// // GET /api/order/admin/:id/invoice
// exports.downloadInvoice = async (req, res) => {
//   try {
//     const order = await orderService.getOrderById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename=Invoice-${order.orderId || order._id}.pdf`);

//     // Stream the generated PDF directly to response
//     generateInvoicePDF(order, res);
//   } catch (error) {
//     console.error("Download Invoice Error:", error);
//     res.status(500).json({ success: false, message: "Error generating invoice" });
//   }
// };

// // GET /api/order/admin/payments
// exports.getPaymentHistory = async (req, res) => {
//   try {
//     const payments = await paymentService.getPaymentHistory();
//     res.json(payments);
//   } catch (error) {
//     console.error("Get Payment History Error:", error);
//     res.status(500).json({ success: false, message: "Error fetching payments" });
//   }
// };

// // GET /api/order/public/:token
// exports.getPublicOrderByToken = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const order = await orderService.getPublicOrderByTrackingToken(token);
//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });
//     res.json({ success: true, order });
//   } catch (error) {
//     console.error("Get Public Order Error:", error);
//     res.status(500).json({ success: false, message: "Error fetching order" });
//   }
// };

// // PUT /api/order/admin/:id/kitchen-status
// exports.updateKitchenStatus = async (req, res) => {
//   try {
//     const { kitchenStatus } = req.body;
//     const valid = [
//       "Received",
//       "Pending",
//       "In Kitchen",
//       "Processing",
//       "Packed",
//       "Out for Delivery",
//       "Shipping",
//       "Delivered",
//       "Cancelled",
//       "Preparing",
//       "OutForDelivery",
//       "Shipped",
//     ];
//     if (!valid.includes(kitchenStatus)) {
//       return res.status(400).json({ success: false, message: "Invalid kitchen status" });
//     }

//     const order = await orderService.updateOrderStatus(req.params.id, kitchenStatus);

//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//     res.json({ success: true, message: `Kitchen status updated to ${order.kitchenStatus}`, order });
//   } catch (error) {
//     console.error("Update Kitchen Status Error:", error);
//     res.status(error.statusCode || 500).json({ success: false, message: error.message });
//   }
// };


const crypto = require("crypto");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const Product = require("../models/Product");
const orderService = require("../services/orderService");
const paymentService = require("../services/paymentService");
const { calculateItemPricing } = require("../utils/priceCalculator");
const { generateInvoicePDF } = require("../utils/pdfGenerator");
const mongoose = require("mongoose");
const deliveryHoursService = require("../services/deliveryHoursService");
const { verifyActionToken } = require("../utils/orderActionToken");
const emailService = require("../utils/emailService");
const deliverySlotService = require("../services/deliverySlotService");
const addonService = require("../services/addonService");


const VALID_EMAIL_ACTION_STATUSES = [
  "Received",
  "Pending",
  "In Kitchen",
  "Processing",
  "Packed",
  "Out for Delivery",
  "Shipping",
  "Delivered",
  "Cancelled",
  "Preparing",
  "OutForDelivery",
  "Shipped",
];

function sendActionPage(res, { title, message, ok, confirmForm }) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f6f7fb;margin:0;padding:40px 16px;display:flex;justify-content:center}
    .card{max-width:440px;width:100%;background:#fff;border-radius:12px;padding:28px;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.08)}
    h2{margin:0 0 10px;color:${ok ? "#16A34A" : "#DC2626"}}
    p{color:#444;margin:0 0 6px;line-height:1.5}
    button{margin-top:16px;padding:12px 22px;border:none;border-radius:6px;background:#D82B76;color:#fff;font-size:15px;font-weight:bold;cursor:pointer}
  </style>
</head>
<body>
  <div class="card">
    <h2>${ok ? "✅" : "⚠️"} ${title}</h2>
    <p>${message}</p>
    ${confirmForm || ""}
  </div>
</body>
</html>`);
}

// GET /api/order/email-action/:id/:status — shows a confirmation page (does NOT change status yet).
// A confirm step keeps this safe from email-client "link scanners" (Outlook Safe Links, spam
// filters, etc.) that auto-open links in an email — those never submit the confirm button below.
exports.emailActionPreview = async (req, res) => {
  try {
    const { id, status } = req.params;
    const { token } = req.query;

    if (!VALID_EMAIL_ACTION_STATUSES.includes(status)) {
      return sendActionPage(res, { title: "Invalid status", message: "This status is not recognized.", ok: false });
    }
    if (!verifyActionToken(id, status, token)) {
      return sendActionPage(res, {
        title: "Link invalid",
        message: "This action link is invalid or has been tampered with. Please open the order from the admin panel instead.",
        ok: false,
      });
    }

    const order = await orderService.getOrderById(id);
    if (!order) {
      return sendActionPage(res, { title: "Order not found", message: "This order could not be found.", ok: false });
    }

    return sendActionPage(res, {
      title: "Confirm status change",
      message: `Order <strong>#${String(order._id).slice(-6).toUpperCase()}</strong> (${order.user?.name || "Customer"}, ₹${order.totalAmount}) — set status to <strong>${status}</strong>?`,
      ok: true,
      confirmForm: `
        <form method="POST" action="/api/order/email-action/${order._id}/${encodeURIComponent(status)}">
          <input type="hidden" name="token" value="${token}" />
          <button type="submit">Confirm: Mark as ${status}</button>
        </form>`,
    });
  } catch (error) {
    console.error("Email Action Preview Error:", error);
    res.status(500).send("Something went wrong loading this order.");
  }
};

// POST /api/order/email-action/:id/:status — actually updates the status, only after confirmation.
exports.emailActionConfirm = async (req, res) => {
  try {
    const { id, status } = req.params;
    const token = req.body?.token || req.query?.token;

    if (!VALID_EMAIL_ACTION_STATUSES.includes(status)) {
      return sendActionPage(res, { title: "Invalid status", message: "This status is not recognized.", ok: false });
    }
    if (!verifyActionToken(id, status, token)) {
      return sendActionPage(res, {
        title: "Link invalid",
        message: "This action link is invalid or has been tampered with. Please open the order from the admin panel instead.",
        ok: false,
      });
    }

    const updated = await orderService.updateOrderStatus(id, status);
    if (!updated) {
      return sendActionPage(res, { title: "Order not found", message: "This order could not be found.", ok: false });
    }

    return sendActionPage(res, {
      title: "Order updated",
      message: `Order <strong>#${String(updated._id).slice(-6).toUpperCase()}</strong> status is now <strong>${status}</strong>.`,
      ok: true,
    });
  } catch (error) {
    console.error("Email Action Confirm Error:", error);
    res.status(500).send("Something went wrong updating this order.");
  }
};

function normalizeCouponCode(couponCode) {
  if (!couponCode) return "";
  if (typeof couponCode === "string") return couponCode.trim();
  if (typeof couponCode === "object" && couponCode.code) return String(couponCode.code).trim();
  return "";
}

// Same eligibility rules as couponController.validate — re-checked here so
// a coupon's new-user/product/occasion targeting can never be bypassed by
// skipping the /coupons/validate call and going straight to order creation.
async function isCouponEligible(coupon, { userId, items }) {
  if (coupon.isNewUserOnly) {
    const priorOrder = await Order.exists({ user: userId, status: { $ne: "Cancelled" } });
    if (priorOrder) return false;
  }

  if (coupon.perUserLimit && coupon.perUserLimit > 0 && userId) {
    const userUsageCount = await Order.countDocuments({
      user: userId,
      couponCode: coupon.code,
      status: { $ne: "Cancelled" },
    });
    if (userUsageCount >= coupon.perUserLimit) return false;
  }

  const cartItems = items || [];
  const productIds = cartItems.map((i) => String(i._id || i.product || "")).filter(Boolean);

  if (Array.isArray(coupon.applicableProducts) && coupon.applicableProducts.length > 0) {
    const allowed = new Set(coupon.applicableProducts.map((p) => String(p)));
    const hasMatch = productIds.length > 0 && productIds.some((id) => allowed.has(id));
    if (!hasMatch) return false;
  }

  if (Array.isArray(coupon.applicableOccasions) && coupon.applicableOccasions.length > 0) {
    const allowed = new Set(coupon.applicableOccasions.map((o) => String(o)));
    let hasMatch = cartItems.some((i) => (i.occasions || []).some((occ) => allowed.has(String(occ?._id || occ))));

    if (!hasMatch && productIds.length > 0) {
      const dbProducts = await Product.find({ _id: { $in: productIds } }).select("occasions");
      hasMatch = dbProducts.some((p) => (p.occasions || []).some((occ) => allowed.has(String(occ?._id || occ))));
    }

    if (!hasMatch) return false;
  }

  return true;
}

// POST /api/order/create
exports.createOrder = async (req, res) => {
  try {
    // Check if delivery operating hours restriction is currently active
    const deliveryStatus = await deliveryHoursService.getDeliveryHoursStatus();
    if (deliveryStatus.isCurrentlyRestricted && deliveryStatus.blockOrders) {
      return res.status(403).json({
        success: false,
        message: deliveryStatus.message || `Night delivery is currently paused. Deliveries resume at ${deliveryStatus.nextAvailableTime}.`,
        isDeliveryRestricted: true,
        nextAvailableTime: deliveryStatus.nextAvailableTime,
      });
    }

    const {
      items,
      shippingAddress,
      paymentMethod = 'Online',
      couponCode: rawCouponCode,
      deliverySlot: rawDeliverySlot,
      messageOnCake,
      cardMessage,
      senderName,
      recipientName,
      addons: rawAddons,
    } = req.body;
    const couponCode = normalizeCouponCode(rawCouponCode);
    const userId = req.user.id;

    // Items total
    const itemsTotal = items.reduce((sum, item) => {
      const pricing = calculateItemPricing({
        price: item.price,
        salePrice: item.salePrice,
        discount: item.discount,
        tax: item.tax,
        shippingCost: item.shippingCost,
        quantity: item.quantity,
      });
      return sum + pricing.itemTotal;
    }, 0);

    // Slot + add-ons are validated and RE-PRICED from the database. Whatever
    // price / surcharge the client sent is ignored. Throws a 400 (code
    // SLOT_UNAVAILABLE / ADDON_UNAVAILABLE) when a cutoff passed, the slot is
    // sold out, or an add-on was removed — before any payment is created.
    const deliverySlot = await deliverySlotService.resolveSlotForOrder(rawDeliverySlot);
    const addons = await addonService.resolveAddonsForOrder(rawAddons);

    const slotExtraCharge = Number(deliverySlot?.extraCharge || 0);
    const addonsTotal = addons.reduce((sum, a) => sum + (Number(a.price || 0) * Number(a.quantity || 1)), 0);
    const sampleTotal = itemsTotal + slotExtraCharge + addonsTotal;

    let totalAfterCoupon = sampleTotal;
    let finalDiscount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        // Re-validate on server
        const isExpired = new Date() > new Date(coupon.expiryDate);
        const limitReached = coupon.usedCount >= coupon.usageLimit;
        const belowMin = sampleTotal < coupon.minOrderAmount;
        const eligibleRule = await isCouponEligible(coupon, { userId, items });

        const eligible = !isExpired && !limitReached && !belowMin && eligibleRule;
        if (eligible) {
          if (coupon.discountType === "percentage") {
            finalDiscount = (sampleTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount > 0 && finalDiscount > coupon.maxDiscount) {
              finalDiscount = coupon.maxDiscount;
            }
          } else {
            finalDiscount = coupon.discountValue;
          }
          finalDiscount = Math.min(finalDiscount, sampleTotal);
          finalDiscount = Number(finalDiscount.toFixed(2));
          totalAfterCoupon = Math.max(0, Number((sampleTotal - finalDiscount).toFixed(2)));
        } else {
          console.warn(`[orderController] Coupon ${couponCode} was not eligible during order creation:`, {
            isExpired,
            limitReached,
            belowMin,
            eligibleRule,
          });
        }
      } else {
        console.warn(`[orderController] Coupon ${couponCode} not found or inactive`);
      }
    }

    let razorpayOrder = null;
    if (paymentMethod === 'Online') {
      razorpayOrder = await paymentService.createRazorpayOrder(totalAfterCoupon);
    }

    const newOrder = await orderService.createOrder({
      userId,
      items,
      shippingAddress,
      razorpayOrderId: razorpayOrder?.id,
      paymentMethod,
      couponCode: finalDiscount > 0 ? couponCode.toUpperCase() : null,
      discountAmount: finalDiscount,
      deliverySlot,
      messageOnCake,
      cardMessage,
      senderName,
      recipientName,
      addons,
    });

    if (finalDiscount > 0 && couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      ).catch((err) => console.error("Failed to increment coupon usedCount:", err));
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error creating order",
      ...(error.code ? { code: error.code } : {}),
    });
  }
};

// POST /api/order/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("Verify Payment Error: RAZORPAY_KEY_SECRET is not set");
      return res.status(500).json({ success: false, message: "Payment verification is not configured on server" });
    }

    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder?.paymentStatus === "Success") {
      return res.json({
        success: true,
        message: "Payment already verified",
        orderId: existingOrder._id,
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isMatch = expectedSignature === razorpay_signature;

    if (isMatch) {
      const updatedOrder = await orderService.markPaymentSuccess(razorpay_order_id, razorpay_payment_id);
      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found for this Razorpay payment",
        });
      }
      return res.json({
        success: true,
        message: "Payment verified successfully",
        orderId: updatedOrder._id,
      });
    }

    await orderService.markPaymentFailed(razorpay_order_id, "Invalid payment signature verification");
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: error.message || "Error verifying payment" });
  }
};

// POST /api/order/:id/cancel-payment and POST /api/order/cancel-payment
// Called when customer exits/backs out of the payment gateway without completing payment
exports.cancelPayment = async (req, res) => {
  try {
    const orderId = req.params.id || req.body.orderId;
    const { razorpayOrderId, reason } = req.body;
    const userId = req.user?.id;

    if (!orderId && !razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Order ID or Razorpay Order ID is required" });
    }

    const updatedOrder = await orderService.markPaymentIncomplete({
      orderId,
      razorpayOrderId,
      reason: reason || "User returned without completing payment",
      userId,
    });

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.json({
      success: true,
      message: "Payment marked as incomplete / user backed out",
      orderId: updatedOrder._id,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Cancel Payment Error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error recording incomplete payment" });
  }
};


// POST /api/order/:id/send-email
// Called by the customer app right after an order is placed (COD) so the
// admin gets the "New Order Received" email even if the automatic send
// inside orderService.createOrder didn't fire for some reason. Guarded by
// orderEmailSentAt so it's a safe no-op if the email already went out.
// exports.sendOrderEmail = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate("user");
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // Only the order's own customer (or an admin) can trigger this
//     const isOwner = String(order.user?._id) === String(req.user.id);
//     const isAdmin = req.user.role === "admin";
//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({ success: false, message: "Not authorized for this order" });
//     }

//     // if (order.orderEmailSentAt) {
//     //   return res.json({ success: true, alreadySent: true, message: "Order email was already sent" });
//     // }

//     await emailService.sendOrderNotification(order, order.user);
//     order.orderEmailSentAt = new Date();
//     await order.save();

//     res.json({ success: true, message: "Order email sent" });
//   } catch (error) {
//     console.error("Send Order Email Error:", error);
//     res.status(500).json({ success: false, message: error.message || "Error sending order email" });
//   }
// };

exports.sendOrderEmail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only the order's own customer (or an admin) can trigger this
    const isOwner = String(order.user?._id) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized for this order" });
    }

    await emailService.sendOrderNotification(order, order.user);
    order.orderEmailSentAt = new Date(); // record-keeping only, does not block future sends
    await order.save();

    res.json({ success: true, message: "Order email sent" });
  } catch (error) {
    console.error("Send Order Email Error:", error);
    res.status(500).json({ success: false, message: error.message || "Error sending order email" });
  }
};

// GET /api/order/user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

// DELETE /api/order/user/:id
exports.deleteUserOrder = async (req, res) => {
  try {
    await orderService.deleteUserOrder(req.user.id, req.params.id);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete User Order Error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error deleting order" });
  }
};

// GET /api/order/admin/all
exports.getAllOrders = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await orderService.getAllOrders({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || ""
    });
    res.json(data);
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// GET /api/order/admin/detail/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    console.error("Get Order Detail Error:", error);
    res.status(500).json({ success: false, message: "Error fetching order detail" });
  }
};

// PUT /api/order/admin/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.statusCode === 400 ? error.message : "Error updating order status" });
  }
};

// DELETE /api/order/admin/:id
exports.deleteOrder = async (req, res) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error deleting order" });
  }
};

// POST /api/order/admin/bulk-delete
exports.deleteMultipleOrders = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await orderService.deleteMultipleOrders(ids);
    res.json({ success: true, message: `${result.deletedCount} orders deleted`, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Bulk Delete Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "Error deleting orders" });
  }
};

// PUT /api/order/admin/:id/viewed
exports.markOrderAsViewed = async (req, res) => {
  try {
    await orderService.markOrderAsViewed(req.params.id);
    res.json({ success: true, message: "Order marked as viewed" });
  } catch (error) {
    console.error("Mark Order Viewed Error:", error);
    res.status(500).json({ success: false, message: "Error marking order as viewed" });
  }
};

// GET /api/order/admin/unviewed
exports.getUnviewedOrders = async (req, res) => {
  try {
    const orders = await orderService.getUnviewedOrders();
    res.json(orders);
  } catch (error) {
    console.error("Get Unviewed Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching unviewed orders" });
  }
};

// GET /api/order/admin/:id/invoice
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Invoice-${order.orderId || order._id}.pdf`);

    // Stream the generated PDF directly to response
    generateInvoicePDF(order, res);
  } catch (error) {
    console.error("Download Invoice Error:", error);
    res.status(500).json({ success: false, message: "Error generating invoice" });
  }
};

// GET /api/order/admin/payments
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await paymentService.getPaymentHistory();
    res.json(payments);
  } catch (error) {
    console.error("Get Payment History Error:", error);
    res.status(500).json({ success: false, message: "Error fetching payments" });
  }
};

// GET /api/order/public/:token
exports.getPublicOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const order = await orderService.getPublicOrderByTrackingToken(token);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    console.error("Get Public Order Error:", error);
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

// PUT /api/order/admin/:id/kitchen-status
exports.updateKitchenStatus = async (req, res) => {
  try {
    const { kitchenStatus } = req.body;
    const valid = [
      "Received",
      "Pending",
      "In Kitchen",
      "Processing",
      "Packed",
      "Out for Delivery",
      "Shipping",
      "Delivered",
      "Cancelled",
      "Preparing",
      "OutForDelivery",
      "Shipped",
    ];
    if (!valid.includes(kitchenStatus)) {
      return res.status(400).json({ success: false, message: "Invalid kitchen status" });
    }

    const order = await orderService.updateOrderStatus(req.params.id, kitchenStatus);

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, message: `Kitchen status updated to ${order.kitchenStatus}`, order });
  } catch (error) {
    console.error("Update Kitchen Status Error:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
