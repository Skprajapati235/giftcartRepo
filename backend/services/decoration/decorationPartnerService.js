const DecorationPartner = require("../../models/DecorationPartner");

/**
 * Service for Dedicated Decorator Partner Stores (Faridabad Tie-ups)
 */
class DecorationPartnerService {
  /**
   * Get partners with filters
   */
  async getPartners({ city = "Faridabad", status } = {}) {
    const query = {};
    if (status && status !== "all") query.status = status;
    if (city && city !== "all") query.city = { $regex: city, $options: "i" };

    return await DecorationPartner.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get partner by ID
   */
  async getPartnerById(id) {
    const partner = await DecorationPartner.findById(id);
    if (!partner) {
      throw new Error("Decorator partner not found");
    }
    return partner;
  }

  /**
   * Create new decorator partner
   */
  async createPartner(data) {
    const {
      name,
      ownerName,
      phone,
      whatsapp,
      city = "Faridabad",
      coveredAreas,
      address,
      commissionPercentage,
      status,
      notes,
    } = data;

    if (!name || !ownerName || !phone || !whatsapp) {
      throw new Error("Firm Name, Owner Name, Calling Phone, and WhatsApp are required.");
    }

    const partner = new DecorationPartner({
      name: name.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      city: city ? city.trim() : "Faridabad",
      coveredAreas: Array.isArray(coveredAreas)
        ? coveredAreas
        : typeof coveredAreas === "string"
        ? coveredAreas.split(",").map((a) => a.trim())
        : ["NIT Faridabad", "Sector 15 & 16"],
      address: (address || "").trim(),
      commissionPercentage: Number(commissionPercentage) || 20,
      status: status || "active",
      notes: (notes || "").trim(),
    });

    return await partner.save();
  }

  /**
   * Update partner
   */
  async updatePartner(id, data) {
    const partner = await DecorationPartner.findByIdAndUpdate(id, data, { new: true });
    if (!partner) {
      throw new Error("Decorator partner not found");
    }
    return partner;
  }

  /**
   * Delete partner
   */
  async deletePartner(id) {
    const partner = await DecorationPartner.findByIdAndDelete(id);
    if (!partner) {
      throw new Error("Decorator partner not found");
    }
    return true;
  }
}

module.exports = new DecorationPartnerService();

