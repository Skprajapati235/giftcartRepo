const express = require("express");
const router = express.Router();
const controller = require("../controllers/addonController");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", controller.getAddons);
router.post("/", adminMiddleware, controller.createAddon);
router.put("/:id", adminMiddleware, controller.updateAddon);
router.delete("/:id", adminMiddleware, controller.deleteAddon);

module.exports = router;
