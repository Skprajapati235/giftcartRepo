const express = require("express");
const router = express.Router();
const controller = require("../controllers/addonCategoryController");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", adminMiddleware, controller.getAll);
router.post("/", adminMiddleware, controller.create);
router.put("/:id", adminMiddleware, controller.update);
router.delete("/:id", adminMiddleware, controller.remove);

module.exports = router;
