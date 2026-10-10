const { decorationPackageService } = require("../../services/decoration");

let logActivity;
try {
  logActivity = require("../../utils/auditLogger").logActivity;
} catch (e) {
  logActivity = async () => {};
}

/**
 * Controller for Decoration Packages (Catalog)
 */
class DecorationPackageController {
  // GET /api/decoration/packages
  async getPackages(req, res) {
    try {
      const result = await decorationPackageService.getPackages(req.query);
      res.json({
        success: true,
        data: result.packages,
        packages: result.packages,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/decoration/packages/:slug
  async getPackageBySlug(req, res) {
    try {
      const pkg = await decorationPackageService.getPackageBySlugOrId(req.params.slug);
      res.json({ success: true, package: pkg, data: pkg });
    } catch (error) {
      console.error("Error fetching package by slug:", error);
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // POST /api/decoration/packages (Admin)
  async createPackage(req, res) {
    try {
      const saved = await decorationPackageService.createPackage(req.body);

      if (logActivity) {
        await logActivity({
          req,
          action: "Created Decoration Package",
          module: "Decorations",
          details: `Created new package "${saved.title}".`,
          severity: "info",
        });
      }

      res.status(201).json({
        success: true,
        message: "Package created successfully",
        package: saved,
        data: saved,
      });
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // PUT /api/decoration/packages/:id (Admin)
  async updatePackage(req, res) {
    try {
      const updated = await decorationPackageService.updatePackage(req.params.id, req.body);
      res.json({
        success: true,
        message: "Package updated successfully",
        package: updated,
        data: updated,
      });
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/decoration/packages/:id (Admin)
  async deletePackage(req, res) {
    try {
      await decorationPackageService.deletePackage(req.params.id);
      res.json({ success: true, message: "Package deleted successfully" });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DecorationPackageController();
