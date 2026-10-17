// const DecorationBooking = require("../../models/DecorationBooking");
// const DecorationPackage = require("../../models/DecorationPackage");
// const PartnerStore = require("../../models/PartnerStore");
// const { verifyActionToken } = require("../../utils/orderActionToken");

// let logActivity;
// try {
//   logActivity = require("../../utils/auditLogger").logActivity;
// } catch (e) {
//   logActivity = async () => {};
// }

// const VALID_DECORATION_STATUSES = [
//   "Pending",
//   "Confirmed",
//   "Decorator Assigned",
//   "In Setup",
//   "Decorated & Ready",
//   "Completed",
//   "Cancelled",
// ];

// const STATUS_PROGRESS_MAP = {
//   Pending: { step: 0, label: "Order Received", description: "Your decoration request is received and waiting for slot confirmation." },
//   Confirmed: { step: 1, label: "Booking Confirmed", description: "Your setup slot and venue requirements are confirmed by our team." },
//   "Decorator Assigned": { step: 2, label: "Decorator Assigned", description: "A verified local Faridabad decorator has been allocated for your venue." },
//   "In Setup": { step: 3, label: "Decor in Progress", description: "The decorator has reached your hotel/venue and is actively setting up the decor." },
//   "Decorated & Ready": { step: 4, label: "Ready for Surprise", description: "All balloons, fairy lights & flowers are fully decorated and ready for your grand entry!" },
//   Completed: { step: 5, label: "Setup Completed", description: "Celebration complete! Thank you for choosing GiftCart." },
//   Cancelled: { step: -1, label: "Booking Cancelled", description: "This booking was cancelled. Any refund applicable will be processed." },
// };

// // Generate unique booking id
// const generateBookingId = () => {
//   const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
//   const randomSuffix = Math.floor(1000 + Math.random() * 9000);
//   return `DEC-${dateStr}-${randomSuffix}`;
// };

// /**
//  * Service for Decoration Bookings & Live Customer Tracking
//  */
// class DecorationBookingService {
//   /**
//    * Create new customer decoration booking
//    */
//   async createBooking(data, userContext = {}) {
//     const {
//       packageId,
//       venueType,
//       hotelName,
//       roomNumber,
//       bookingHolderName,
//       venueAddress,
//       city,
//       pincode,
//       googleMapsUrl,
//       setupDate,
//       setupTimeSlot,
//       surpriseEntryTime,
//       occasion,
//       customMessage,
//       colorTheme,
//       specialInstructions,
//       addons,
//       customerName,
//       customerPhone,
//       customerWhatsapp,
//       customerEmail,
//       paymentType,
//       paymentMethod,
//       advanceAmount,
//       balanceAmount,
//       razorpayOrderId,
//       razorpayPaymentId,
//       razorpaySignature,
//       totalAmount,
//     } = data;

//     if (!packageId || !setupDate || !setupTimeSlot || !venueAddress || !customerName || !customerPhone) {
//       throw new Error("Please fill in all required venue and contact fields.");
//     }

//     const pkg = await DecorationPackage.findById(packageId);
//     if (!pkg) {
//       throw new Error("Selected decoration package was not found.");
//     }

//     // SERVER-SIDE TAMPER PROOF PRICING:
//     // Package price is strictly authoritative from the database.
//     const packageOfficialPrice = Number(pkg.salePrice || pkg.price) || 0;

//     let addonsTotal = 0;
//     const validatedAddons = [];
//     if (Array.isArray(addons)) {
//       addons.forEach((item) => {
//         const itemPrice = Math.max(0, Number(item.price) || 0);
//         const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
//         addonsTotal += itemPrice * qty;
//         validatedAddons.push({
//           name: String(item.name || "Addon").trim(),
//           price: itemPrice,
//           quantity: qty,
//         });
//       });
//     }

//     const calculatedTotal = packageOfficialPrice + addonsTotal;
//     const bookingId = generateBookingId();

//     // REAL BUSINESS DOWNPAYMENT LOGIC:
//     const pType = paymentType || (paymentMethod === "COD" ? "Full COD" : "Advance Downpayment");
//     let computedAdvance = 0;
//     let computedBalance = 0;
//     let computedPayStatus = "Pending";
//     let computedDownStatus = "Pending";
//     let computedBalStatus = "Pending";
//     let computedPayMethod = paymentMethod || "Online";

//     if (pType === "Full Online") {
//       computedAdvance = calculatedTotal;
//       computedBalance = 0;
//       computedPayStatus = razorpayPaymentId ? "Paid" : "Paid";
//       computedDownStatus = "Paid";
//       computedBalStatus = "Waived";
//       computedPayMethod = "Online";
//     } else if (pType === "Advance Downpayment") {
//       const standardDownpayment = Math.max(299, Math.round((calculatedTotal * 0.20) / 50) * 50);
//       computedAdvance = Number(advanceAmount) > 0 ? Number(advanceAmount) : standardDownpayment;
//       computedBalance = Math.max(0, calculatedTotal - computedAdvance);
//       computedPayStatus = "Advance Paid";
//       computedDownStatus = "Paid";
//       computedBalStatus = "Pending";
//       computedPayMethod = "Online";
//     } else { // Full COD
//       computedAdvance = 0;
//       computedBalance = calculatedTotal;
//       computedPayStatus = "Pending";
//       computedDownStatus = "Pending";
//       computedBalStatus = "Pending";
//       computedPayMethod = "COD";
//     }

//     const booking = new DecorationBooking({
//       bookingId,
//       user: userContext.userId || null,
//       package: pkg._id,
//       packageTitle: pkg.title,
//       packagePrice: packageOfficialPrice,
//       packageImage: pkg.coverImage || (pkg.images && pkg.images[0]) || "",
//       venueType: venueType || "Hotel Room",
//       hotelName: (hotelName || "").trim(),
//       roomNumber: (roomNumber || "").trim(),
//       bookingHolderName: (bookingHolderName || "").trim(),
//       venueAddress: venueAddress.trim(),
//       city: city ? city.trim() : "Faridabad",
//       pincode: (pincode || "").trim(),
//       googleMapsUrl: (googleMapsUrl || "").trim(),
//       setupDate,
//       setupTimeSlot,
//       surpriseEntryTime: (surpriseEntryTime || "").trim(),
//       occasion: occasion || "Birthday",
//       customMessage: (customMessage || "").trim(),
//       colorTheme: colorTheme || "Red & Gold",
//       specialInstructions: (specialInstructions || "").trim(),
//       addons: validatedAddons,
//       customerName: customerName.trim(),
//       customerPhone: customerPhone.trim(),
//       customerWhatsapp: (customerWhatsapp || customerPhone).trim(),
//       customerEmail: (customerEmail || "").trim(),
//       totalAmount: calculatedTotal,
//       paymentType: pType,
//       paymentMethod: computedPayMethod,
//       advanceAmount: computedAdvance,
//       balanceAmount: computedBalance,
//       paymentStatus: computedPayStatus,
//       downpaymentStatus: computedDownStatus,
//       balancePaymentStatus: computedBalStatus,
//       balancePaymentMethod: pType === "Full Online" ? "Unpaid" : "Unpaid",
//       razorpayOrderId: razorpayOrderId || "",
//       razorpayPaymentId: razorpayPaymentId || "",
//       razorpaySignature: razorpaySignature || "",
//       status: "Confirmed",
//     });

