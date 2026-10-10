const router = require("express").Router();
const contactController = require("../controllers/websiteContactController");
const adminMiddleware = require("../middleware/adminMiddleware");

const contactManage = adminMiddleware.requireRole(
  ["super_admin", "admin", "support_agent"],
  ["/websitecontact"]
);

router.post("/contact", contactController.createContact);
router.get("/all-contacts", adminMiddleware, contactManage, contactController.getContacts);
router.delete("/delete-contact/:id", adminMiddleware, contactManage, contactController.deleteContact);

module.exports = router;
