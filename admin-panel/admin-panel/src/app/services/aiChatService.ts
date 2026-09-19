import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

/** One row in the chat history sidebar. */
export interface AiChatSummary {
  chatId: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  lastMessageAt?: string;
}

/** A full chat with all its saved messages. */
export interface AiChatDetail extends AiChatSummary {
  messages: ChatMessage[];
}

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("giftcartAdminToken") || "";
};

const authApi = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

/**
 * Send a message to the AI.
 * - pass `chatId` to continue an existing chat (history is loaded on the server)
 * - leave `chatId` empty to start a new chat; the response contains the new `chatId`
 * `history` is only kept for old callers (the unused floating widget).
 */
export const askAgent = async (
  message: string,
  history: ChatMessage[] = [],
  chatId?: string | null
) => {
  const payload: { message: string; chatId?: string; history?: ChatMessage[] } = { message };
  if (chatId) payload.chatId = chatId;
  else if (history.length > 0) payload.history = history;

  const response = await authApi().post("/ask-agent", payload);

  return response.data as {
    success?: boolean;
    answer?: string;
    message?: string;
    chatId?: string | null;
    chat?: AiChatSummary;
  };
};

export const getChats = async (): Promise<AiChatSummary[]> => {
  const response = await authApi().get("/ai-chat");
  return (response.data?.chats || []) as AiChatSummary[];
};

export const getChat = async (chatId: string): Promise<AiChatDetail> => {
  const response = await authApi().get(`/ai-chat/${encodeURIComponent(chatId)}`);
  return response.data.chat as AiChatDetail;
};

export const renameChat = async (chatId: string, title: string): Promise<AiChatSummary> => {
  const response = await authApi().patch(`/ai-chat/${encodeURIComponent(chatId)}`, { title });
  return response.data.chat as AiChatSummary;
};

export const deleteChat = async (chatId: string) => {
  const response = await authApi().delete(`/ai-chat/${encodeURIComponent(chatId)}`);
  return response.data;
};