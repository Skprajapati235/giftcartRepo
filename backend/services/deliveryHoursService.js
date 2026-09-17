const StoreSetting = require("../models/StoreSetting");

const toMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
};

const format12Hour = (timeStr) => {
  if (!timeStr) return "7:00 AM";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${mm} ${ampm}`;
};

/**
 * Get the current operating hours setting and evaluate if delivery is currently restricted
 */
exports.getDeliveryHoursStatus = async () => {
  let setting = await StoreSetting.findOne({ key: "delivery_hours" });

  if (!setting) {
    // Default setting: Restricted between 23:00 (11:00 PM) and 07:00 (07:00 AM)
    setting = await StoreSetting.create({
      key: "delivery_hours",
      isRestricted: false, // Default off until enabled by admin
      dailyStart: "23:00",
      dailyEnd: "07:00",
      customMessage: "Night delivery is currently paused. Available for delivery after 7:00 AM.",
      blockOrders: true,
      allowBrowsing: true,
    });
  }

  const { isRestricted, dailyStart, dailyEnd, customMessage, blockOrders, allowBrowsing } = setting;

  if (!isRestricted) {
    return {
      isRestricted: false,
      isCurrentlyRestricted: false,
      dailyStart,
      dailyEnd,
      nextAvailableTime: null,
      message: "Delivery is operating normally.",
      blockOrders: false,
      allowBrowsing: true,
    };
  }

  // Evaluate current local time in India/server time
  // Using Date to get hours and minutes
  const now = new Date();
  // If system is UTC, convert or use current local time
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const nowMinutes = currentHours * 60 + currentMinutes;

  const startMinutes = toMinutes(dailyStart);
  const endMinutes = toMinutes(dailyEnd);

  let isCurrentlyRestricted = false;

  if (startMinutes > endMinutes) {
    // Crosses midnight (e.g. 23:00 to 07:00)
    isCurrentlyRestricted = nowMinutes >= startMinutes || nowMinutes < endMinutes;
  } else {
    // Within same day (e.g. 14:00 to 18:00)
    isCurrentlyRestricted = nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }

  const formattedEnd = format12Hour(dailyEnd);
  let nextAvailableTime = `${formattedEnd}`;
  if (startMinutes > endMinutes && nowMinutes >= startMinutes) {
    nextAvailableTime = `Tomorrow at ${formattedEnd}`;
  } else {
    nextAvailableTime = `Today at ${formattedEnd}`;
  }

  return {
    isRestricted: true,
    isCurrentlyRestricted,
    dailyStart,
    dailyEnd,
    nextAvailableTime,
    formattedEnd,
    message: isCurrentlyRestricted
      ? (customMessage || `Night delivery is currently paused. Available for delivery after ${formattedEnd}.`)
      : "Delivery is operating normally.",
    blockOrders: isCurrentlyRestricted ? blockOrders : false,
    allowBrowsing,
  };
};

/**
 * Update delivery hours settings (Admin only)
 */
exports.updateDeliveryHours = async (payload, adminId) => {
  const { isRestricted, dailyStart, dailyEnd, customMessage, blockOrders, allowBrowsing } = payload;

  const updateFields = {
    updatedBy: adminId,
  };

  if (isRestricted !== undefined) updateFields.isRestricted = Boolean(isRestricted);
  if (dailyStart) updateFields.dailyStart = String(dailyStart).trim();
  if (dailyEnd) updateFields.dailyEnd = String(dailyEnd).trim();
  if (customMessage !== undefined) updateFields.customMessage = String(customMessage).trim();
  if (blockOrders !== undefined) updateFields.blockOrders = Boolean(blockOrders);
  if (allowBrowsing !== undefined) updateFields.allowBrowsing = Boolean(allowBrowsing);

  const updated = await StoreSetting.findOneAndUpdate(
    { key: "delivery_hours" },
    { $set: updateFields },
    { new: true, upsert: true }
  );

  return exports.getDeliveryHoursStatus();
};
