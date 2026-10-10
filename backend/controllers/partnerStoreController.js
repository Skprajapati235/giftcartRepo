const PartnerStore = require("../models/PartnerStore");
let logActivity;
try {
  logActivity = require("../utils/auditLogger").logActivity;
} catch (e) {
  logActivity = async () => {};
}

// @desc    Get all partner stores with search, filter & pagination
// @route   GET /api/stores
// @access  Public or Admin
exports.getAllStores = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, city } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { ownerFirstName: { $regex: s, $options: "i" } },
        { ownerLastName: { $regex: s, $options: "i" } },
        { ownerPhone: { $regex: s, $options: "i" } },
        { whatsappNumber: { $regex: s, $options: "i" } },
        { city: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (city && city !== "all") {
      query.city = { $regex: `^${city.trim()}$`, $options: "i" };
    }

    const stores = await PartnerStore.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await PartnerStore.countDocuments(query);

    // Also get quick stats (total active, total cities)
    const activeCount = await PartnerStore.countDocuments({ status: "active" });
    const distinctCities = await PartnerStore.distinct("city", { city: { $ne: "" } });

    res.json({
      success: true,
      data: stores,
      stores,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      stats: {
        totalStores: total,
        activeStores: activeCount,
        totalCities: distinctCities.length,
        cities: distinctCities,
      },
    });
  } catch (error) {
    console.error("Error fetching partner stores:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single partner store by ID
// @route   GET /api/stores/:id
// @access  Public or Admin
exports.getStoreById = async (req, res) => {
  try {
    const store = await PartnerStore.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: "Partner store not found" });
    }
    res.json({ success: true, store, data: store });
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new partner store
// @route   POST /api/stores
// @access  Admin
exports.createStore = async (req, res) => {
  try {
    const {
      name,
      image,
      ownerFirstName,
      ownerLastName,
      ownerPhone,
      whatsappNumber,
      address,
      city,
      state,
      pincode,
      googleMapsUrl,
      description,
      categories,
      commissionPercentage,
      status,
      notes,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Store name is required" });
    }
    if (!ownerFirstName || !ownerFirstName.trim()) {
      return res.status(400).json({ success: false, message: "Owner first name is required" });
    }
    if (!ownerPhone || !ownerPhone.trim()) {
      return res.status(400).json({ success: false, message: "Owner phone number is required" });
    }
    if (!whatsappNumber || !whatsappNumber.trim()) {
      return res.status(400).json({ success: false, message: "WhatsApp number is required" });
    }

    const store = new PartnerStore({
      name: name.trim(),
      image: image || "",
      ownerFirstName: ownerFirstName.trim(),
      ownerLastName: (ownerLastName || "").trim(),
      ownerPhone: ownerPhone.trim(),
      whatsappNumber: whatsappNumber.trim(),
      address: (address || "").trim(),
      city: (city || "").trim(),
      state: (state || "").trim(),
      pincode: (pincode || "").trim(),
      googleMapsUrl: (googleMapsUrl || "").trim(),
      description: (description || "").trim(),
      categories: Array.isArray(categories) ? categories : [],
      commissionPercentage: Number(commissionPercentage) || 0,
      status: status || "active",
      notes: (notes || "").trim(),
      createdBy: req.admin?._id || req.user?._id,
    });

    const savedStore = await store.save();

    if (logActivity) {
      await logActivity({
        req,
        action: "Created Partner Store",
        module: "Tie-Up Partners",
        details: `Added new partner store "${savedStore.name}" (${savedStore.city || "No City"}).`,
        severity: "info",
        metadata: { storeId: savedStore._id, name: savedStore.name },
      });
    }

    res.status(201).json({
      success: true,
      message: "Partner store created successfully",
      store: savedStore,
      data: savedStore,
    });
  } catch (error) {
    console.error("Error creating partner store:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update partner store
// @route   PUT /api/stores/:id
// @access  Admin
exports.updateStore = async (req, res) => {
  try {
    const store = await PartnerStore.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: "Partner store not found" });
    }

    const updates = req.body;
    const allowedFields = [
      "name",
      "image",
      "ownerFirstName",
      "ownerLastName",
      "ownerPhone",
      "whatsappNumber",
      "address",
      "city",
      "state",
      "pincode",
      "googleMapsUrl",
      "description",
      "categories",
      "commissionPercentage",
      "status",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        store[field] = updates[field];
      }
    });

    const updatedStore = await store.save();

    if (logActivity) {
      await logActivity({
        req,
        action: "Updated Partner Store",
        module: "Tie-Up Partners",
        details: `Updated partner store "${updatedStore.name}".`,
        severity: "info",
        metadata: { storeId: updatedStore._id, name: updatedStore.name },
      });
    }

    res.json({
      success: true,
      message: "Partner store updated successfully",
      store: updatedStore,
      data: updatedStore,
    });
  } catch (error) {
    console.error("Error updating partner store:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete partner store
// @route   DELETE /api/stores/:id
// @access  Admin
exports.deleteStore = async (req, res) => {
  try {
    const store = await PartnerStore.findByIdAndDelete(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: "Partner store not found" });
    }

    if (logActivity) {
      await logActivity({
        req,
        action: "Deleted Partner Store",
        module: "Tie-Up Partners",
        details: `Removed partner store "${store.name}".`,
        severity: "warning",
        metadata: { storeId: store._id, name: store.name },
      });
    }

    res.json({
      success: true,
      message: "Partner store deleted successfully",
      store,
    });
  } catch (error) {
    console.error("Error deleting partner store:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick toggle active/inactive status
// @route   PATCH /api/stores/:id/toggle-status
// @access  Admin
exports.toggleStoreStatus = async (req, res) => {
  try {
    const store = await PartnerStore.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: "Partner store not found" });
    }

    store.status = store.status === "active" ? "inactive" : "active";
    await store.save();

    res.json({
      success: true,
      message: `Store marked as ${store.status}`,
      store,
      data: store,
    });
  } catch (error) {
    console.error("Error toggling store status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
