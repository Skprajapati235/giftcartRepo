const contactService = require("../services/websiteContectService");

const contactController = {
    createContact: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required",
                });
            }

            const contact = await contactService.createContact(email);

            return res.status(201).json({
                success: true,
                message: "Email submitted successfully",
                data: contact,
            });
        } catch (error) {
            console.error("Create Contact Error:", error);

            return res.status(500).json({
                success: false,
                message: "Something went wrong",
                error: error.message,
            });
        }
    },
};

module.exports = contactController;