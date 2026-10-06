const router = require("express").Router();
const controller = require("../controllers/userController");
const adminMiddleware = require("../middleware/adminMiddleware");

const superAdminOnly = adminMiddleware.requireRole(["super_admin", "admin"]);

router.get("/", superAdminOnly, controller.getAll);
router.get("/admins", superAdminOnly, controller.getAdmins);
router.put("/:id", superAdminOnly, controller.update);
router.delete("/:id", superAdminOnly, controller.delete);

module.exports = router;
