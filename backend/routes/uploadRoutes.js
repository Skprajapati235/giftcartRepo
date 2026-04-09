const router = require("express").Router();
const upload = require("../middleware/multer");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "giftcart",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ message: error.message });
        }
        res.json({ url: result.secure_url });
      }
    );

    Readable.from(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

// Delete image from Cloudinary
router.delete("/", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "No URL provided" });
    
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/.../upload/v123/giftcart/filename.ext
    const parts = url.split("/");
    const folderAndFile = parts.slice(parts.indexOf("giftcart")).join("/");
    const public_id = folderAndFile.replace(/\.[^.]+$/, ""); // remove extension
    
    await cloudinary.uploader.destroy(public_id);
    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed" });
  }
});

module.exports = router;
