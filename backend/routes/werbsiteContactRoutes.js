const router = require("express").Router();
const contactController = require("../controllers/websiteContactController")

router.post("/contact", contactController.createContact);
router.get("/all-contacts", contactController.getContacts);
router.delete("/delete-contact/:id", contactController.deleteContact);

module.exports = router;
