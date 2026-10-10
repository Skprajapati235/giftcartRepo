const DecorationSample = require("../../models/DecorationSample");

/**
 * Service for Customer Showcase Setup Photos & Gallery
 */
class DecorationSampleService {
  /**
   * Get all showcase samples
   */
  async getSamples({ storefrontOnly } = {}) {
    const query = {};
    if (storefrontOnly === "true" || storefrontOnly === true) {
      query.showOnStorefront = true;
    }

    return await DecorationSample.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get sample by ID
   */
  async getSampleById(id) {
    const sample = await DecorationSample.findById(id);
    if (!sample) {
      throw new Error("Showcase sample not found");
    }
    return sample;
  }

  /**
   * Create new sample photo
   */
  async createSample(data) {
    const {
      title,
      venueType,
      hotelOrLocation,
      city,
      occasion,
      imageUrl,
      beforeImageUrl,
      caption,
      tags,
      showOnStorefront,
    } = data;

    if (!title || !imageUrl) {
      throw new Error("Title and Image URL are required");
    }

    const sample = new DecorationSample({
      title: title.trim(),
      venueType: venueType || "Hotel Room",
      hotelOrLocation: (hotelOrLocation || "").trim(),
      city: (city || "Faridabad").trim(),
      occasion: occasion || "Birthday",
      imageUrl: imageUrl.trim(),
      beforeImageUrl: (beforeImageUrl || "").trim(),
      caption: (caption || "").trim(),
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [],
      showOnStorefront: showOnStorefront !== false,
    });

    return await sample.save();
  }

  /**
   * Update sample photo
   */
  async updateSample(id, data) {
    const sample = await DecorationSample.findByIdAndUpdate(id, data, { new: true });
    if (!sample) {
      throw new Error("Sample not found");
    }
    return sample;
  }

  /**
   * Delete sample photo
   */
  async deleteSample(id) {
    const sample = await DecorationSample.findByIdAndDelete(id);
    if (!sample) {
      throw new Error("Sample not found");
    }
    return true;
  }

  /**
   * Toggle storefront visibility
   */
  async toggleStorefront(id) {
    const sample = await DecorationSample.findById(id);
    if (!sample) {
      throw new Error("Sample not found");
    }
    sample.showOnStorefront = !sample.showOnStorefront;
    return await sample.save();
  }
}

module.exports = new DecorationSampleService();

