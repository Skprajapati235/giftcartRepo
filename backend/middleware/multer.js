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

const IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "image/pjpeg",
    "image/x-png",
    "image/svg+xml",
    "image/avif",
];
const VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-matroska",
    "video/x-msvideo",
    "video/avi",
    "video/3gpp",
];
const STAFF_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES, "application/pdf"];

const makeFilter = (allowed) => (req, file, cb) => {
    const mime = String(file.mimetype || "").toLowerCase();
    const ext = String(file.originalname || "").toLowerCase();

    // Direct MIME match
    if (allowed.includes(mime)) return cb(null, true);

    // Fallback if mimetype starts with image/ or video/
    if (mime.startsWith("image/") || mime.startsWith("video/")) return cb(null, true);
    if (/\.(jpe?g|png|webp|gif|svg|avif|heic|heif|pdf|mp4|webm|mov|mkv|avi|ogg|3gp)$/i.test(ext)) {
        return cb(null, true);
    }

    const err = new Error(`File type "${file.mimetype || ext}" is not allowed.`);
    err.code = "UNSUPPORTED_FILE_TYPE";
    return cb(err);
};

const staff = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024, files: 10 }, // 100MB limit for staff images & videos
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
