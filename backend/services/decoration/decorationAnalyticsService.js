const DecorationBooking = require("../../models/DecorationBooking");

/**
 * Service for Decoration Analytics & Commercial Ledger Metrics
 */
class DecorationAnalyticsService {
  /**
   * Calculate live analytics, revenue, payouts, net margin and order status counts
   */
  async getAnalytics() {
    const allBookings = await DecorationBooking.find({});

    let totalRevenue = 0;
    let totalPayouts = 0;
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      "Decorator Assigned": 0,
      "In Setup": 0,
      "Decorated & Ready": 0,
      Completed: 0,
      Cancelled: 0,
    };
    const venueCounts = {};
    const cityCounts = {};

    const todayStr = new Date().toISOString().slice(0, 10);
    let todayCount = 0;

    allBookings.forEach((b) => {
      if (b.status !== "Cancelled") {
        totalRevenue += Number(b.totalAmount || 0);
        totalPayouts += Number(b.decoratorPayout || 0);
      }
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      venueCounts[b.venueType] = (venueCounts[b.venueType] || 0) + 1;
      const c = b.city || "Other";
      cityCounts[c] = (cityCounts[c] || 0) + 1;
      if (b.setupDate === todayStr) {
        todayCount++;
      }
    });

    const netProfit = totalRevenue - totalPayouts;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    // Upcoming setups for the next 7 days
    const upcoming = await DecorationBooking.find({
      setupDate: { $gte: todayStr },
      status: { $nin: ["Completed", "Cancelled"] },
    })
      .sort({ setupDate: 1 })
      .limit(10);

    // Recent 10 bookings
    const recent = await DecorationBooking.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("assignedPartner", "name ownerFirstName ownerPhone whatsappNumber");

    return {
      totalBookings: allBookings.length,
      totalRevenue,
      totalPayouts,
      netProfit,
      profitMargin,
      todayCount,
      statusCounts,
      venueCounts,
      cityCounts,
      upcomingSetups: upcoming,
      recentBookings: recent,
    };
  }
}

module.exports = new DecorationAnalyticsService();
