const CustomerSupport = require("../models/CustomerSupport");
const Order = require("../models/Order");
const mongoose = require("mongoose");

/**
 * POST /api/support/contact
 * Public endpoint for customers to submit a support ticket
 */
exports.createTicket = async (req, res) => {
  try {
    const { name, email, mobileNumber, subject, orderId, message, priority } = req.body;

    if (!name || !email || !mobileNumber || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, mobile number, subject, and message are all required.",
      });
    }

    let linkedOrderId = undefined;
    if (orderId && orderId.trim()) {
      const cleanOrderId = orderId.trim();
      // Try to find matching order by ObjectId or orderId string
      if (mongoose.Types.ObjectId.isValid(cleanOrderId)) {
        const found = await Order.findById(cleanOrderId);
        if (found) linkedOrderId = found._id;
      }
      if (!linkedOrderId) {
        const foundByField = await Order.findOne({ orderId: cleanOrderId });
        if (foundByField) linkedOrderId = foundByField._id;
      }
    }

    const ticket = await CustomerSupport.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      subject: subject.trim(),
      orderId: orderId ? orderId.trim() : undefined,
      order: linkedOrderId,
      message: message.trim(),
      priority: priority && ["low", "medium", "high", "urgent"].includes(priority) ? priority : "medium",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Your support inquiry has been submitted successfully. Our team will contact you shortly!",
      data: ticket,
    });
  } catch (error) {
    console.error("Create Support Ticket Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit support inquiry",
      error: error.message,
    });
  }
};

/**
 * GET /api/support/tickets
 * Admin protected endpoint to list tickets with filters & pagination
 */
exports.getTickets = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const { search, status, priority, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const conditions = [];

    if (search && search.trim()) {
      const s = search.trim();
      conditions.push({
        $or: [
          { name: { $regex: s, $options: "i" } },
          { email: { $regex: s, $options: "i" } },
          { mobileNumber: { $regex: s, $options: "i" } },
          { subject: { $regex: s, $options: "i" } },
          { orderId: { $regex: s, $options: "i" } },
          { message: { $regex: s, $options: "i" } },
        ],
      });
    }

    if (status && status !== "all") {
      conditions.push({ status });
    }

    if (priority && priority !== "all") {
      conditions.push({ priority });
    }

    const query = conditions.length ? { $and: conditions } : {};

    const sortOption = {};
    sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [tickets, total, pendingCount, inProgressCount, resolvedCount] = await Promise.all([
      CustomerSupport.find(query)
        .populate("order", "orderId totalAmount status paymentStatus createdAt")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      CustomerSupport.countDocuments(query),
      CustomerSupport.countDocuments({ status: "pending" }),
      CustomerSupport.countDocuments({ status: "in_progress" }),
      CustomerSupport.countDocuments({ status: "resolved" }),
    ]);

    return res.status(200).json({
      success: true,
      data: tickets,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      counts: {
        total: await CustomerSupport.countDocuments(),
        pending: pendingCount,
        in_progress: inProgressCount,
        resolved: resolvedCount,
      },
    });
  } catch (error) {
    console.error("Get Support Tickets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve support tickets",
      error: error.message,
    });
  }
};

/**
 * GET /api/support/tickets/:id
 */
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await CustomerSupport.findById(req.params.id)
      .populate("order")
      .populate("repliedBy", "name email");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error("Get Ticket Details Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/support/tickets/:id/status
 */
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status, priority } = req.body;
    const updateFields = {};
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;

    const ticket = await CustomerSupport.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Update Ticket Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/support/tickets/:id/reply
 */
exports.replyTicket = async (req, res) => {
  try {
    const { adminReply, markResolved = true } = req.body;

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({ success: false, message: "Reply message cannot be empty" });
    }

    const updateData = {
      adminReply: adminReply.trim(),
      repliedAt: new Date(),
      repliedBy: req.user?.id,
    };

    if (markResolved) {
      updateData.status = "resolved";
    }

    const ticket = await CustomerSupport.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Reply sent and recorded successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Reply Ticket Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/support/tickets/:id
 */
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await CustomerSupport.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Support ticket deleted successfully",
    });
  } catch (error) {
    console.error("Delete Ticket Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/support/bulk-delete
 */
exports.bulkDeleteTickets = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required" });
    }

    await CustomerSupport.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} support tickets deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk Delete Tickets Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
