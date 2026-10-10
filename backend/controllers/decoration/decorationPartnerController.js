const { decorationPartnerService } = require("../../services/decoration");

/**
 * Controller for Dedicated Faridabad Decorator Partners
 */
class DecorationPartnerController {
  // GET /api/decoration/partners
  async getDecoratorPartners(req, res) {
    try {
      const partners = await decorationPartnerService.getPartners(req.query);
      res.json({
        success: true,
        data: partners,
        partners,
      });
    } catch (error) {
      console.error("Error fetching decorator partners:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/decoration/partners/:id
  async getDecoratorPartnerById(req, res) {
    try {
      const partner = await decorationPartnerService.getPartnerById(req.params.id);
      res.json({ success: true, partner, data: partner });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // POST /api/decoration/partners (Admin)
  async createDecoratorPartner(req, res) {
    try {
      const saved = await decorationPartnerService.createPartner(req.body);
      res.status(201).json({ success: true, partner: saved, data: saved });
    } catch (error) {
      console.error("Error creating decorator partner:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // PUT /api/decoration/partners/:id (Admin)
  async updateDecoratorPartner(req, res) {
    try {
      const updated = await decorationPartnerService.updatePartner(req.params.id, req.body);
      res.json({ success: true, partner: updated, data: updated });
    } catch (error) {
      console.error("Error updating decorator partner:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/decoration/partners/:id (Admin)
  async deleteDecoratorPartner(req, res) {
    try {
      await decorationPartnerService.deletePartner(req.params.id);
      res.json({ success: true, message: "Decorator partner deleted successfully" });
    } catch (error) {
      console.error("Error deleting decorator partner:", error);
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DecorationPartnerController();
