const DeliveryRider = require("../models/DeliveryRider");
const Order = require("../models/Order");
const AuditLog = require("../models/AuditLog");

exports.getAllRiders = async (req, res) => {
  try {
    let riders = await DeliveryRider.find().sort({ createdAt: -1 }).lean();

    // If no riders exist yet, seed initial team
    if (riders.length === 0) {
      const initialRiders = [
        {
          name: "Amit Kumar",
          phone: "9818012345",
          vehicle: "Motorcycle",
          vehicleNumber: "HR-51-AB-1234",
          status: "Available",
          rating: 4.9,
          assignedOrders: 0,
          currentZone: "Sector 14 - 17, Faridabad",
        },
        {
          name: "Rajesh Singh",
          phone: "9871123456",
          vehicle: "Electric Scooter",
          vehicleNumber: "HR-51-EF-5678",
          status: "Available",
          rating: 4.8,
          assignedOrders: 0,
          currentZone: "NIT 1 - 5, Faridabad",
        },
        {
          name: "Sandeep Rawat",
          phone: "9910987654",
          vehicle: "Motorcycle",
          vehicleNumber: "HR-51-KL-9012",
          status: "Available",
          rating: 5.0,
          assignedOrders: 0,
          currentZone: "Sector 21 - 28, Faridabad",
        },
        {
          name: "Mohit Chauhan",
          phone: "9811567890",
          vehicle: "Delivery Van",
          vehicleNumber: "HR-51-CD-3456",
          status: "Offline",
          rating: 4.7,
          assignedOrders: 0,
          currentZone: "Greater Faridabad (Neharpar)",
        },
      ];
      await DeliveryRider.insertMany(initialRiders);
      riders = await DeliveryRider.find().sort({ createdAt: -1 }).lean();
    }

    return res.status(200).json({ success: true, data: riders });
  } catch (error) {
    console.error("Get Riders Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

    // Log action
    await AuditLog.create({
      adminId: req.user?._id || req.user?.id,
      adminName: req.user?.name || "Admin",
      adminEmail: req.user?.email || "admin@giftfestive.com",
      adminRole: req.user?.role || "Super Admin",
      action: "Registered Delivery Rider",
      module: "Delivery Fleet",
      details: `Added new rider ${name} (${vehicle} - ${vehicleNumber})`,
      severity: "success",
      ipAddress: req.ip || "127.0.0.1",
    }).catch(() => {});

    return res.status(201).json({ success: true, data: rider });
  } catch (error) {
    console.error("Create Rider Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignRiderToOrder = async (req, res) => {
  try {
    const { orderId, riderId } = req.body;
    if (!orderId || !riderId) {
      return res.status(400).json({ success: false, message: "orderId and riderId are required" });
    }

    const rider = await DeliveryRider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: "Rider not found" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        assignedRider: rider._id,
        assignedRiderName: rider.name,
        assignedRiderPhone: rider.phone,
        riderAssignedAt: new Date(),
        status: "In Kitchen", // or Ready for Dispatch
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await DeliveryRider.findByIdAndUpdate(riderId, {
      $inc: { activeOrders: 1 },
      status: "En Route",
    });

    // Log action
    await AuditLog.create({
      adminId: req.user?._id || req.user?.id,
      adminName: req.user?.name || "Admin",
      adminEmail: req.user?.email || "admin@giftfestive.com",
      adminRole: req.user?.role || "Super Admin",
      action: "Assigned Delivery Rider",
      module: "Delivery Fleet",
      details: `Assigned Order #${order._id.toString().slice(-6).toUpperCase()} to rider ${rider.name}`,
      severity: "info",
      ipAddress: req.ip || "127.0.0.1",
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: `Assigned order to ${rider.name}`,
      data: { order, rider },
    });
  } catch (error) {
    console.error("Assign Rider Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRiderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const rider = await DeliveryRider.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return res.status(200).json({ success: true, data: rider });
  } catch (error) {
    console.error("Update Rider Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