//     const savedBooking = await booking.save();

//     // Send Email Notification to Admin & Customer with 1-click status actions
//     try {
//       const emailService = require("../../utils/emailService");
//       if (emailService.sendDecorationBookingNotification) {
//         emailService.sendDecorationBookingNotification(savedBooking).catch((e) => {
//           console.error("[email] Error sending decoration booking notification:", e.message);
//         });
//       }
//     } catch (e) {
//       console.warn("[email] emailService could not be loaded for decorations:", e.message);
//     }

//     if (logActivity && userContext.req) {
//       await logActivity({
//         req: userContext.req,
//         action: "New Decoration Booking",
//         module: "Decorations",
//         details: `Booking ${savedBooking.bookingId} for "${savedBooking.packageTitle}" at ${savedBooking.venueType} (${savedBooking.city}).`,
//         severity: "info",
//       });
//     }

//     return savedBooking;
//   }

//   /**
//    * Public Customer Live Booking Status Tracker
//    * Allows customer to check status, venue detail, time slot, and feel 100% satisfied!
//    */
//   async trackBooking(bookingIdQuery, customerPhone) {
//     if (!bookingIdQuery || !bookingIdQuery.trim()) {
//       throw new Error("Please provide a valid Booking ID");
//     }

//     const trimmed = bookingIdQuery.trim();
//     const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmed);
//     const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//     const query = {
//       $or: [
//         { bookingId: { $regex: `^${escaped}$`, $options: "i" } },
//         ...(isObjectId ? [{ _id: trimmed }] : []),
//       ],
//     };

//     const booking = await DecorationBooking.findOne(query).populate(
//       "assignedPartner",
//       "name ownerFirstName whatsappNumber rating"
//     );

//     if (!booking) {
//       throw new Error("No decoration booking found with ID: " + trimmed);
//     }

//     // Optional phone validation for customer security
//     if (customerPhone && customerPhone.trim()) {
//       const phoneDigits = customerPhone.replace(/\D/g, "");
//       const bookingPhoneDigits = (booking.customerPhone || "").replace(/\D/g, "");
//       if (bookingPhoneDigits && !bookingPhoneDigits.endsWith(phoneDigits.slice(-10))) {
//         throw new Error("Phone number does not match this booking record.");
//       }
//     }

//     const currentStatus = booking.status || "Pending";
//     const statusMeta = STATUS_PROGRESS_MAP[currentStatus] || STATUS_PROGRESS_MAP["Pending"];

//     // Timeline steps for UI progress bar
//     const timeline = [
//       { key: "Pending", label: "Booked", done: true },
//       { key: "Confirmed", label: "Confirmed", done: ["Confirmed", "Decorator Assigned", "In Setup", "Decorated & Ready", "Completed"].includes(currentStatus) },
//       { key: "Decorator Assigned", label: "Partner Dispatched", done: ["Decorator Assigned", "In Setup", "Decorated & Ready", "Completed"].includes(currentStatus) },
//       { key: "In Setup", label: "In Setup", done: ["In Setup", "Decorated & Ready", "Completed"].includes(currentStatus) },
//       { key: "Decorated & Ready", label: "Ready!", done: ["Decorated & Ready", "Completed"].includes(currentStatus) },
//       { key: "Completed", label: "Completed", done: currentStatus === "Completed" },
//     ];

//     return {
//       bookingId: booking.bookingId,
//       packageTitle: booking.packageTitle,
//       packageImage: booking.packageImage,
//       occasion: booking.occasion,
//       colorTheme: booking.colorTheme,
//       customMessage: booking.customMessage,
//       setupDate: booking.setupDate,
//       setupTimeSlot: booking.setupTimeSlot,
//       surpriseEntryTime: booking.surpriseEntryTime,
//       venueType: booking.venueType,
//       hotelName: booking.hotelName,
//       roomNumber: booking.roomNumber,
//       venueAddress: booking.venueAddress,
//       city: booking.city,
//       customerName: booking.customerName,
//       totalAmount: booking.totalAmount,
//       paymentStatus: booking.paymentStatus,
//       status: currentStatus,
//       statusLabel: statusMeta.label,
//       statusDescription: statusMeta.description,
//       stepIndex: statusMeta.step,
//       timeline,
//       assignedPartnerName: booking.assignedPartnerName || (booking.assignedPartner ? booking.assignedPartner.name : null),
//       supportWhatsapp: process.env.SUPPORT_WHATSAPP || "918400787712",
//       createdAt: booking.createdAt,
//       updatedAt: booking.updatedAt,
//     };
//   }

//   /**
//    * Get all bookings with filtering & pagination (Admin)
//    */
//   async getAllBookings({ status, city, date, search, page = 1, limit = 15 } = {}) {
//     const query = {};

//     if (status && status !== "all") {
//       query.status = status;
//     }

//     if (city && city !== "all") {
//       query.city = { $regex: `^${city.trim()}$`, $options: "i" };
//     }

//     if (date) {
//       query.setupDate = date;
//     }

//     if (search && search.trim()) {
//       const s = search.trim();
//       query.$or = [
//         { bookingId: { $regex: s, $options: "i" } },
//         { customerName: { $regex: s, $options: "i" } },
//         { customerPhone: { $regex: s, $options: "i" } },
//         { hotelName: { $regex: s, $options: "i" } },
//         { packageTitle: { $regex: s, $options: "i" } },
//         { city: { $regex: s, $options: "i" } },
//       ];
//     }

//     const pageNum = Math.max(1, parseInt(page) || 1);
//     const limitNum = Math.max(1, parseInt(limit) || 15);
//     const skip = (pageNum - 1) * limitNum;

//     const bookings = await DecorationBooking.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limitNum)
//       .populate("assignedPartner", "name ownerFirstName ownerPhone whatsappNumber");

//     const total = await DecorationBooking.countDocuments(query);

//     const todayStr = new Date().toISOString().slice(0, 10);
//     const todayCount = await DecorationBooking.countDocuments({ setupDate: todayStr });
//     const activeCount = await DecorationBooking.countDocuments({
//       status: { $in: ["Confirmed", "Decorator Assigned", "In Setup", "Decorated & Ready"] },
//     });
//     const completedCount = await DecorationBooking.countDocuments({ status: "Completed" });

//     return {
//       bookings,
//       total,
//       page: pageNum,
//       totalPages: Math.ceil(total / limitNum) || 1,
//       stats: {
//         totalBookings: total,
//         todaySetups: todayCount,
//         activeSetups: activeCount,
//         completedSetups: completedCount,
//       },
//     };
//   }

//   /**
//    * Get single booking by ID
//    */
//   async getBookingById(id) {
//     const booking = await DecorationBooking.findById(id).populate(
//       "assignedPartner",
//       "name ownerFirstName ownerLastName ownerPhone whatsappNumber address"
//     );

//     if (!booking) {
//       throw new Error("Decoration booking not found");
//     }
//     return booking;
//   }

//   /**
//    * Update booking status
//    */
//   async updateBookingStatus(id, { status, adminNotes }) {
//     const booking = await DecorationBooking.findById(id);
//     if (!booking) {
//       throw new Error("Booking not found");
//     }

//     if (status) booking.status = status;
//     if (adminNotes !== undefined) booking.adminNotes = adminNotes;

//     return await booking.save();
//   }

