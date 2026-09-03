"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircleMore, Send, Sparkles, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { askAi, ChatHistoryItem, ToolTrace } from "../services/aiChatService";
import { useToast } from "../../context/ToastContext";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  tools?: ToolTrace[];
}

const MAX_HISTORY_MESSAGES = 20;

export default function AdminAiChatWidget() {
  const { token, user, authenticated } = useAuth();
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  // Only visible to a logged-in admin. Nothing renders (and no token is
  // ever sent) until AuthContext confirms a valid session.
  if (!authenticated || !token) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: DisplayMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history: ChatHistoryItem[] = nextMessages
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await askAi(text, history.slice(0, -1), token);

      if (!data.success) {
        throw new Error(data.message || "The AI assistant could not answer that.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer, tools: data.tool_calls }]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "The AI assistant is unavailable right now.";
      showToast(msg, "error");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I ran into a problem answering that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background shadow-lg transition hover:scale-105 hover:shadow-xl"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[32rem] w-[23rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border-theme bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-theme bg-th-bg px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-background">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Giftora AI Assistant</p>
                <p className="text-xs text-foreground/60">
                  Signed in as {user?.name || user?.email || "Admin"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI assistant"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 transition hover:bg-hover-theme hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-foreground/50">
                <MessageCircleMore className="h-8 w-8" />
                <p className="text-sm">Ask me anything about your orders, products, users or sales.</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-background"
                      : "rounded-bl-sm bg-hover-theme text-foreground"
                  }`}
                >
                  {m.content}
                  {!!m.tools?.length && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.tools.map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded-full border border-border-theme bg-background/60 px-2 py-0.5 text-[10px] text-foreground/60"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-hover-theme px-3 py-2 text-sm text-foreground/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-border-theme p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 4000))}
                onKeyDown={handleKeyDown}
                placeholder="Ask about orders, revenue, users..."
                rows={1}
                className="max-h-24 flex-1 resize-none rounded-xl border border-border-theme bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-background transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
