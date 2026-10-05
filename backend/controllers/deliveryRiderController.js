// const DeliveryRider = require("../models/DeliveryRider");
// const Order = require("../models/Order");
// const AuditLog = require("../models/AuditLog");

// exports.getAllRiders = async (req, res) => {
//   try {
//     let riders = await DeliveryRider.find().sort({ createdAt: -1 }).lean();

//     // If no riders exist yet, seed initial team
//     if (riders.length === 0) {
//       const initialRiders = [
//         {
//           name: "Amit Kumar",
//           phone: "9818012345",
//           vehicle: "Motorcycle",
//           vehicleNumber: "HR-51-AB-1234",
//           status: "Available",
//           rating: 4.9,
//           assignedOrders: 0,
//           currentZone: "Sector 14 - 17, Faridabad",
//         },
//         {
//           name: "Rajesh Singh",
//           phone: "9871123456",
//           vehicle: "Electric Scooter",
//           vehicleNumber: "HR-51-EF-5678",
//           status: "Available",
//           rating: 4.8,
//           assignedOrders: 0,
//           currentZone: "NIT 1 - 5, Faridabad",
//         },
//         {
//           name: "Sandeep Rawat",
//           phone: "9910987654",
//           vehicle: "Motorcycle",
//           vehicleNumber: "HR-51-KL-9012",
//           status: "Available",
//           rating: 5.0,
//           assignedOrders: 0,
//           currentZone: "Sector 21 - 28, Faridabad",
//         },
//         {
//           name: "Mohit Chauhan",
//           phone: "9811567890",
//           vehicle: "Delivery Van",
//           vehicleNumber: "HR-51-CD-3456",
//           status: "Offline",
//           rating: 4.7,
//           assignedOrders: 0,
//           currentZone: "Greater Faridabad (Neharpar)",
//         },
//       ];
//       await DeliveryRider.insertMany(initialRiders);
//       riders = await DeliveryRider.find().sort({ createdAt: -1 }).lean();
//     }

//     return res.status(200).json({ success: true, data: riders });
//   } catch (error) {
//     console.error("Get Riders Error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.createRider = async (req, res) => {
//   try {
//     const { name, phone, vehicle, vehicleNumber, currentZone } = req.body;
//     if (!name || !phone) {
//       return res.status(400).json({ success: false, message: "Rider name and phone are required" });
//     }

//     const rider = await DeliveryRider.create({
//       name,
//       phone,
//       vehicle: vehicle || "Motorcycle",
//       vehicleNumber: vehicleNumber || "HR-51-XX-0000",
//       currentZone: currentZone || "Sector 15, Faridabad",
//       status: "Available",
//     });

//     // Log action
//     await AuditLog.create({
//       adminId: req.user?._id || req.user?.id,
//       adminName: req.user?.name || "Admin",
//       adminEmail: req.user?.email || "admin@giftfestive.com",
//       adminRole: req.user?.role || "Super Admin",
//       action: "Registered Delivery Rider",
//       module: "Delivery Fleet",
//       details: `Added new rider ${name} (${vehicle} - ${vehicleNumber})`,
//       severity: "success",
//       ipAddress: req.ip || "127.0.0.1",
//     }).catch(() => {});

//     return res.status(201).json({ success: true, data: rider });
//   } catch (error) {
//     console.error("Create Rider Error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.assignRiderToOrder = async (req, res) => {
//   try {
//     const { orderId, riderId } = req.body;
//     if (!orderId || !riderId) {
//       return res.status(400).json({ success: false, message: "orderId and riderId are required" });
//     }

//     const rider = await DeliveryRider.findById(riderId);
//     if (!rider) {
//       return res.status(404).json({ success: false, message: "Rider not found" });
//     }

