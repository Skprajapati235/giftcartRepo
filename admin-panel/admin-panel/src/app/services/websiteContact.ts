import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const getWebsiteContact = async () => {
    const response = await api.get("/website/all-contacts");
    return response.data;
}
export const deleteContact = async (id: string) => {
    const response = await api.delete(`/website/delete-contact/${id}`);
    return response.data;
};