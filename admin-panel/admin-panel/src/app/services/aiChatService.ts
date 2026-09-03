import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("giftcartAdminToken") || "";
};

export const askAgent = async (message: string, history: ChatMessage[]) => {
  const token = getAuthToken();
  const response = await axios.post(
    `${baseURL || "http://localhost:5000/api"}/ask-agent`,
    { message, history },
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  return response.data as {
    success?: boolean;
    answer?: string;
    message?: string;
  };
};