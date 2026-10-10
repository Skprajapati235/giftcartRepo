const DecorationBooking = require("../../models/DecorationBooking");
const DecorationPackage = require("../../models/DecorationPackage");
const PartnerStore = require("../../models/PartnerStore");
const { verifyActionToken } = require("../../utils/orderActionToken");

let logActivity;
try {
  logActivity = require("../../utils/auditLogger").logActivity;
} catch (e) {
  logActivity = async () => {};
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

// Generate unique booking id
const generateBookingId = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `DEC-${dateStr}-${randomSuffix}`;
};

/**
 * Service for Decoration Bookings & Live Customer Tracking
 */
class DecorationBookingService {
  /**
   * Create new customer decoration booking
   */
  async createBooking(data, userContext = {}) {
    const {
      packageId,
      venueType,
      hotelName,
      roomNumber,
      bookingHolderName,
      venueAddress,
      city,
      pincode,
      googleMapsUrl,
      setupDate,
      setupTimeSlot,
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
      paymentMethod,
      totalAmount,
    } = data;

    if (!packageId || !setupDate || !setupTimeSlot || !venueAddress || !customerName || !customerPhone) {
      throw new Error("Please fill in all required venue and contact fields.");
    }

    const pkg = await DecorationPackage.findById(packageId);
    if (!pkg) {
      throw new Error("Selected decoration package was not found.");
    }

    // SERVER-SIDE TAMPER PROOF PRICING:
    // Package price is strictly authoritative from the database.
    const packageOfficialPrice = Number(pkg.salePrice || pkg.price) || 0;

    let addonsTotal = 0;
    const validatedAddons = [];
    if (Array.isArray(addons)) {
      addons.forEach((item) => {
        const itemPrice = Math.max(0, Number(item.price) || 0);
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        addonsTotal += itemPrice * qty;
        validatedAddons.push({
          name: String(item.name || "Addon").trim(),
          price: itemPrice,
          quantity: qty,
        });
      });
    }

    const calculatedTotal = packageOfficialPrice + addonsTotal;
    const bookingId = generateBookingId();

    const booking = new DecorationBooking({
      bookingId,
      user: userContext.userId || null,
      package: pkg._id,
      packageTitle: pkg.title,
      packagePrice: packageOfficialPrice,
      packageImage: pkg.coverImage || (pkg.images && pkg.images[0]) || "",
      venueType: venueType || "Hotel Room",
      hotelName: (hotelName || "").trim(),
      roomNumber: (roomNumber || "").trim(),
      bookingHolderName: (bookingHolderName || "").trim(),
      venueAddress: venueAddress.trim(),
      city: city ? city.trim() : "Faridabad",
      pincode: (pincode || "").trim(),
      googleMapsUrl: (googleMapsUrl || "").trim(),
      setupDate,
      setupTimeSlot,
      surpriseEntryTime: (surpriseEntryTime || "").trim(),
      occasion: occasion || "Birthday",
      customMessage: (customMessage || "").trim(),
      colorTheme: colorTheme || "Red & Gold",
      specialInstructions: (specialInstructions || "").trim(),
      addons: validatedAddons,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerWhatsapp: (customerWhatsapp || customerPhone).trim(),
      customerEmail: (customerEmail || "").trim(),
      totalAmount: calculatedTotal,
      paymentMethod: paymentMethod || "Online",
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      status: "Confirmed",
    });

    const savedBooking = await booking.save();

    // Send Email Notification to Admin & Customer with 1-click status actions
    try {
      const emailService = require("../../utils/emailService");
      if (emailService.sendDecorationBookingNotification) {
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
  async trackBooking(bookingIdQuery, customerPhone) {
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
      throw new Error("No decoration booking found with ID: " + trimmed);
    }

    // Optional phone validation for customer security
    if (customerPhone && customerPhone.trim()) {
      const phoneDigits = customerPhone.replace(/\D/g, "");
      const bookingPhoneDigits = (booking.customerPhone || "").replace(/\D/g, "");
      if (bookingPhoneDigits && !bookingPhoneDigits.endsWith(phoneDigits.slice(-10))) {
        throw new Error("Phone number does not match this booking record.");
      }
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
      supportWhatsapp: process.env.SUPPORT_WHATSAPP || "918400787712",
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
}

module.exports = new DecorationBookingService();
