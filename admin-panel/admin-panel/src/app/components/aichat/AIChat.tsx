"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { askAgent, type ChatMessage } from "../../services/aiChatService";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "The AI service is unavailable right now.";
}

const welcomeMessage: ChatMessage = {
  role: "assistant",
  content: "Hi! I am your Giftora admin assistant. How can I help you today?",
};

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: message };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput("");
    setIsLoading(true);

    try {
      const data = await askAgent(message, conversation);
      const answer = data.answer || data.message || "I could not generate a response.";
      setMessages((current) => [...current, { role: "assistant", content: answer }]);
    } catch (error: unknown) {
      setMessages((current) => [...current, { role: "assistant", content: getErrorMessage(error) }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[10000] sm:bottom-7 sm:right-7">
      {isOpen && (
        <section className="mb-3 flex h-[min(620px,calc(100vh-110px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-border-theme bg-card shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
          <header className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">Giftora Assistant</h2>
                <p className="text-[11px] text-white/70">Admin support</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close AI chat"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-background p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-border-theme bg-card text-foreground"}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-bl-md border border-border-theme bg-card px-4 py-3">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-border-theme bg-card p-3">
            <div className="flex items-end gap-2 rounded-xl border border-border-theme bg-background p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={1}
                placeholder="Message your assistant..."
                aria-label="Message your assistant"
                className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl ring-4 ring-primary/10 transition hover:scale-105 hover:shadow-2xl"
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}