//   /**
//    * Assign decorator partner to booking
//    */
//   async assignDecorator(id, { partnerId, decoratorPayout }) {
//     const booking = await DecorationBooking.findById(id);
//     if (!booking) {
//       throw new Error("Booking not found");
//     }

//     if (!partnerId) {
//       booking.assignedPartner = null;
//       booking.assignedPartnerName = null;
//       booking.assignedPartnerPhone = null;
//     } else {
//       const partner = await PartnerStore.findById(partnerId);
//       if (!partner) {
//         throw new Error("Partner store not found");
//       }

//       booking.assignedPartner = partner._id;
//       booking.assignedPartnerName = partner.name;
//       booking.assignedPartnerPhone = partner.whatsappNumber || partner.ownerPhone;
//       booking.status = "Decorator Assigned";
//     }

//     if (decoratorPayout !== undefined) {
//       booking.decoratorPayout = Number(decoratorPayout) || 0;
//     }

//     return await booking.save();
//   }

//   /**
//    * Verify email action token and confirm status change
//    */
//   async confirmEmailStatusChange(id, status, token) {
//     if (!VALID_DECORATION_STATUSES.includes(status)) {
//       throw new Error("Invalid status for decoration booking.");
//     }
//     if (!verifyActionToken(id, status, token)) {
//       throw new Error("Security verification token is invalid or expired.");
//     }

//     const booking = await DecorationBooking.findById(id);
//     if (!booking) {
//       throw new Error("Booking not found.");
//     }

//     booking.status = status;
//     return await booking.save();
//   }

//   /**
//    * Create Razorpay Order for Advance Downpayment or Full Payment
//    */
//   async createRazorpayOrder({ packageId, paymentType = "Advance Downpayment", addons = [] }) {
//     const pkg = await DecorationPackage.findById(packageId);
//     if (!pkg) throw new Error("Selected decoration package not found");

//     const packageOfficialPrice = Number(pkg.salePrice || pkg.price) || 0;
//     let addonsTotal = 0;
//     if (Array.isArray(addons)) {
//       addons.forEach((item) => {
//         addonsTotal += Math.max(0, Number(item.price) || 0) * Math.max(1, parseInt(item.quantity, 10) || 1);
//       });
//     }

//     const totalAmount = packageOfficialPrice + addonsTotal;
//     let amountToCharge = totalAmount;
//     let advanceAmount = 0;
//     let balanceAmount = 0;

//     if (paymentType === "Advance Downpayment") {
//       advanceAmount = Math.max(299, Math.round((totalAmount * 0.20) / 50) * 50);
//       balanceAmount = Math.max(0, totalAmount - advanceAmount);
//       amountToCharge = advanceAmount;
//     } else if (paymentType === "Full Online") {
//       advanceAmount = totalAmount;
//       balanceAmount = 0;
//       amountToCharge = totalAmount;
//     }

//     const paymentService = require("../paymentService");
//     const razorpayOrder = await paymentService.createRazorpayOrder(amountToCharge);

//     return {
//       razorpayOrderId: razorpayOrder.id,
//       amountToCharge,
//       advanceAmount,
//       balanceAmount,
//       totalAmount,
//       currency: "INR",
//       keyId: process.env.RAZORPAY_KEY_ID || null,
//     };
//   }

//   /**
//    * Verify Razorpay Payment Signature
//    */
//   async verifyPayment({ bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
//     const crypto = require("crypto");
//     const secret = process.env.RAZORPAY_KEY_SECRET;
//     if (!secret) {
//       throw new Error("Razorpay secret not configured on server");
//     }

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       throw new Error("Payment signature verification failed");
//     }

//     const booking = await DecorationBooking.findOne({
//       $or: [{ bookingId }, { razorpayOrderId: razorpay_order_id }],
//     });

//     if (booking) {
//       booking.razorpayPaymentId = razorpay_payment_id;
//       booking.razorpaySignature = razorpay_signature;
//       if (booking.paymentType === "Full Online") {
//         booking.paymentStatus = "Paid";
//         booking.downpaymentStatus = "Paid";
//         booking.balancePaymentStatus = "Waived";
//       } else {
//         booking.paymentStatus = "Advance Paid";
//         booking.downpaymentStatus = "Paid";
//       }
//       return await booking.save();
//     }

//     return null;
//   }

//   /**
//    * Record Remaining Balance Collected by Decorator on Site
//    */
//   async recordBalancePayment(bookingId, { balancePaymentMethod = "Cash on Setup", notes = "" }) {
//     const booking = await DecorationBooking.findById(bookingId);
//     if (!booking) throw new Error("Booking not found");

//     booking.balancePaymentStatus = "Collected by Decorator";
//     booking.balancePaymentMethod = balancePaymentMethod;
//     booking.balanceCollectedAt = new Date();
//     booking.paymentStatus = "Paid";
//     if (notes) {
//       booking.adminNotes = (booking.adminNotes ? booking.adminNotes + "\n" : "") + `[Balance Collected] ${notes}`;
//     }
//     return await booking.save();
//   }

//   /**
//    * Admin General Booking Update (Date, Room, Notes, etc.)
//    */
//   async updateBooking(bookingId, updateData) {
//     const booking = await DecorationBooking.findById(bookingId);
//     if (!booking) throw new Error("Booking not found");

//     const allowed = [
//       "hotelName",
//       "roomNumber",
//       "bookingHolderName",
//       "venueAddress",
//       "setupDate",
//       "setupTimeSlot",
//       "surpriseEntryTime",
//       "colorTheme",
//       "customMessage",
//       "specialInstructions",
//       "adminNotes",
//       "status",
//       "decoratorPayout",
//       "paymentStatus",
//       "balancePaymentStatus",
//     ];

//     allowed.forEach((field) => {
//       if (updateData[field] !== undefined) {
//         booking[field] = updateData[field];
//       }
//     });

//     return await booking.save();
//   }
// }

// module.exports = new DecorationBookingService();


const mongoose = require("mongoose");
const Addon = require("../../models/Addon");
const DecorationBooking = require("../../models/DecorationBooking");
const User = require("../../models/User");
const optionsService = require("./decorationOptionsService");
const DecorationPackage = require("../../models/DecorationPackage");
const PartnerStore = require("../../models/PartnerStore");
const { verifyActionToken } = require("../../utils/orderActionToken");

let logActivity;
try {
  logActivity = require("../../utils/auditLogger").logActivity;
} catch (e) {
  logActivity = async () => { };
}

const VALID_DECORATION_STATUSES = [
  "Pending",
  "Confirmed",
  "Decorator Assigned",
  "In Setup",
  "Decorated & Ready",
  "Completed",
  "Cancelled",
];

const STATUS_PROGRESS_MAP = {
  Pending: { step: 0, label: "Order Received", description: "Your decoration request is received and waiting for slot confirmation." },
  Confirmed: { step: 1, label: "Booking Confirmed", description: "Your setup slot and venue requirements are confirmed by our team." },
  "Decorator Assigned": { step: 2, label: "Decorator Assigned", description: "A verified local Faridabad decorator has been allocated for your venue." },
  "In Setup": { step: 3, label: "Decor in Progress", description: "The decorator has reached your hotel/venue and is actively setting up the decor." },
  "Decorated & Ready": { step: 4, label: "Ready for Surprise", description: "All balloons, fairy lights & flowers are fully decorated and ready for your grand entry!" },
  Completed: { step: 5, label: "Setup Completed", description: "Celebration complete! Thank you for choosing GiftCart." },
  Cancelled: { step: -1, label: "Booking Cancelled", description: "This booking was cancelled. Any refund applicable will be processed." },
};

