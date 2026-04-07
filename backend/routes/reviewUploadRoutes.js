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
        folder: "giftcart/review",
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

module.exports = router;
