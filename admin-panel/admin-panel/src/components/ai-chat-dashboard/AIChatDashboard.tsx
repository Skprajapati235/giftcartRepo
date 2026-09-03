"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, Plus, Sparkles } from "lucide-react";
import { askAgent, type ChatMessage } from "../../app/services/aiChatService";
import ChatComposer from "./ChatComposer";
import ChatMessageBubble from "./ChatMessageBubble";

const welcomeMessage: ChatMessage = { role: "assistant", content: "Hi! I am your Giftora admin assistant. I can help you explore products, orders, customers, and catalog performance. What would you like to know?" };
const prompts = ["Show me a summary of my products", "Which orders need attention?", "What are my best-selling categories?"];

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "The AI service is unavailable right now. Please try again in a moment.";
}

export default function AIChatDashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingStatuses = ["Thinking", "Checking your catalog", "Preparing a clear answer"];
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) return;
    const interval = window.setInterval(() => {
      setLoadingStatusIndex((current) => (current + 1) % loadingStatuses.length);
    }, 1400);
    return () => window.clearInterval(interval);
  }, [isLoading]);

  const streamAnswer = async (answer: string, conversation: ChatMessage[]) => {
    const chunks = answer.match(/.{1,3}/g) || [answer];
    let streamedAnswer = "";
    for (const chunk of chunks) {
      streamedAnswer += chunk;
      setMessages([...conversation, { role: "assistant", content: streamedAnswer }]);
      await new Promise((resolve) => window.setTimeout(resolve, 16));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;
    const userMessage: ChatMessage = { role: "user", content: message };
    const conversation = [...messages, userMessage];
    setMessages(conversation); setInput(""); setIsLoading(true); setLoadingStatusIndex(0);
    try {
      const data = await askAgent(message, conversation);
      const answer = data.answer || data.message || "I could not generate a response.";
      await streamAnswer(answer, conversation);
    } catch (error: unknown) {
      setMessages((current) => [...current, { role: "assistant", content: getErrorMessage(error) }]);
    } finally { setIsLoading(false); }
  };

  const startNewChat = () => { if (!isLoading) { setMessages([welcomeMessage]); setInput(""); } };

  return (
    <main className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden bg-background">
      <header className="sticky top-0 z-10 flex h-[74px] shrink-0 items-center justify-between gap-3 border-b border-border-theme bg-card px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white"><Sparkles className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-lg font-bold text-foreground">Giftora AI</h1><p className="truncate text-xs text-slate-500">Your intelligent admin assistant</p></div></div>
        <button type="button" onClick={startNewChat} disabled={isLoading} className="flex shrink-0 items-center gap-2 rounded-xl border border-border-theme bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-hover-theme disabled:opacity-50"><Plus className="h-4 w-4" /> <span className="hidden sm:inline">New chat</span></button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 sm:px-8"><div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-6">{messages.map((message, index) => <ChatMessageBubble key={`${message.role}-${index}`} message={message} />)}{isLoading && <div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white"><Bot className="h-4 w-4" /></div><div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-border-theme bg-card px-4 py-3 text-sm text-slate-500 dark:text-slate-300"><LoaderCircle className="h-4 w-4 animate-spin text-primary" /><span>{loadingStatuses[loadingStatusIndex]}<span className="ml-0.5 inline-block w-5 text-left">...</span></span></div></div>}<div ref={messagesEndRef} /></div></div>
        {messages.length === 1 && <div className="mx-auto grid w-full max-w-4xl gap-2 px-4 pb-5 sm:grid-cols-3 sm:px-8">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setInput(prompt)} className="rounded-xl border border-border-theme bg-card px-3 py-3 text-left text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary dark:text-slate-300">{prompt}</button>)}</div>}
        <div className="border-t border-border-theme bg-background px-4 py-4 sm:px-8"><ChatComposer input={input} isLoading={isLoading} onChange={setInput} onSubmit={handleSubmit} /></div>
      </div>
    </main>
  );
}