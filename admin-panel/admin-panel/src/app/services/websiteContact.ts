import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("giftcartAdminToken") || "";
};

const authApi = (token?: string) =>
    axios.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });



export const sendWebsiteContact = async () => {
    const response = await authApi(getAuthToken()).post("/website/contact");
    return response.data;
};
