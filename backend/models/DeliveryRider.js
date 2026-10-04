const mongoose = require("mongoose");

const deliveryRiderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    vehicle: {
      type: String,
      enum: ["Motorcycle", "Electric Scooter", "Delivery Van", "Bicycle"],
      default: "Motorcycle",
    },
    vehicleNumber: {
      type: String,
      default: "HR-51-AB-0000",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Available", "En Route", "Offline"],
      default: "Available",
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    currentZone: {
      type: String,
      default: "Sector 15, Faridabad",
    },
    activeOrders: {
      type: Number,
      default: 0,
    },
    totalDeliveriesCompleted: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

deliveryRiderSchema.index({ status: 1 });
deliveryRiderSchema.index({ phone: 1 });

module.exports = mongoose.model("DeliveryRider", deliveryRiderSchema);
