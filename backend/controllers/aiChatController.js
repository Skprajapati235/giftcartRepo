const aiChatService = require("../services/aiChatService");

const fail = (res, err) => {
    if (err instanceof aiChatService.ChatError) {
        return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error("AI chat error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
};

// POST /api/ask-agent  { message, chatId? }
exports.askAgent = async (req, res) => {
    try {
        const { message, chatId, history } = req.body || {};
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

        const result = await aiChatService.ask({
            adminId: aiChatService.ownerId(req),
            token,
            message,
            chatId,
            history,
        });
        res.json(result);
    } catch (err) {
        const known = err instanceof aiChatService.ChatError;
        if (!known) console.error("AI Chat Error:", err);
        // `answer` is kept so older clients still show something readable
        res.status(known ? err.status : 500).json({
            success: false,
            message: known ? err.message : "AI service error",
            answer: "Sorry, I couldn't process that request. Please try again.",
        });
    }
};

// GET /api/ai-chat
exports.list = async (req, res) => {
    try {
        const chats = await aiChatService.listChats(aiChatService.ownerId(req), req.query.limit);
        res.json({ success: true, chats });
    } catch (err) {
        fail(res, err);
    }
};

// GET /api/ai-chat/:chatId
exports.get = async (req, res) => {
    try {
        const chat = await aiChatService.getChat(aiChatService.ownerId(req), req.params.chatId);
        res.json({ success: true, chat });
    } catch (err) {
        fail(res, err);
    }
};

// PATCH /api/ai-chat/:chatId  { title }
exports.rename = async (req, res) => {
    try {
        const chat = await aiChatService.renameChat(
            aiChatService.ownerId(req),
            req.params.chatId,
            req.body?.title
        );
        res.json({ success: true, chat });
    } catch (err) {
        fail(res, err);
    }
};

// DELETE /api/ai-chat/:chatId
exports.remove = async (req, res) => {
    try {
        await aiChatService.deleteChat(aiChatService.ownerId(req), req.params.chatId);
        res.json({ success: true, message: "Chat deleted" });
    } catch (err) {
        fail(res, err);
    }
};