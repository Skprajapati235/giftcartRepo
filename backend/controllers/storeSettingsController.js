const deliveryHoursService = require("../services/deliveryHoursService");
const StoreTheme = require("../models/StoreTheme");

const DEFAULT_THEME = {
  key: "storefront_theme",
  presetId: "festive-pink",
  presetName: "Festive Pink (Default)",
  primaryColor: "#D82B76",
  secondaryColor: "#FF6A3D",
  brandBerry: "#741343",
  brandGold: "#ffd166",
  brandCream: "#fffaf3",
  backgroundColor: "#ffffff",
  textColor: "#1a1a1a",
  fontFamily: "Inter",
  borderRadius: "16px",
  announcementBar: {
    enabled: true,
    text: "🎉 Flat 15% OFF on Midnight Cake Deliveries! Use Code FESTIVE15",
    bgColor: "#741343",
    textColor: "#ffffff",
    link: "/categories",
  },
  storeTagline: "Faridabad's Most Trusted Online Cake & Gift Destination",
  badgeText: "✨ 100% Fresh & Eggless Available",
};

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

/**
 * GET /api/store-settings/theme
 * Public endpoint to fetch storefront theme customization settings
 */
exports.getStoreTheme = async (req, res) => {
  try {
    let theme = await StoreTheme.findOne({ key: "storefront_theme" }).lean();
    if (!theme) {
      theme = DEFAULT_THEME;
    }
    return res.status(200).json({
      success: true,
      data: theme,
    });
  } catch (error) {
    console.error("Get Store Theme Error:", error);
    return res.status(200).json({
      success: true,
      data: DEFAULT_THEME,
      fallback: true,
    });
  }
};

/**
 * PUT /api/store-settings/theme
 * Admin endpoint to update storefront theme customization settings
 */
exports.updateStoreTheme = async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await StoreTheme.findOneAndUpdate(
      { key: "storefront_theme" },
      {
        $set: {
          presetId: payload.presetId || "custom",
          presetName: payload.presetName || "Custom Theme",
          primaryColor: payload.primaryColor || "#D82B76",
          secondaryColor: payload.secondaryColor || "#FF6A3D",
          brandBerry: payload.brandBerry || "#741343",
          brandGold: payload.brandGold || "#ffd166",
          brandCream: payload.brandCream || "#fffaf3",
          backgroundColor: payload.backgroundColor || "#ffffff",
          textColor: payload.textColor || "#1a1a1a",
          fontFamily: payload.fontFamily || "Inter",
          borderRadius: payload.borderRadius || "16px",
          announcementBar: {
            enabled: payload.announcementBar?.enabled ?? true,
            text: payload.announcementBar?.text || "🎉 Flat 15% OFF on Midnight Cake Deliveries! Use Code FESTIVE15",
            bgColor: payload.announcementBar?.bgColor || "#741343",
            textColor: payload.announcementBar?.textColor || "#ffffff",
            link: payload.announcementBar?.link || "/categories",
          },
          storeTagline: payload.storeTagline || "Faridabad's Most Trusted Online Cake & Gift Destination",
          badgeText: payload.badgeText || "✨ 100% Fresh & Eggless Available",
          updatedBy: req.user?.id || req.user?._id,
        },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Storefront theme published successfully!",
      data: updated,
    });
  } catch (error) {
    console.error("Update Store Theme Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