const crypto = require("crypto");

const ONLINE_TYPES = ["Full Online", "Advance Downpayment"];
const STAFF_ROLES = ["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent", "seo_specialist"];
const IST_OFFSET_MS = 330 * 60 * 1000;

// Booking rules (notice hours, cancellation window, ...) are edited by the admin in
// Decoration Dashboard → Booking Setup → Rules. This reads the last loaded values (cached a few seconds).
const S = () => optionsService.peekSettings();
const cfg = {
  minLeadHours: () => S().minLeadHours,
  maxAdvanceDays: () => S().maxAdvanceDays,
  cancelHours: () => S().cancelHours,
  unpaidMinutes: () => S().unpaidExpiryMinutes,
  maxUnpaid: () => S().maxUnpaidPerUser,
};

// Booking id: DEC-<yymmdd>-<6 random chars>. (The old 4-digit suffix collided after ~100 bookings a day.)
const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateBookingId = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const bytes = crypto.randomBytes(6);
  let suffix = "";
  for (const b of bytes) suffix += ID_ALPHABET[b % ID_ALPHABET.length];
  return `DEC-${dateStr}-${suffix}`;
};

const digits10 = (v) => String(v || "").replace(/\D/g, "").slice(-10);
// "<" and ">" are removed from every free-text field — booking details are copied into e-mails
const clean = (v, max) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);

// Date / time rules live in the options service (single source of truth).
const parseSlotStartMinutes = optionsService.slotStartMinutes;
const setupStartMs = optionsService.setupStartMs;
const assertSetupWindow = (setupDate, slot, now, settings) => optionsService.assertSetupWindow(setupDate, slot, now, settings);

