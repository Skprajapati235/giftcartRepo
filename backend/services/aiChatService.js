const crypto = require("crypto");
const axios = require("axios");
const AiChat = require("../models/AiChat");

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || "http://localhost:8001";
const AI_INTERNAL_KEY = process.env.AI_INTERNAL_KEY || "";
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS) || 60000;

const MAX_MESSAGE_LENGTH = 4000; // keep in sync with AI service MAX_MESSAGE_LENGTH
const HISTORY_MESSAGES_FOR_AI = 20; // last N messages sent to the AI as context
const MAX_MESSAGES_PER_CHAT = 400; // safety cap so one chat document never grows too big
const MAX_TITLE_LENGTH = 60;
const DEFAULT_LIST_LIMIT = 200;

class ChatError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const makeTitle = (message) => {
    const text = cleanText(message);
    if (!text) return "New chat";
    return text.length > MAX_TITLE_LENGTH ? `${text.slice(0, MAX_TITLE_LENGTH).trim()}…` : text;
};

const ownerId = (req) => String(req.user?.id || "");

const toSummary = (chat) => ({
    chatId: chat.chatId,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    lastMessageAt: chat.lastMessageAt,
});

const toMessage = (m) => ({
    id: String(m._id),
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
});

const requireChatId = (chatId) => {
    if (typeof chatId !== "string" || !chatId.trim()) {
        throw new ChatError("Invalid chat id", 400);
    }
    return chatId.trim();
};

// ---------- History (sidebar) ----------

exports.listChats = async (adminId, limit) => {
    const l = Math.min(Math.max(parseInt(limit) || DEFAULT_LIST_LIMIT, 1), 500);
    const chats = await AiChat.find({ adminId })
        .select("-messages")
        .sort({ lastMessageAt: -1 })
        .limit(l)
        .lean();
    return chats.map(toSummary);
};

exports.getChat = async (adminId, chatId) => {
    const chat = await AiChat.findOne({ chatId: requireChatId(chatId), adminId }).lean();
    if (!chat) throw new ChatError("Chat not found", 404);
    return { ...toSummary(chat), messages: (chat.messages || []).map(toMessage) };
};

exports.renameChat = async (adminId, chatId, title) => {
    const nextTitle = cleanText(title).slice(0, 120);
    if (!nextTitle) throw new ChatError("Title is required", 400);
    const filter = { chatId: requireChatId(chatId), adminId };
    const result = await AiChat.updateOne(filter, { $set: { title: nextTitle } });
    if (!result.matchedCount) throw new ChatError("Chat not found", 404);
    const chat = await AiChat.findOne(filter).select("-messages").lean();
    if (!chat) throw new ChatError("Chat not found", 404);
    return toSummary(chat);
};

exports.deleteChat = async (adminId, chatId) => {
    const result = await AiChat.deleteOne({ chatId: requireChatId(chatId), adminId });
    if (!result.deletedCount) throw new ChatError("Chat not found", 404);
};

// ---------- Ask the AI ----------

const callPythonAi = async (message, history, token) => {
    try {
        const response = await axios.post(
            `${PYTHON_AI_URL}/api/ai/chat`,
            { message, history },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-AI-Internal-Key": AI_INTERNAL_KEY,
                    "Content-Type": "application/json",
                },
                timeout: AI_REQUEST_TIMEOUT_MS,
            }
        );
        return response.data;
    } catch (error) {
        let detail = error.response?.data?.detail;
        if (Array.isArray(detail)) detail = detail.map((d) => d?.msg || String(d)).join(", ");
        console.error("AI Chat Error:", error.message);
        // 422 = the AI service rejected the message itself; anything else = AI service problem
        throw new ChatError(
            typeof detail === "string" && detail ? detail : "AI service error",
            error.response?.status === 422 ? 400 : 502
        );
    }
};

/**
 * Sends a message to the AI.
 *  - chatId given  -> continues that chat (history is loaded from MongoDB)
 *  - chatId missing -> creates a new chat (title = first message)
 *  - legacy call (no chatId, but `history` array sent) -> stateless, nothing is saved
 */
exports.ask = async ({ adminId, token, message, chatId, history }) => {
    const text = String(message || "").trim();
    if (!text) throw new ChatError("Message is required", 400);
    if (text.length > MAX_MESSAGE_LENGTH) {
        throw new ChatError(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`, 400);
    }

    // Legacy stateless mode (old floating widget) — behaves like before.
    if (!chatId && Array.isArray(history) && history.length > 0) {
        const data = await callPythonAi(text, history, token);
        return { ...data, chatId: null };
    }

    let chat = null;
    if (chatId !== undefined && chatId !== null && chatId !== "") {
        chat = await AiChat.findOne({ chatId: requireChatId(chatId), adminId }).lean();
        if (!chat) throw new ChatError("Chat not found", 404);
        if ((chat.messages || []).length >= MAX_MESSAGES_PER_CHAT) {
            throw new ChatError("This chat is full. Please start a new chat.", 400);
        }
    }

    const aiHistory = (chat?.messages || [])
        .slice(-HISTORY_MESSAGES_FOR_AI)
        .map((m) => ({ role: m.role, content: m.content }));

    const data = await callPythonAi(text, aiHistory, token);
    const answer = String(data?.answer || data?.message || "").trim() || "I could not generate a response.";
    const now = new Date();
    const newMessages = [
        { role: "user", content: text, createdAt: now },
        { role: "assistant", content: answer, createdAt: new Date(now.getTime() + 1) },
    ];

    let saved;
    if (chat) {
        const filter = { chatId: chat.chatId, adminId };
        const result = await AiChat.updateOne(filter, {
            $push: { messages: { $each: newMessages } },
            $set: { lastMessageAt: now },
        });
        if (!result.matchedCount) throw new ChatError("Chat not found", 404); // deleted while the AI was answering
        saved = await AiChat.findOne(filter).select("-messages").lean();
        if (!saved) throw new ChatError("Chat not found", 404);
    } else {
        const created = await AiChat.create({
            chatId: crypto.randomUUID(),
            adminId,
            title: makeTitle(text),
            messages: newMessages,
            lastMessageAt: now,
        });
        saved = created.toObject();
    }

    return {
        success: true,
        answer,
        chatId: saved.chatId,
        chat: toSummary(saved),
        tool_calls: data?.tool_calls || [],
    };
};

exports.ownerId = ownerId;
exports.ChatError = ChatError;