//     const order = await Order.findByIdAndUpdate(
//       orderId,
//       {
//         assignedRider: rider._id,
//         assignedRiderName: rider.name,
//         assignedRiderPhone: rider.phone,
//         riderAssignedAt: new Date(),
//         status: "In Kitchen", // or Ready for Dispatch
//       },
//       { new: true }
//     );

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     await DeliveryRider.findByIdAndUpdate(riderId, {
//       $inc: { activeOrders: 1 },
//       status: "En Route",
//     });

//     // Log action
//     await AuditLog.create({
//       adminId: req.user?._id || req.user?.id,
//       adminName: req.user?.name || "Admin",
//       adminEmail: req.user?.email || "admin@giftfestive.com",
//       adminRole: req.user?.role || "Super Admin",
//       action: "Assigned Delivery Rider",
//       module: "Delivery Fleet",
//       details: `Assigned Order #${order._id.toString().slice(-6).toUpperCase()} to rider ${rider.name}`,
//       severity: "info",
//       ipAddress: req.ip || "127.0.0.1",
//     }).catch(() => {});

//     return res.status(200).json({
//       success: true,
//       message: `Assigned order to ${rider.name}`,
//       data: { order, rider },
//     });
//   } catch (error) {
//     console.error("Assign Rider Error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.updateRiderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const rider = await DeliveryRider.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     return res.status(200).json({ success: true, data: rider });
//   } catch (error) {
//     console.error("Update Rider Status Error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };


const mongoose = require("mongoose");
const DeliveryRider = require("../models/DeliveryRider");
const Order = require("../models/Order");
const AuditLog = require("../models/AuditLog");
const orderService = require("../services/orderService");

const RIDER_STATUSES = ["Available", "En Route", "Offline"];
const CLOSED_ORDER_STATUSES = ["Delivered", "Cancelled"];

const logAction = (req, { action, details, severity = "info" }) =>
  AuditLog.create({
    adminId: req.user?._id || req.user?.id,
    adminName: req.user?.name || "Admin",
    adminEmail: req.user?.email || "admin@giftfestive.com",
    adminRole: req.user?.role || "Super Admin",
    action,
    module: "Delivery Fleet",
    details,
    severity,
    ipAddress: req.ip || "127.0.0.1",
  }).catch(() => {});

// Rider ke active orders ki real ginti Order collection se nikalte hain
// (counter drift na ho). Rider ko Offline nahi chhedte; baaki ka status
// active orders ke hisaab se Available / En Route set hota hai.
async function syncRiderLoad(riderId) {
  if (!riderId) return null;
  const activeOrders = await Order.countDocuments({
    assignedRider: riderId,
    status: { $nin: CLOSED_ORDER_STATUSES },
  });
  const rider = await DeliveryRider.findById(riderId);
  if (!rider) return null;
  rider.activeOrders = activeOrders;
  if (rider.status !== "Offline") {
    rider.status = activeOrders > 0 ? "En Route" : "Available";
  }
  await rider.save();
  return rider;
}

// GET /api/delivery-riders
exports.getAllRiders = async (req, res) => {
  try {
    const riders = await DeliveryRider.find().sort({ createdAt: -1 }).lean();

    // Live active-order count per rider
    const counts = await Order.aggregate([
      { $match: { assignedRider: { $ne: null }, status: { $nin: CLOSED_ORDER_STATUSES } } },
      { $group: { _id: "$assignedRider", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    riders.forEach((r) => {
      r.activeOrders = countMap.get(String(r._id)) || 0;
    });

    return res.status(200).json({ success: true, data: riders });
  } catch (error) {
    console.error("Get Riders Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/delivery-riders/dispatch-orders
// Fleet screen ke liye orders: cancelled / unpaid online orders nahi,
// aur Delivered sirf aaj ke.
exports.getDispatchOrders = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      status: { $ne: "Cancelled" },
      $and: [
        { $or: [{ paymentMethod: "COD" }, { paymentStatus: "Success" }] },
        {
          $or: [
            { status: { $ne: "Delivered" } },
            { deliveredAt: { $gte: startOfToday } },
          ],
        },
      ],
    })
      .populate("user", "name email mobileNumber")
      .sort("-createdAt")
      .limit(200)
      .lean();

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Get Dispatch Orders Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/delivery-riders
exports.createRider = async (req, res) => {
  try {
    const { name, phone, vehicle, vehicleNumber, currentZone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Rider name and phone are required" });
    }

    const rider = await DeliveryRider.create({
      name,
      phone,
      vehicle: vehicle || "Motorcycle",
      vehicleNumber: vehicleNumber || "HR-51-XX-0000",
      currentZone: currentZone || "Sector 15, Faridabad",
      status: "Available",
    });

    await logAction(req, {
      action: "Registered Delivery Rider",
      details: `Added new rider ${name} (${rider.vehicle} - ${rider.vehicleNumber})`,
      severity: "success",
    });

    return res.status(201).json({ success: true, data: rider });
  } catch (error) {
    console.error("Create Rider Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/delivery-riders/assign   { orderId, riderId }
exports.assignRiderToOrder = async (req, res) => {
  try {
    const { orderId, riderId } = req.body;
    if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(riderId)) {
      return res.status(400).json({ success: false, message: "Valid orderId and riderId are required" });
    }

    const rider = await DeliveryRider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: "Rider not found" });
    }
    if (rider.status === "Offline") {
      return res.status(400).json({
        success: false,
        message: `${rider.name} abhi Offline hai. Pehle rider ko Available karo, phir order assign karo.`,
      });
    }

    const existing = await Order.findById(orderId);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (CLOSED_ORDER_STATUSES.includes(existing.status)) {
      return res.status(400).json({ success: false, message: `${existing.status} order ko rider assign nahi ho sakta` });
    }

    const previousRiderId = existing.assignedRider ? String(existing.assignedRider) : null;

    // Sirf rider assign hota hai; order ka status yahan nahi badalta
    // (status Dispatch / Delivered action se badalta hai).
    existing.assignedRider = rider._id;
    existing.assignedRiderName = rider.name;
    existing.assignedRiderPhone = rider.phone;
    existing.riderAssignedAt = new Date();
    await existing.save();

    // Naye aur purane (reassign case) dono rider ka load sync karo
    const updatedRider = await syncRiderLoad(rider._id);
    if (previousRiderId && previousRiderId !== String(rider._id)) {
      await syncRiderLoad(previousRiderId);
    }

    await logAction(req, {
      action: "Assigned Delivery Rider",
      details: `Assigned Order #${existing._id.toString().slice(-6).toUpperCase()} to rider ${rider.name}`,
    });

    return res.status(200).json({
      success: true,
      message: `Assigned order to ${rider.name}`,
      data: { order: existing, rider: updatedRider },
    });
  } catch (error) {
    console.error("Assign Rider Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/delivery-riders/unassign   { orderId }
exports.unassignRider = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Valid orderId is required" });
    }
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const previousRiderId = order.assignedRider;
    order.assignedRider = null;
    order.assignedRiderName = null;
    order.assignedRiderPhone = null;
    order.riderAssignedAt = null;
    await order.save();

    if (previousRiderId) await syncRiderLoad(previousRiderId);

    return res.status(200).json({ success: true, message: "Rider removed from order" });
  } catch (error) {
    console.error("Unassign Rider Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/delivery-riders/dispatch   { orderId }  -> order "Out for Delivery"
exports.dispatchOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!order.assignedRider) {
      return res.status(400).json({ success: false, message: "Pehle rider assign karo, phir dispatch karo" });
    }

    await orderService.updateOrderStatus(orderId, "Out for Delivery");
    await syncRiderLoad(order.assignedRider);

    await logAction(req, {
      action: "Dispatched Order",
      details: `Order #${order._id.toString().slice(-6).toUpperCase()} out for delivery with ${order.assignedRiderName}`,
    });

    return res.status(200).json({ success: true, message: "Order marked Out for Delivery" });
  } catch (error) {
    console.error("Dispatch Order Error:", error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// PUT /api/delivery-riders/complete   { orderId } -> Delivered + rider free
exports.completeDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    await orderService.updateOrderStatus(orderId, "Delivered");

    await logAction(req, {
      action: "Order Delivered",
      details: `Order #${order._id.toString().slice(-6).toUpperCase()} delivered${order.assignedRiderName ? ` by ${order.assignedRiderName}` : ""}`,
      severity: "success",
    });

    return res.status(200).json({ success: true, message: "Order marked Delivered" });
  } catch (error) {
    console.error("Complete Delivery Error:", error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// PUT /api/delivery-riders/:id/status   { status: Available | En Route | Offline }
exports.updateRiderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!RIDER_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${RIDER_STATUSES.join(", ")}` });
    }

    const rider = await DeliveryRider.findById(id);
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    const activeOrders = await Order.countDocuments({
      assignedRider: id,
      status: { $nin: CLOSED_ORDER_STATUSES },
    });

    if (status === "Offline" && activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `${rider.name} ke paas ${activeOrders} active order hain. Pehle unhe deliver ya reassign karo, phir Offline karo.`,
      });
    }

    // Active orders wala rider "Available" nahi ho sakta; bina orders ke "En Route" nahi.
    rider.status = status === "Available" && activeOrders > 0 ? "En Route" : status === "En Route" && activeOrders === 0 ? "Available" : status;
    rider.activeOrders = activeOrders;
    await rider.save();

    await logAction(req, {
      action: "Updated Rider Status",
      details: `${rider.name} is now ${rider.status}`,
    });

    return res.status(200).json({ success: true, data: rider });
  } catch (error) {
    console.error("Update Rider Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.syncRiderLoad = syncRiderLoad;

