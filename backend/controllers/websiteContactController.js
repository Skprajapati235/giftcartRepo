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

    // GET ALL CONTACTS
    getContacts: async (req, res) => {
        try {
            const contacts = await contactService.getContacts();

            return res.status(200).json({
                success: true,
                message: "Contacts fetched successfully",
                count: contacts.length,
                data: contacts,
            });
        } catch (error) {
            console.error("Get Contacts Error:", error);

            return res.status(500).json({
                success: false,
                message: "Something went wrong",
                error: error.message,
            });
        }
    },

    // DELETE CONTACT
    deleteContact: async (req, res) => {
        try {
            const { id } = req.params;

            const contact = await contactService.deleteContact(id);

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: "Contact not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Contact deleted successfully",
                data: contact,
            });
        } catch (error) {
            console.error("Delete Contact Error:", error);

            return res.status(500).json({
                success: false,
                message: "Something went wrong",
                error: error.message,
            });
        }
    },
};

module.exports = contactController;