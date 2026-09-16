const router = require("express").Router();
const upload = require("../middleware/multer");
const cloudinary = require("../config/cloudinary");
const Media = require("../models/Media");
const MediaFolder = require("../models/MediaFolder");
const { Readable } = require("stream");

// Helper to stream upload buffer to Cloudinary
const uploadStreamToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: "giftcart",
      resource_type: "auto",
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(defaultOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    Readable.from(buffer).pipe(stream);
  });
};

// Helper to robustly extract Cloudinary public_id
const extractPublicId = (urlOrId) => {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  if (!urlOrId.startsWith("http://") && !urlOrId.startsWith("https://")) {
    return urlOrId.trim();
  }

  try {
    const urlObj = new URL(urlOrId);
    const pathname = urlObj.pathname;
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let pathAfterUpload = pathname.substring(uploadIndex + 8);
    const parts = pathAfterUpload.split("/");

    // Look for version string like v1234567890
    const versionIdx = parts.findIndex((p) => /^v\d+$/.test(p));
    let relevantParts = versionIdx !== -1 ? parts.slice(versionIdx + 1) : parts;

    // Join and strip file extension
    const fullPath = relevantParts.join("/");
    return fullPath.replace(/\.[^/.]+$/, "");
  } catch (e) {
    return null;
  }
};

// ============================
// FOLDER MANAGEMENT ROUTES
// ============================

// GET /api/upload/folders - Get all folders
router.get("/folders", async (req, res) => {
  try {
    const folders = await MediaFolder.find().sort({ createdAt: -1 });
    res.json({ success: true, folders });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch folders" });
  }
});

// POST /api/upload/folders - Create new folder
router.post("/folders", async (req, res) => {
  try {
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }
    const folder = await MediaFolder.create({ name: req.body.name.trim() });
    res.status(201).json({ success: true, folder });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A folder with this name already exists" });
    }
    res.status(500).json({ message: err.message || "Failed to create folder" });
  }
});

// PUT /api/upload/folders/:id - Rename folder
router.put("/folders/:id", async (req, res) => {
  try {
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }
    const folder = await MediaFolder.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name.trim() },
      { new: true }
    );
    if (!folder) return res.status(404).json({ message: "Folder not found" });
    res.json({ success: true, folder });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update folder" });
  }
});

// DELETE /api/upload/folders/:id - Delete folder
router.delete("/folders/:id", async (req, res) => {
  try {
    const folder = await MediaFolder.findById(req.params.id);
    if (!folder) return res.status(404).json({ message: "Folder not found" });
    
    await MediaFolder.findByIdAndDelete(req.params.id);
    
    // Move all associated images to root (uncategorized)
    await Media.updateMany({ folderId: req.params.id }, { $set: { folderId: null } });

    res.json({ success: true, message: "Folder deleted successfully. Images moved to root." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete folder" });
  }
});

// ============================
// MEDIA MANAGEMENT ROUTES
// ============================


// GET /api/upload - List all media with pagination and search
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
    const search = req.query.search ? String(req.query.search).trim() : "";
    const folderId = req.query.folderId;

    const query = {};
    if (folderId) {
      query.folderId = folderId === "null" ? null : folderId;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const total = await Media.countDocuments(query);
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      media,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch media" });
  }
});

// POST /api/upload - Upload single or multiple files
router.post("/", upload.any(), async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedMedia = [];

    for (const file of files) {
      if (!file.buffer) continue;

      const result = await uploadStreamToCloudinary(file.buffer);

      const name =
        req.body.name ||
        file.originalname
          ? file.originalname.replace(/\.[^/.]+$/, "")
          : "Image-" + Date.now();

      const mediaDoc = await Media.create({
        url: result.secure_url,
        public_id: result.public_id,
        name: name,
        format: result.format || "",
        size: result.bytes || file.size || 0,
        width: result.width || 0,
        height: result.height || 0,
        folder: "giftcart",
        folderId: req.body.folderId && req.body.folderId !== "null" ? req.body.folderId : null,
      });

      uploadedMedia.push(mediaDoc);
    }

    if (uploadedMedia.length === 0) {
      return res.status(400).json({ message: "File processing failed" });
    }

    // Keep backwards compatibility with existing frontend expects { url: ... }
    const first = uploadedMedia[0];
    res.status(201).json({
      success: true,
      url: first.url,
      public_id: first.public_id,
      media: first,
      files: uploadedMedia,
      count: uploadedMedia.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

// PUT /api/upload/:id - Edit / Replace existing media
// Automatically deletes the old Cloudinary image when a new file is uploaded
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // If new file provided, replace image and delete old one
    if (req.file && req.file.buffer) {
      const oldPublicId = media.public_id;

      // Upload new file to Cloudinary first
      const newResult = await uploadStreamToCloudinary(req.file.buffer);

      // Successfully uploaded new image -> safely destroy the old image on Cloudinary
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (delErr) {
          console.error("Failed to delete old image from Cloudinary:", delErr.message);
        }
      }

      media.url = newResult.secure_url;
      media.public_id = newResult.public_id;
      media.format = newResult.format || "";
      media.size = newResult.bytes || req.file.size || 0;
      media.width = newResult.width || 0;
      media.height = newResult.height || 0;

      if (req.body.name) {
        media.name = req.body.name.trim();
      } else if (req.file.originalname) {
        media.name = req.file.originalname.replace(/\.[^/.]+$/, "");
      }
    } else if (req.body.name) {
      media.name = req.body.name.trim();
    }

    await media.save();

    res.json({
      success: true,
      message: "Media updated successfully. Old image deleted.",
      media,
      url: media.url,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
});

// DELETE /api/upload/:id - Delete media item by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    if (media.public_id) {
      try {
        await cloudinary.uploader.destroy(media.public_id);
      } catch (delErr) {
        console.error("Cloudinary delete error:", delErr.message);
      }
    }

    await Media.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Media deleted successfully",
      deletedId: id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed" });
  }
});

// DELETE /api/upload - Legacy delete by URL or public_id
router.delete("/", async (req, res) => {
  try {
    const { url, public_id } = req.body;
    const targetId = public_id || extractPublicId(url);

    if (!targetId) {
      return res.status(400).json({ message: "No URL or public_id provided" });
    }

    try {
      await cloudinary.uploader.destroy(targetId);
    } catch (delErr) {
      console.error("Cloudinary destroy error:", delErr.message);
    }

    // Also remove from MongoDB if exists
    await Media.deleteMany({
      $or: [{ public_id: targetId }, { url: url }],
    });

    res.json({ success: true, message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed" });
  }
});

// POST /api/upload/sync - Sync existing Cloudinary assets in "giftcart" folder to MongoDB
router.post("/sync", async (req, res) => {
  try {
    // Cloudinary Admin API to list resources with prefix 'giftcart/'
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "giftcart",
      max_results: 100,
    });

    let importedCount = 0;
    for (const resource of result.resources || []) {
      const exists = await Media.findOne({ public_id: resource.public_id });
      if (!exists) {
        const parts = resource.public_id.split("/");
        const baseName = parts[parts.length - 1];

        await Media.create({
          url: resource.secure_url,
          public_id: resource.public_id,
          name: baseName,
          format: resource.format || "",
          size: resource.bytes || 0,
          width: resource.width || 0,
          height: resource.height || 0,
          folder: "giftcart",
          createdAt: resource.created_at ? new Date(resource.created_at) : new Date(),
        });
        importedCount++;
      }
    }

    res.json({
      success: true,
      message: `Sync completed. Imported ${importedCount} images from Cloudinary.`,
      importedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Sync failed" });
  }
});

module.exports = router;
