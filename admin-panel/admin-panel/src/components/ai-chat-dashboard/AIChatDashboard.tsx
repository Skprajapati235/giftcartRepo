"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, LoaderCircle, Plus, Sparkles } from "lucide-react";
import { askAgent, getChat, type ChatMessage } from "../../app/services/aiChatService";
import { useAiChats } from "../../app/context/AiChatContext";
import ChatComposer from "./ChatComposer";
import ChatMessageBubble from "./ChatMessageBubble";

const prompts = ["Show me a summary of my products", "Which orders need attention?", "What are my best-selling categories?"];
const loadingStatuses = ["Thinking", "Checking your catalog", "Preparing a clear answer"];

type HistoryState = "idle" | "loading" | "error" | "notfound";

/** /chat -> null (new chat), /chat/<id> -> "<id>" */
function getChatIdFromPath(pathname: string | null) {
  const match = pathname?.match(/^\/chat\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getStatus(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as { response?: { status?: number } }).response?.status;
  }
  return undefined;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "The AI service is unavailable right now. Please try again in a moment.";
}

export default function AIChatDashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const { chats, upsert } = useAiChats();
  const urlChatId = getChatIdFromPath(pathname);

  const [chatId, setChatId] = useState<string | null>(urlChatId);
  const [title, setTitle] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyState, setHistoryState] = useState<HistoryState>(urlChatId ? "loading" : "idle");
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Which chat is on screen right now (undefined = nothing yet, null = blank "new chat")
  const shownChatRef = useRef<string | null | undefined>(undefined);
  // Goes up every time the user switches to another chat, so late answers of the old chat are ignored
  const viewRef = useRef(0);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading, historyState]);

  useEffect(() => {
    if (!isLoading) return;
    const interval = window.setInterval(() => {
      setLoadingStatusIndex((current) => (current + 1) % loadingStatuses.length);
    }, 1400);
    return () => window.clearInterval(interval);
  }, [isLoading]);

  const loadChat = useCallback(async (id: string) => {
    const view = viewRef.current;
    setHistoryState("loading");
    try {
      const chat = await getChat(id);
      if (viewRef.current !== view) return;
      setMessages(chat.messages || []);
      setTitle(chat.title || "");
      setHistoryState("idle");
    } catch (error: unknown) {
      if (viewRef.current !== view) return;
      setHistoryState(getStatus(error) === 404 ? "notfound" : "error");
    }
  }, []);

  // The URL is the source of truth: /chat = new chat, /chat/<chatId> = saved chat
  useEffect(() => {
    if (shownChatRef.current === urlChatId) return; // already showing it (e.g. chat we just created)
    shownChatRef.current = urlChatId;
    viewRef.current += 1;
    setChatId(urlChatId);
    setTitle("");
    setMessages([]);
    setInput("");
    setIsLoading(false);
    if (urlChatId) void loadChat(urlChatId);
    else setHistoryState("idle");
  }, [urlChatId, loadChat]);

  const streamAnswer = async (answer: string, conversation: ChatMessage[], view: number) => {
    // Long answers (tables) get bigger chunks so the typing effect never takes more than ~2 seconds
    const size = Math.max(3, Math.ceil(answer.length / 120));
    let streamedAnswer = "";
    for (let start = 0; start < answer.length; start += size) {
      if (viewRef.current !== view) return;
      streamedAnswer += answer.slice(start, start + size);
      setMessages([...conversation, { role: "assistant", content: streamedAnswer }]);
      await new Promise((resolve) => window.setTimeout(resolve, 16));
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>, overrideText?: string) => {
    if (event) event.preventDefault();
    const message = (overrideText !== undefined ? overrideText : input).trim();
    if (!message || isLoading || historyState !== "idle") return;

    const view = viewRef.current;
    const currentChatId = shownChatRef.current ?? null;
    const userMessage: ChatMessage = { role: "user", content: message };
    const conversation = [...messages, userMessage];
    setMessages(conversation); setInput(""); setIsLoading(true); setLoadingStatusIndex(0);

    try {
      // The server keeps the history: we only send the new message + chatId
      const data = await askAgent(message, [], currentChatId);
      const answer = data.answer || data.message || "I could not generate a response.";
      if (data.chat) upsert(data.chat); // sidebar: new chat appears / chat moves to top
      if (viewRef.current !== view) return; // user opened another chat meanwhile; this one is saved anyway

      const createdChatId = !currentChatId && data.chatId ? data.chatId : null;
      if (createdChatId) { shownChatRef.current = createdChatId; setChatId(createdChatId); }
      if (data.chat?.title) setTitle(data.chat.title);

      await streamAnswer(answer, conversation, view);
      if (createdChatId && viewRef.current === view) router.replace(`/chat/${createdChatId}`);
    } catch (error: unknown) {
      if (viewRef.current !== view) return;
      setMessages((current) => [...current, { role: "assistant", content: getErrorMessage(error) }]);
    } finally {
      if (viewRef.current === view) setIsLoading(false);
    }
  };

  const startNewChat = () => {
    if (isLoading) return;
    shownChatRef.current = null;
    setChatId(null);
    setTitle("");
    setMessages([]);
    setInput("");
    setHistoryState("idle");
    if (pathname !== "/chat") {
      router.push("/chat");
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const activeTitle = (chatId && chats.find((chat) => chat.chatId === chatId)?.title) || title;
  const isNewChat = !chatId && messages.length === 0 && historyState === "idle";

  return (
    <main className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden bg-background">
      <header className="sticky top-0 z-10 flex h-[74px] shrink-0 items-center justify-between gap-3 border-b border-border-theme bg-card px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-foreground">Giftora AI</h1>
            <p className="truncate text-xs text-slate-500">{activeTitle || "Your intelligent admin assistant"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={startNewChat}
          disabled={isLoading}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border-theme bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-hover-theme disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New chat</span>
        </button>
      </header>
      {isNewChat ? (
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-6">
          <div className="flex w-full max-w-2xl flex-col items-center text-center">
            {/* Centered Glowing AI Icon */}
            <div className="relative mb-4">
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-primary/30 to-secondary/30 blur-lg opacity-70" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-white shadow-lg">
                <Sparkles className="h-7 w-7" />
              </div>
            </div>

            {/* Welcome Heading & Subtitle */}
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What would you like to know?
            </h2>
            <p className="mb-7 max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Ask questions about your products, orders, inventory insights, or store catalog.
            </p>

            {/* Centered Ask Input Field */}
            <div className="w-full">
              <ChatComposer
                input={input}
                isLoading={isLoading || historyState !== "idle"}
                onChange={setInput}
                onSubmit={(e) => void handleSubmit(e)}
                autoFocus
                centered
                textareaRef={textareaRef}
              />
            </div>

            {/* Quick Starter Prompts */}
            <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSelectPrompt(prompt)}
                  className="group flex items-center gap-2 rounded-xl border border-border-theme bg-card/60 px-3.5 py-2 text-xs font-medium text-slate-600 backdrop-blur transition hover:border-primary/50 hover:bg-card hover:text-foreground dark:text-slate-300 dark:hover:text-white"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary transition group-hover:rotate-12 group-hover:scale-110" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Bottom corner disclaimer */}
          <p className="pointer-events-none absolute bottom-3 right-4 sm:right-6 text-right text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 select-none">
            Giftora AI can make mistakes. Verify important catalog and order details.
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 sm:px-8">
            <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-6">
              {historyState === "loading" && (
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <LoaderCircle className="h-4 w-4 animate-spin text-primary" /> Loading conversation...
                </div>
              )}
              {historyState === "error" && (
                <div className="rounded-2xl border border-border-theme bg-card p-5 text-center text-sm text-slate-500">
                  <p>Could not load this chat. Please check your connection and try again.</p>
                  <div className="mt-3 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => urlChatId && void loadChat(urlChatId)}
                      className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Try again
                    </button>
                    <Link
                      href="/chat"
                      className="rounded-xl border border-border-theme px-3 py-2 text-xs font-semibold text-foreground hover:bg-hover-theme"
                    >
                      New chat
                    </Link>
                  </div>
                </div>
              )}
              {historyState === "notfound" && (
                <div className="rounded-2xl border border-border-theme bg-card p-5 text-center text-sm text-slate-500">
                  <p>This chat does not exist or was deleted.</p>
                  <div className="mt-3 flex justify-center">
                    <Link
                      href="/chat"
                      className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Start a new chat
                    </Link>
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <ChatMessageBubble
                  key={message.id ?? `${message.role}-${index}`}
                  message={message}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-border-theme bg-card px-4 py-3 text-sm text-slate-500 dark:text-slate-300">
                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                    <span>
                      {loadingStatuses[loadingStatusIndex]}
                      <span className="ml-0.5 inline-block w-5 text-left">...</span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="border-t border-border-theme bg-background px-4 pt-3.5 pb-2.5 sm:px-8">
            <div className="mx-auto w-full max-w-4xl">
              <ChatComposer
                input={input}
                isLoading={isLoading || historyState !== "idle"}
                onChange={setInput}
                onSubmit={(e) => void handleSubmit(e)}
                textareaRef={textareaRef}
              />
              <p className="mt-1.5 text-right text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 select-none">
                Giftora AI can make mistakes. Verify important catalog and order details.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}