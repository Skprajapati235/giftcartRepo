import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const getWebsiteContact = async () => {
    const response = await api.post("/website/all-contacts");
    return response.data;
};