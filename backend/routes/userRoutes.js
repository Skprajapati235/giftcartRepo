const router = require("express").Router();
const controller = require("../controllers/userController");

router.get("/", controller.getAll);
router.get("/admins", controller.getAdmins);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
