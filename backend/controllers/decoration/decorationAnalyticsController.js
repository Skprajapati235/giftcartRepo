const { decorationAnalyticsService } = require("../../services/decoration");

/**
 * Controller for Decoration Analytics & Commercials
 */
class DecorationAnalyticsController {
  // GET /api/decoration/analytics (Admin)
  async getDecorationAnalytics(req, res) {
    try {
      const data = await decorationAnalyticsService.getAnalytics();
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error fetching decoration analytics:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DecorationAnalyticsController();
