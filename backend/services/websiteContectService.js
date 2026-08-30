const websiteContentSchema = require("../models/websitecontect");

const contactService = {
    createContact: async (email) => {
        const contact = await websiteContentSchema.create({
            email,
        });

        return contact;
    },
};

module.exports = contactService;