/** What a customer may see about their own booking (no admin notes, payouts or gateway secrets). */
function toCustomerView(b, now = Date.now()) {
  const o = b && typeof b.toObject === "function" ? b.toObject() : b;
  const online = ONLINE_TYPES.includes(o.paymentType);
  const alive = o.status !== "Cancelled" && o.status !== "Completed";
  const paidOnline = o.paymentType === "Full Online" ? o.paymentStatus === "Paid" : o.downpaymentStatus === "Paid";
  const canPay = online && alive && !paidOnline;
  const payAmount = o.paymentType === "Full Online" ? o.totalAmount : o.advanceAmount;

  const start = setupStartMs(o.setupDate, o.setupTimeSlot);
  const hoursToStart = start === null ? null : (start - now) / 3600000;
  const unpaidOnline = online && !paidOnline;
  const cancellableStatus = ["Pending", "Confirmed", "Decorator Assigned"].includes(o.status);
  const canCancel = cancellableStatus && (unpaidOnline || hoursToStart === null || hoursToStart >= cfg.cancelHours());

  return {
    _id: String(o._id),
    bookingId: o.bookingId,
    packageTitle: o.packageTitle,
    packageImage: o.packageImage,
    status: o.status,
    paymentType: o.paymentType,
    paymentStatus: o.paymentStatus,
    totalAmount: o.totalAmount,
    advanceAmount: o.advanceAmount,
    balanceAmount: o.balanceAmount,
    setupDate: o.setupDate,
    setupTimeSlot: o.setupTimeSlot,
    isCustomTimeSlot: Boolean(o.isCustomTimeSlot),
    surpriseEntryTime: o.surpriseEntryTime,
    venueType: o.venueType,
    hotelName: o.hotelName,
    roomNumber: o.roomNumber,
    venueAddress: o.venueAddress,
    city: o.city,
    occasion: o.occasion,
    customMessage: o.customMessage,
    colorTheme: o.colorTheme,
    addons: (o.addons || []).map((a) => ({ name: a.name, price: a.price, quantity: a.quantity })),
    assignedPartnerName: o.assignedPartnerName || null,
    cancelledReason: o.cancelledReason || "",
    cancelledBy: o.cancelledBy || "",
    paymentDueBy: canPay ? o.paymentDueBy || null : null,
    canPay,
    payAmount: canPay ? payAmount : 0,
    canCancel,
    cancelWindowHours: cfg.cancelHours(),
    supportPhone: S().supportPhone || "",
    supportWhatsapp: S().supportWhatsapp || process.env.SUPPORT_WHATSAPP || "918400787712",
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

/**
 * Service for Decoration Bookings & Live Customer Tracking
 */
/**
 * SERVER-SIDE ADD-ON PRICING.
 * The client may only say WHICH add-on (id from the Addons catalogue managed in
 * Admin → Add-ons) and HOW MANY. Name and price are always read from the database;
 * any name/price the client sends is ignored.
 * Accepted shape: [{ addonId | _id | id, quantity }]
 */
async function resolveAddons(rawAddons) {
  if (rawAddons === undefined || rawAddons === null) return { validatedAddons: [], addonsTotal: 0 };
  if (!Array.isArray(rawAddons)) throw new Error("Invalid add-ons.");
  if (rawAddons.length > 20) throw new Error("Too many add-ons selected.");
  if (rawAddons.length === 0) return { validatedAddons: [], addonsTotal: 0 };

  const ids = rawAddons.map((a) => String(a?.addonId || a?._id || a?.id || ""));
  if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new Error("One of the selected add-ons is invalid. Please refresh and try again.");
  }

  const docs = await Addon.find({ _id: { $in: ids }, isActive: true }).lean();
  const byId = new Map(docs.map((d) => [String(d._id), d]));

  let addonsTotal = 0;
  const validatedAddons = rawAddons.map((a, i) => {
    const doc = byId.get(ids[i]);
    if (!doc) throw new Error("One of the selected add-ons is no longer available.");
    const quantity = Math.min(10, Math.max(1, parseInt(a.quantity, 10) || 1));
    const price = Math.max(0, Number(doc.price) || 0);
    addonsTotal += price * quantity;
    return { name: doc.name, price, quantity };
  });

  return { validatedAddons, addonsTotal };
}

const NOT_FOUND_MSG = "Booking not found. Check the Booking ID and the phone number you used while booking.";

class DecorationBookingService {
  /**
   * Create new customer decoration booking
   */
  async createBooking(data, userContext = {}) {
    const {
      packageId,
      venueType,
      venueTypeId,
      hotelName,
      roomNumber,
      bookingHolderName,
      venueAddress,
      city,
      pincode,
      googleMapsUrl,
      setupDate,
      setupTimeSlot,
      timeSlotId,
      customTime,
      surpriseEntryTime,
      occasion,
      customMessage,
      colorTheme,
      specialInstructions,
      addons,
      customerName,
      customerPhone,
      customerWhatsapp,
      customerEmail,
      paymentType,
      paymentMethod,
      advanceAmount,
      balanceAmount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      totalAmount,
    } = data;

    if (!packageId || !setupDate || !(setupTimeSlot || timeSlotId || customTime) || !venueAddress || !customerName || !customerPhone) {
      throw new Error("Please fill in all required venue and contact fields.");
    }
    const settings = await optionsService.getSettings(); // booking rules set by the admin (also warms the cache)

    if (!mongoose.Types.ObjectId.isValid(String(packageId))) {
      throw new Error("Selected decoration package was not found. Please refresh the page and try again.");
    }
    const pkg = await DecorationPackage.findById(packageId);
    if (!pkg || (pkg.isActive === false && !userContext.isStaff)) {
      throw new Error("Selected decoration package was not found. Please refresh the page and try again.");
    }

    // ── Input validation (the same rules apply to every client) ──────────────
    const isStaff = Boolean(userContext.isStaff);
    const phone10 = digits10(customerPhone);
    if (phone10.length !== 10) throw new Error("Please enter a valid 10-digit calling number.");
    const whatsapp10 = digits10(customerWhatsapp) || phone10;
    const emailClean = clean(customerEmail, 120);
    if (emailClean && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailClean)) throw new Error("Please enter a valid email address.");
    if (clean(customerName, 80).length < 2) throw new Error("Please enter the customer's name.");
    if (clean(venueAddress, 600).length < 8) throw new Error("Please enter the full venue address.");

    // Venue type, time slot and colour theme must be options the admin offers (the server decides, not the client).
    // Date rules, notice period and per-slot capacity are checked inside resolveTimeSlot (staff may enter same-day jobs).
    const venue = await optionsService.resolveVenue({ venueTypeId, venueType, hotelName, roomNumber }, { isStaff });
    const slot = await optionsService.resolveTimeSlot({ timeSlotId, setupTimeSlot, customTime, setupDate }, { isStaff });
    if (setupStartMs(setupDate, slot.label) === null) throw new Error("Please choose a valid setup date.");
    const themeName = await optionsService.resolveColorTheme(colorTheme, pkg, { isStaff });

    if (!isStaff) {
      const activeStatuses = { $ne: "Cancelled" };

      // same customer, same package, same date + slot → almost certainly a double tap
      const duplicate = await DecorationBooking.exists({
        user: userContext.userId,
        package: pkg._id,
        setupDate,
        setupTimeSlot: slot.label,
        status: activeStatuses,
      });
      if (duplicate) {
        throw new Error("You already have a booking for this package at the same date and time. You can pay for or manage it in My Bookings.");
      }

      // stops one account from locking up many slots with unpaid bookings
      const unpaid = await DecorationBooking.countDocuments({
        user: userContext.userId,
        status: "Pending",
        paymentStatus: "Pending",
        paymentType: { $in: ONLINE_TYPES },
      });
      if (unpaid >= cfg.maxUnpaid()) {
        throw new Error("You have unpaid bookings waiting. Please complete or cancel them from 'My Decoration Bookings' first.");
      }
    }

    // SERVER-SIDE TAMPER PROOF PRICING:
    // Package price is strictly authoritative from the database.
    const packageOfficialPrice = Number(pkg.salePrice || pkg.price) || 0;

    // Add-on name + price come from the Addon collection, never from the client.
    const { validatedAddons, addonsTotal } = await resolveAddons(addons);

    const calculatedTotal = packageOfficialPrice + addonsTotal;
    const bookingId = generateBookingId();

    // REAL BUSINESS DOWNPAYMENT LOGIC:
    const pType = paymentType || (paymentMethod === "COD" ? "Full COD" : "Advance Downpayment");

    // SECURITY: a booking is only marked Paid / Advance Paid when the Razorpay
    // payment is PROVEN (valid signature, unused payment id, enough amount).
    // Previously it was marked paid purely because the client SAID
    // paymentType = "Full Online" — no payment needed. If no payment proof is sent
    // (e.g. the mobile app, which books without paying online) the booking is still
    // saved, but as "Pending" so staff can collect the money.
    const isOnlineType = pType === "Full Online" || pType === "Advance Downpayment";
    const hasPaymentProof = Boolean(razorpayOrderId && razorpayPaymentId && razorpaySignature);
    const paymentProven = isOnlineType && hasPaymentProof;
    if (paymentProven) {
      await this._assertPaymentProven({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        minAmountRupees:
          pType === "Full Online" ? packageOfficialPrice : optionsService.computeAdvance(packageOfficialPrice, settings),
      });
    }
    let computedAdvance = 0;
    let computedBalance = 0;
    let computedPayStatus = "Pending";
    let computedDownStatus = "Pending";
    let computedBalStatus = "Pending";
    let computedPayMethod = paymentMethod || "Online";

    if (pType === "Full Online") {
      computedAdvance = calculatedTotal;
      computedBalance = paymentProven ? 0 : calculatedTotal;
      computedPayStatus = paymentProven ? "Paid" : "Pending";
      computedDownStatus = paymentProven ? "Paid" : "Pending";
      computedBalStatus = paymentProven ? "Waived" : "Pending";
      computedPayMethod = "Online";
    } else if (pType === "Advance Downpayment") {
      const standardDownpayment = optionsService.computeAdvance(calculatedTotal, settings);
      computedAdvance = standardDownpayment; // always computed on the server, never taken from the client
      computedBalance = Math.max(0, calculatedTotal - computedAdvance);
      computedPayStatus = paymentProven ? "Advance Paid" : "Pending";
      computedDownStatus = paymentProven ? "Paid" : "Pending";
      computedBalStatus = "Pending";
      computedPayMethod = "Online";
    } else { // Full COD
      computedAdvance = 0;
      computedBalance = calculatedTotal;
      computedPayStatus = "Pending";
      computedDownStatus = "Pending";
      computedBalStatus = "Pending";
      computedPayMethod = "COD";
    }

    const booking = new DecorationBooking({
      bookingId,
      user: userContext.userId || null,
      package: pkg._id,
      packageTitle: pkg.title,
      packagePrice: packageOfficialPrice,
      packageImage: pkg.coverImage || (pkg.images && pkg.images[0]) || "",
      venueType: venue.name,
      hotelName: venue.hotelName,
      roomNumber: venue.roomNumber,
      bookingHolderName: clean(bookingHolderName, 80),
      venueAddress: clean(venueAddress, 600),
      city: clean(city, 60) || "Faridabad",
      pincode: String(pincode || "").replace(/\D/g, "").slice(0, 6),
      googleMapsUrl: /^https?:\/\//i.test(String(googleMapsUrl || "").trim()) ? clean(googleMapsUrl, 400) : "",
      setupDate,
      setupTimeSlot: slot.label,
      isCustomTimeSlot: Boolean(slot.isCustom),
      surpriseEntryTime: clean(surpriseEntryTime, 40),
      occasion: pkg.category || clean(occasion, 40) || "Birthday",
      customMessage: clean(customMessage, 200),
      colorTheme: themeName,
      specialInstructions: clean(specialInstructions, 500),
      addons: validatedAddons,
      customerName: clean(customerName, 80),
      customerPhone: phone10,
      customerWhatsapp: whatsapp10,
      customerEmail: emailClean,
      totalAmount: calculatedTotal,
      paymentType: pType,
      paymentMethod: computedPayMethod,
      advanceAmount: computedAdvance,
      balanceAmount: computedBalance,
      paymentStatus: computedPayStatus,
      downpaymentStatus: computedDownStatus,
      balancePaymentStatus: computedBalStatus,
      balancePaymentMethod: pType === "Full Online" ? "Unpaid" : "Unpaid",
      razorpayOrderId: razorpayOrderId || "",
      razorpayPaymentId: razorpayPaymentId || "",
      razorpaySignature: razorpaySignature || "",
      // Paid online (or pay-on-setup) → confirmed. Online but not paid yet → Pending until the payment is verified.
      // (Bookings entered by staff in the admin panel are confirmed as before and never auto-released.)
      status: isStaff || pType === "Full COD" || paymentProven ? "Confirmed" : "Pending",
      paymentDueBy:
        !isStaff && isOnlineType && !paymentProven ? new Date(Date.now() + cfg.unpaidMinutes() * 60000) : null,
    });

    let savedBooking;
    for (let attempt = 0; ; attempt += 1) {
      try {
        savedBooking = await booking.save();
        break;
      } catch (err) {
        // bookingId collision (unique index) → pick a new id and retry
        if (err?.code === 11000 && String(err?.message).includes("bookingId") && attempt < 5) {
          booking.bookingId = generateBookingId();
          continue;
        }
        throw err;
      }
    }

    // Send Email Notification to Admin & Customer with 1-click status actions
    try {
      const emailService = require("../../utils/emailService");
      // Unpaid online bookings are announced after the payment is verified (see _applyPaid).
      if (savedBooking.status === "Confirmed" && emailService.sendDecorationBookingNotification) {
        emailService.sendDecorationBookingNotification(savedBooking).catch((e) => {
          console.error("[email] Error sending decoration booking notification:", e.message);
        });
      }
    } catch (e) {
      console.warn("[email] emailService could not be loaded for decorations:", e.message);
    }

    if (logActivity && userContext.req) {
      await logActivity({
        req: userContext.req,
        action: "New Decoration Booking",
        module: "Decorations",
        details: `Booking ${savedBooking.bookingId} for "${savedBooking.packageTitle}" at ${savedBooking.venueType} (${savedBooking.city}).`,
        severity: "info",
      });
    }

    return savedBooking;
  }

  /**
   * Public Customer Live Booking Status Tracker
   * Allows customer to check status, venue detail, time slot, and feel 100% satisfied!
   */
  async trackBooking(bookingIdQuery, customerPhone, viewerUserId) {
    if (!bookingIdQuery || !bookingIdQuery.trim()) {
      throw new Error("Please provide a valid Booking ID");
    }

    const trimmed = bookingIdQuery.trim();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmed);
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const query = {
      $or: [
        { bookingId: { $regex: `^${escaped}$`, $options: "i" } },
        ...(isObjectId ? [{ _id: trimmed }] : []),
      ],
    };

    const booking = await DecorationBooking.findOne(query).populate(
      "assignedPartner",
      "name ownerFirstName whatsappNumber rating"
    );

    if (!booking) {
      throw new Error(NOT_FOUND_MSG);
    }

    // Booking ids can be guessed, so the phone number used while booking is REQUIRED for public tracking.
    // The logged-in owner of the booking doesn't need it.
    const isOwner = viewerUserId && booking.user && String(booking.user) === String(viewerUserId);
    if (!isOwner) {
      const given = digits10(customerPhone);
      const actual = digits10(booking.customerPhone);
      if (given.length !== 10 || !actual || given !== actual) throw new Error(NOT_FOUND_MSG);
    }

    const currentStatus = booking.status || "Pending";
    const statusMeta = STATUS_PROGRESS_MAP[currentStatus] || STATUS_PROGRESS_MAP["Pending"];

    // Timeline steps for UI progress bar
    const timeline = [
      { key: "Pending", label: "Booked", done: true },
      { key: "Confirmed", label: "Confirmed", done: ["Confirmed", "Decorator Assigned", "In Setup", "Decorated & Ready", "Completed"].includes(currentStatus) },
      { key: "Decorator Assigned", label: "Partner Dispatched", done: ["Decorator Assigned", "In Setup", "Decorated & Ready", "Completed"].includes(currentStatus) },
      { key: "In Setup", label: "In Setup", done: ["In Setup", "Decorated & Ready", "Completed"].includes(currentStatus) },
      { key: "Decorated & Ready", label: "Ready!", done: ["Decorated & Ready", "Completed"].includes(currentStatus) },
      { key: "Completed", label: "Completed", done: currentStatus === "Completed" },
    ];

    return {
      bookingId: booking.bookingId,
      packageTitle: booking.packageTitle,
      packageImage: booking.packageImage,
      occasion: booking.occasion,
      colorTheme: booking.colorTheme,
      customMessage: booking.customMessage,
      setupDate: booking.setupDate,
      setupTimeSlot: booking.setupTimeSlot,
      surpriseEntryTime: booking.surpriseEntryTime,
      venueType: booking.venueType,
      hotelName: booking.hotelName,
      roomNumber: booking.roomNumber,
      venueAddress: booking.venueAddress,
      city: booking.city,
      customerName: booking.customerName,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      status: currentStatus,
      statusLabel: statusMeta.label,
      statusDescription: statusMeta.description,
      stepIndex: statusMeta.step,
      timeline,
      assignedPartnerName: booking.assignedPartnerName || (booking.assignedPartner ? booking.assignedPartner.name : null),
      supportWhatsapp: S().supportWhatsapp || process.env.SUPPORT_WHATSAPP || "918400787712",
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  /**
   * Get all bookings with filtering & pagination (Admin)
   */
  async getAllBookings({ status, city, date, search, page = 1, limit = 15 } = {}) {
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (city && city !== "all") {
      query.city = { $regex: `^${city.trim()}$`, $options: "i" };
    }

    if (date) {
      query.setupDate = date;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { bookingId: { $regex: s, $options: "i" } },
        { customerName: { $regex: s, $options: "i" } },
        { customerPhone: { $regex: s, $options: "i" } },
        { hotelName: { $regex: s, $options: "i" } },
        { packageTitle: { $regex: s, $options: "i" } },
        { city: { $regex: s, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 15);
    const skip = (pageNum - 1) * limitNum;

    const bookings = await DecorationBooking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("assignedPartner", "name ownerFirstName ownerPhone whatsappNumber");

    const total = await DecorationBooking.countDocuments(query);

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = await DecorationBooking.countDocuments({ setupDate: todayStr });
    const activeCount = await DecorationBooking.countDocuments({
      status: { $in: ["Confirmed", "Decorator Assigned", "In Setup", "Decorated & Ready"] },
    });
    const completedCount = await DecorationBooking.countDocuments({ status: "Completed" });

    return {
      bookings,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      stats: {
        totalBookings: total,
        todaySetups: todayCount,
        activeSetups: activeCount,
        completedSetups: completedCount,
      },
    };
  }

  /**
   * Get single booking by ID
   */
  async getBookingById(id) {
    const booking = await DecorationBooking.findById(id).populate(
      "assignedPartner",
      "name ownerFirstName ownerLastName ownerPhone whatsappNumber address"
    );

    if (!booking) {
      throw new Error("Decoration booking not found");
    }
    return booking;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(id, { status, adminNotes }) {
    const booking = await DecorationBooking.findById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (status) booking.status = status;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;

    return await booking.save();
  }

  /**
   * Assign decorator partner to booking
   */
  async assignDecorator(id, { partnerId, decoratorPayout }) {
    const booking = await DecorationBooking.findById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!partnerId) {
      booking.assignedPartner = null;
      booking.assignedPartnerName = null;
      booking.assignedPartnerPhone = null;
    } else {
      const partner = await PartnerStore.findById(partnerId);
      if (!partner) {
        throw new Error("Partner store not found");
      }

      booking.assignedPartner = partner._id;
      booking.assignedPartnerName = partner.name;
      booking.assignedPartnerPhone = partner.whatsappNumber || partner.ownerPhone;
      booking.status = "Decorator Assigned";
    }

    if (decoratorPayout !== undefined) {
      booking.decoratorPayout = Number(decoratorPayout) || 0;
    }

    return await booking.save();
  }

  /**
   * Verify email action token and confirm status change
   */
  async confirmEmailStatusChange(id, status, token) {
    if (!VALID_DECORATION_STATUSES.includes(status)) {
      throw new Error("Invalid status for decoration booking.");
    }
    if (!verifyActionToken(id, status, token)) {
      throw new Error("Security verification token is invalid or expired.");
    }

    const booking = await DecorationBooking.findById(id);
    if (!booking) {
      throw new Error("Booking not found.");
    }

    booking.status = status;
    return await booking.save();
  }

  /**
   * Proves a Razorpay payment is real before a booking is stored as paid:
   *  1. all three Razorpay fields are present
   *  2. the HMAC signature is valid (constant-time compare)
   *  3. this payment id was not already used for another booking
   *  4. the Razorpay order amount is at least what this package/payment type costs
   */
  async _assertPaymentProven({ razorpayOrderId, razorpayPaymentId, razorpaySignature, minAmountRupees }) {
    const crypto = require("crypto");
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Online payments are not configured on the server.");
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error("Payment details are missing. Please complete the payment to confirm your booking.");
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(String(razorpaySignature));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error("Payment signature verification failed.");
    }

    const reused = await DecorationBooking.exists({ razorpayPaymentId });
    if (reused) throw new Error("This payment has already been used for another booking.");

    const paymentService = require("../paymentService");
    const rzpOrder = await paymentService.fetchRazorpayOrder(razorpayOrderId);
    if (!rzpOrder || Number(rzpOrder.amount) < Math.round(Number(minAmountRupees) * 100)) {
      throw new Error("Paid amount is lower than the booking amount.");
    }
  }

  /**
   * Create Razorpay Order for Advance Downpayment or Full Payment
   */
  async createRazorpayOrder({ packageId, paymentType = "Advance Downpayment", addons = [] }) {
    const pkg = await DecorationPackage.findById(packageId);
    if (!pkg) throw new Error("Selected decoration package not found");

    const packageOfficialPrice = Number(pkg.salePrice || pkg.price) || 0;
    const { addonsTotal } = await resolveAddons(addons);

    const totalAmount = packageOfficialPrice + addonsTotal;
    let amountToCharge = totalAmount;
    let advanceAmount = 0;
    let balanceAmount = 0;

    if (paymentType === "Advance Downpayment") {
      advanceAmount = Math.max(299, Math.round((totalAmount * 0.20) / 50) * 50);
      balanceAmount = Math.max(0, totalAmount - advanceAmount);
      amountToCharge = advanceAmount;
    } else if (paymentType === "Full Online") {
      advanceAmount = totalAmount;
      balanceAmount = 0;
      amountToCharge = totalAmount;
    }

    const paymentService = require("../paymentService");
    const razorpayOrder = await paymentService.createRazorpayOrder(amountToCharge);

    return {
      razorpayOrderId: razorpayOrder.id,
      amountToCharge,
      advanceAmount,
      balanceAmount,
      totalAmount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || null,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CUSTOMER SIDE (login required): my bookings, pay, verify payment, cancel
  // ───────────────────────────────────────────────────────────────────────────

  /** Finds a booking that belongs to this user (by bookingId code or Mongo _id). */
  async _findOwned(userId, idOrCode) {
    const id = String(idOrCode || "").trim();
    if (!userId || !id) throw new Error("Booking not found.");
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { $or: [{ _id: id }, { bookingId: id }], user: userId } : { bookingId: id, user: userId };
    const booking = await DecorationBooking.findOne(query);
    if (!booking) throw new Error("Booking not found.");
    return booking;
  }

  async getMyBookings(userId) {
    if (!userId) throw new Error("Please log in to see your bookings.");
    await optionsService.getSettings();

    // Bookings made before login was required (or entered by our team) have no owner. The customer's mobile
    // number is OTP-verified, so bookings made with that number are attached to the account.
    try {
      const account = await User.findById(userId).select("mobileNumber");
      const phone = digits10(account?.mobileNumber);
      if (phone.length === 10) {
        await DecorationBooking.updateMany(
          { user: null, customerPhone: { $regex: `${phone}$` } },
          { $set: { user: userId } }
        );
      }
    } catch (e) {
      console.warn("[decoration] could not link earlier bookings:", e.message);
    }

    const rows = await DecorationBooking.find({ user: userId }).sort({ createdAt: -1 }).limit(60);
    return rows.map((b) => toCustomerView(b));
  }

  async getMyBooking(userId, idOrCode) {
    await optionsService.getSettings();
    return toCustomerView(await this._findOwned(userId, idOrCode));
  }

  /**
   * Step 2 of an online booking: creates the Razorpay order for what is still unpaid.
   * The amount comes from the SAVED booking (never from the client).
   */
  async createPaymentOrderForBooking(userId, idOrCode) {
    await optionsService.getSettings();
    const booking = await this._findOwned(userId, idOrCode);
    const view = toCustomerView(booking);

    if (!ONLINE_TYPES.includes(booking.paymentType)) {
      throw new Error("This booking is pay-on-setup — there is nothing to pay online.");
    }
    if (booking.status === "Cancelled") {
      throw new Error("This booking was cancelled or expired. Please make a new booking.");
    }
    if (!view.canPay) throw new Error("Payment for this booking is already complete.");

    const paymentService = require("../paymentService");
    const rzp = await paymentService.createRazorpayOrder(view.payAmount);

    booking.razorpayOrderId = rzp.id;
    booking.paymentDueBy = new Date(Date.now() + cfg.unpaidMinutes() * 60000); // fresh window while they pay
    await booking.save();

    return {
      bookingId: booking.bookingId,
      razorpayOrderId: rzp.id,
      amountToCharge: view.payAmount,
      advanceAmount: booking.advanceAmount,
      balanceAmount: booking.balanceAmount,
      totalAmount: booking.totalAmount,
      packageTitle: booking.packageTitle,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || null,
    };
  }

  /** Marks the booking paid (shared by the browser verify call and the Razorpay webhook). Idempotent. */
  async _applyPaid(booking, { paymentId, signature = "" }) {
    if (booking.razorpayPaymentId === paymentId && (booking.paymentStatus === "Paid" || booking.downpaymentStatus === "Paid")) {
      return { booking, changed: false };
    }

    booking.razorpayPaymentId = paymentId;
    if (signature) booking.razorpaySignature = signature;
    if (booking.paymentType === "Full Online") {
      booking.paymentStatus = "Paid";
      booking.downpaymentStatus = "Paid";
      booking.balancePaymentStatus = "Waived";
      booking.balanceAmount = 0;
    } else {
      booking.paymentStatus = "Advance Paid";
      booking.downpaymentStatus = "Paid";
    }

    let lateAfterCancel = false;
    if (booking.status === "Pending") {
      booking.status = "Confirmed";
      booking.paymentDueBy = null;
    } else if (booking.status === "Cancelled") {
      if (booking.cancelledBy === "system") {
        // the customer paid just after the unpaid-booking timer released it → bring it back
        booking.status = "Confirmed";
        booking.cancelledBy = "";
        booking.cancelledAt = null;
        booking.cancelledReason = "";
        booking.adminNotes = `${booking.adminNotes ? booking.adminNotes + "\n" : ""}[Auto] Payment arrived after the payment window — booking reinstated.`;
      } else {
        lateAfterCancel = true;
        booking.adminNotes = `${booking.adminNotes ? booking.adminNotes + "\n" : ""}[ALERT] Payment ${paymentId} received AFTER cancellation — refund required.`;
      }
    }

    await booking.save();

    try {
      const emailService = require("../../utils/emailService");
      if (lateAfterCancel) {
        emailService.sendDecorationAdminAlert?.(booking, "Payment received on a CANCELLED booking — refund needed", `Payment ID ${paymentId}.`);
      } else {
        emailService.sendDecorationBookingNotification?.(booking).catch?.(() => { });
      }
    } catch (e) {
      console.warn("[email] decoration payment mail failed:", e.message);
    }
    return { booking, changed: true };
  }

  /**
   * Step 3: the customer's browser reports a finished payment. We re-check EVERYTHING on the server:
   * owner, the Razorpay order that WE created for this booking, signature, unused payment id, amount.
   */
  async verifyBookingPayment(userId, { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const crypto = require("crypto");
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Online payments are not configured on the server.");
    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Payment details are incomplete.");
    }

    const booking = await this._findOwned(userId, bookingId);

    if (!booking.razorpayOrderId || booking.razorpayOrderId !== String(razorpay_order_id)) {
      throw new Error("This payment does not belong to this booking.");
    }

    const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(String(razorpay_signature));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error("Payment signature verification failed.");
    }

    const reused = await DecorationBooking.exists({ razorpayPaymentId: razorpay_payment_id, _id: { $ne: booking._id } });
    if (reused) throw new Error("This payment has already been used for another booking.");

    const view = toCustomerView(booking);
    const expectedAmount = booking.paymentType === "Full Online" ? booking.totalAmount : booking.advanceAmount;
    const paymentService = require("../paymentService");
    const rzpOrder = await paymentService.fetchRazorpayOrder(razorpay_order_id);
    if (!rzpOrder || Number(rzpOrder.amount) < Math.round(Number(expectedAmount) * 100)) {
      throw new Error("Paid amount is lower than the booking amount.");
    }
    void view;

    const { booking: saved } = await this._applyPaid(booking, { paymentId: razorpay_payment_id, signature: razorpay_signature });
    return toCustomerView(saved);
  }

  /**
   * Razorpay webhook safety net: the customer paid but closed the app/tab before the verify call.
   * Returns the booking, or null when this Razorpay order isn't a decoration booking.
   */
  async markPaidByWebhook(razorpayOrderId, paymentId, amountPaise) {
    if (!razorpayOrderId || !paymentId) return null;
    const booking = await DecorationBooking.findOne({ razorpayOrderId: String(razorpayOrderId) });
    if (!booking) return null;

    const expectedAmount = booking.paymentType === "Full Online" ? booking.totalAmount : booking.advanceAmount;
    if (amountPaise !== undefined && Number(amountPaise) < Math.round(Number(expectedAmount) * 100)) {
      console.warn(`[decoration-webhook] amount too low for ${booking.bookingId}`);
      return booking;
    }
    const { booking: saved } = await this._applyPaid(booking, { paymentId: String(paymentId) });
    return saved;
  }

  /** Customer cancels their own booking (within the policy window). */
  async cancelMyBooking(userId, idOrCode, reason = "") {
    await optionsService.getSettings();
    const booking = await this._findOwned(userId, idOrCode);
    const view = toCustomerView(booking);

    if (booking.status === "Cancelled") throw new Error("This booking is already cancelled.");
    if (!view.canCancel) {
      throw new Error(
        `This booking can no longer be cancelled online (cancellation closes ${cfg.cancelHours()} hours before the setup). Please contact support on WhatsApp.`
      );
    }

    const wasPaid = booking.paymentStatus === "Paid" || booking.paymentStatus === "Advance Paid" || booking.downpaymentStatus === "Paid";
    booking.status = "Cancelled";
    booking.cancelledBy = "customer";
    booking.cancelledAt = new Date();
    booking.cancelledReason = String(reason || "Cancelled by customer").trim().slice(0, 300);
    booking.paymentDueBy = null;
    if (wasPaid) {
      booking.adminNotes = `${booking.adminNotes ? booking.adminNotes + "\n" : ""}[Customer cancelled] Paid booking — review refund as per policy.`;
    }
    await booking.save();

    try {
      const emailService = require("../../utils/emailService");
      emailService.sendDecorationAdminAlert?.(
        booking,
        wasPaid ? "Customer CANCELLED a PAID booking" : "Customer cancelled a booking",
        booking.cancelledReason
      );
      emailService.sendDecorationCustomerUpdate?.(
        booking,
        "Your decoration booking is cancelled",
        wasPaid
          ? "We have received your cancellation. Our team will contact you shortly about the refund as per our cancellation policy."
          : "Your booking has been cancelled. You have not been charged."
      );
    } catch (e) {
      console.warn("[email] decoration cancel mail failed:", e.message);
    }

    return toCustomerView(booking);
  }

  /** Releases online bookings whose payment window ran out. Called by a timer in server.js. */
  async expireUnpaidBookings() {
    const now = new Date();
    const res = await DecorationBooking.updateMany(
      {
        status: "Pending",
        paymentType: { $in: ONLINE_TYPES },
        paymentStatus: "Pending",
        downpaymentStatus: "Pending",
        paymentDueBy: { $ne: null, $lt: now },
      },
      {
        $set: {
          status: "Cancelled",
          cancelledBy: "system",
          cancelledAt: now,
          cancelledReason: "Payment was not completed in time",
          paymentDueBy: null,
        },
      }
    );
    return res?.modifiedCount ?? res?.nModified ?? 0;
  }

  /**
   * Record Remaining Balance Collected by Decorator on Site
   */
  async recordBalancePayment(bookingId, { balancePaymentMethod = "Cash on Setup", notes = "" }) {
    const booking = await DecorationBooking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    booking.balancePaymentStatus = "Collected by Decorator";
    booking.balancePaymentMethod = balancePaymentMethod;
    booking.balanceCollectedAt = new Date();
    booking.paymentStatus = "Paid";
    if (notes) {
      booking.adminNotes = (booking.adminNotes ? booking.adminNotes + "\n" : "") + `[Balance Collected] ${notes}`;
    }
    return await booking.save();
  }

  /**
   * Admin General Booking Update (Date, Room, Notes, etc.)
   */
  async updateBooking(bookingId, updateData) {
    const booking = await DecorationBooking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    const allowed = [
      "hotelName",
      "roomNumber",
      "bookingHolderName",
      "venueAddress",
      "setupDate",
      "setupTimeSlot",
      "surpriseEntryTime",
      "colorTheme",
      "customMessage",
      "specialInstructions",
      "adminNotes",
      "status",
      "decoratorPayout",
      "paymentStatus",
      "balancePaymentStatus",
    ];

    allowed.forEach((field) => {
      if (updateData[field] !== undefined) {
        booking[field] = updateData[field];
      }
    });

    return await booking.save();
  }
}

const decorationBookingService = new DecorationBookingService();

// exposed for unit tests / controllers
decorationBookingService.helpers = {
  generateBookingId,
  assertSetupWindow,
  setupStartMs,
  parseSlotStartMinutes,
  toCustomerView,
  cfg,
  STAFF_ROLES,
  ONLINE_TYPES,
};

module.exports = decorationBookingService;
