const mongoose = require("mongoose");

// One document = one AI chat (ChatGPT-style conversation) owned by one admin.
// `chatId` is the public id used in the admin-panel URL (/chat/<chatId>).
const aiChatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const aiChatSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Admin (or admin-role user) who owns this chat. Each admin only sees their own chats.
    adminId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New chat",
      trim: true,
      maxlength: 120,
    },
    messages: {
      type: [aiChatMessageSchema],
      default: [],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Sidebar query: "all chats of this admin, newest first"
aiChatSchema.index({ adminId: 1, lastMessageAt: -1 });

module.exports = mongoose.model("AiChat", aiChatSchema);