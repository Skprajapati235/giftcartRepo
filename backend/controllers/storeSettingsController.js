const deliveryHoursService = require("../services/deliveryHoursService");

/**
 * GET /api/store-settings/delivery-hours
 * Public endpoint to fetch current delivery status and next delivery availability time
 */
exports.getDeliveryHours = async (req, res) => {
  try {
    const status = await deliveryHoursService.getDeliveryHoursStatus();
    return res.status(200).json({ success: true, data: status });
  } catch (error) {
    console.error("Get Delivery Hours Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/store-settings/delivery-hours
 * Admin endpoint to configure delivery hours
 */
exports.updateDeliveryHours = async (req, res) => {
  try {
    const updated = await deliveryHoursService.updateDeliveryHours(req.body, req.user?.id);
    return res.status(200).json({
      success: true,
      message: "Delivery operating hours updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Delivery Hours Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
