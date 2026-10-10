const mongoose = require("mongoose");

const decorationBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for guest checkouts
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DecorationPackage",
      required: true,
    },
    packageTitle: {
      type: String,
      required: true,
    },
    packagePrice: {
      type: Number,
      required: true,
    },
    packageImage: {
      type: String,
      default: "",
    },
    // ==========================================
    // VENUE & HOTEL SPECIFIC CUSTOMIZATIONS
    // ==========================================
    venueType: {
      type: String,
      enum: ["Hotel Room", "Home", "Cafe / Restaurant", "Banquet Hall / Terrace", "Other Venue"],
      default: "Hotel Room",
    },
    hotelName: {
      type: String,
      default: "",
      trim: true,
    },
    roomNumber: {
      type: String,
      default: "",
      trim: true,
    },
    bookingHolderName: {
      type: String,
      default: "",
      trim: true,
    },
    venueAddress: {
      type: String,
      required: [true, "Full address or hotel address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
    },
    googleMapsUrl: {
      type: String,
      default: "",
      trim: true,
    },
    // ==========================================
    // SCHEDULE & SURPRISE TIMINGS
    // ==========================================
    setupDate: {
      type: String,
      required: [true, "Event/Setup date is required"],
    },
    setupTimeSlot: {
      type: String,
      required: [true, "Setup time slot is required (e.g. 4:00 PM - 6:00 PM)"],
    },
    surpriseEntryTime: {
      type: String,
      default: "",
      trim: true,
    },
    // ==========================================
    // PERSONALIZATION & OCCASION
    // ==========================================
    occasion: {
      type: String,
      default: "Birthday",
    },
    customMessage: {
      type: String,
      default: "", // Text on wall balloons / foils
      trim: true,
    },
    colorTheme: {
      type: String,
      default: "Red & Gold",
    },
    specialInstructions: {
      type: String,
      default: "",
      trim: true,
    },
    // Optional Addons (e.g., Cake 1kg, Champagne cider, Flower Bouquet)
    addons: [
      {
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number, default: 1 },
      },
    ],
    // ==========================================
    // CUSTOMER CONTACT
    // ==========================================
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Calling phone is required"],
      trim: true,
    },
    customerWhatsapp: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },
    // ==========================================
    // FULFILLMENT & TIE-UP DECORATOR PARTNER
    // ==========================================
    assignedPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartnerStore",
      default: null,
    },
    assignedPartnerName: {
      type: String,
      default: null,
    },
    assignedPartnerPhone: {
      type: String,
      default: null,
    },
    decoratorPayout: {
      type: Number,
      default: 0,
    },
    // Status Pipeline
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Decorator Assigned",
        "In Setup",
        "Decorated & Ready",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
    // Commercials & Real Business Downpayment
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["Advance Downpayment", "Full Online", "Full COD"],
      default: "Advance Downpayment",
    },
    paymentMethod: {
      type: String,
      enum: ["Online", "COD", "UPI", "Card"],
      default: "Online",
    },
    advanceAmount: {
      type: Number,
      default: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Advance Paid", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    downpaymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },
    balancePaymentStatus: {
      type: String,
      enum: ["Pending", "Collected by Decorator", "Waived"],
      default: "Pending",
    },
    balancePaymentMethod: {
      type: String,
      enum: ["Cash on Setup", "UPI to Decorator", "Unpaid"],
      default: "Unpaid",
    },
    balanceCollectedAt: {
      type: Date,
      default: null,
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },
    cancelledReason: {
      type: String,
      default: "",
    },
    setupProofImages: {
      type: [String],
      default: [],
    },
    adminNotes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

decorationBookingSchema.index({ setupDate: 1, city: 1, status: 1 });
decorationBookingSchema.index({ customerPhone: 1 });

module.exports = mongoose.model("DecorationBooking", decorationBookingSchema);
