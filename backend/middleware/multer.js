// const multer = require("multer");

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// module.exports = upload;

// PATH: backend/middleware/multer.js
//
// Two upload profiles (files are kept in memory, so size/count limits matter):
//   • customer : images only, 5 MB, max 3 files   (profile photo, review photo, cake photo)
//   • staff    : images / video / pdf, 25 MB, max 10 files   (admin media library)
// Default export stays the staff uploader so existing `upload.single/any` calls keep working.

const multer = require("multer");

const storage = multer.memoryStorage();

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const STAFF_TYPES = [...IMAGE_TYPES, "image/svg+xml", "image/avif", "video/mp4", "video/webm", "application/pdf"];

const makeFilter = (allowed) => (req, file, cb) => {
    if (allowed.includes(String(file.mimetype || "").toLowerCase())) return cb(null, true);
    const err = new Error("This file type is not allowed.");
    err.code = "UNSUPPORTED_FILE_TYPE";
    return cb(err);
};

const staff = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024, files: 10 },
    fileFilter: makeFilter(STAFF_TYPES),
});

const customer = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 3 },
    fileFilter: makeFilter(IMAGE_TYPES),
});

staff.customer = customer;
staff.staff = staff;

module.exports = staff;
