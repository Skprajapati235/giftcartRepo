const router = require("express").Router();
const contactController = require("../controllers/websiteContactController")

router.post("/contact", contactController.createContact)

module.exports = router;
