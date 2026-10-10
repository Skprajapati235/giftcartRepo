const { decorationSampleService } = require("../../services/decoration");

/**
 * Controller for Customer Showcase Real Setup Photos
 */
class DecorationSampleController {
  // GET /api/decoration/samples
  async getSamples(req, res) {
    try {
      const samples = await decorationSampleService.getSamples(req.query);
      res.json({ success: true, samples, data: samples });
    } catch (err) {
      console.error("Error fetching decoration samples:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/decoration/samples/:id
  async getSampleById(req, res) {
    try {
      const sample = await decorationSampleService.getSampleById(req.params.id);
      res.json({ success: true, sample, data: sample });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  // POST /api/decoration/samples (Admin)
  async createSample(req, res) {
    try {
      const saved = await decorationSampleService.createSample(req.body);
      res.status(201).json({ success: true, sample: saved, data: saved });
    } catch (err) {
      console.error("Error creating sample:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // PUT /api/decoration/samples/:id (Admin)
  async updateSample(req, res) {
    try {
      const updated = await decorationSampleService.updateSample(req.params.id, req.body);
      res.json({ success: true, sample: updated, data: updated });
    } catch (err) {
      console.error("Error updating sample:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // DELETE /api/decoration/samples/:id (Admin)
  async deleteSample(req, res) {
    try {
      await decorationSampleService.deleteSample(req.params.id);
      res.json({ success: true, message: "Sample removed successfully" });
    } catch (err) {
      console.error("Error deleting sample:", err);
      res.status(404).json({ success: false, message: err.message });
    }
  }

  // PATCH /api/decoration/samples/:id/toggle (Admin)
  async toggleSampleStorefront(req, res) {
    try {
      const sample = await decorationSampleService.toggleStorefront(req.params.id);
      res.json({ success: true, sample, data: sample });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new DecorationSampleController();
