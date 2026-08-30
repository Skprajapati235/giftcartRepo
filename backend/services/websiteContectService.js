const websiteContentSchema = require("../models/websitecontect");

const contactService = {
    createContact: async (email) => {
        const contact = await websiteContentSchema.create({
            email,
        });

        return contact;
    },


    // GET ALL CONTACTS
    getContacts: async () => {
        return await websiteContentSchema.find();
    },

    // DELETE CONTACT
    deleteContact: async (id) => {
        return await websiteContentSchema.findByIdAndDelete(id);
    },
};

module.exports = contactService;