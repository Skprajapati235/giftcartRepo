import { Bot, UserRound } from "lucide-react";
import MarkdownContent from "./MarkdownContent";
import type { ChatMessage } from "../../app/services/aiChatService";

export default function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm"><Bot className="h-4 w-4" /></div>}
      <div className={`min-w-0 max-w-[min(850px,88%)] overflow-hidden ${isUser ? "rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-white shadow-sm" : "rounded-2xl rounded-tl-md border border-border-theme bg-card px-5 py-3 shadow-sm"}`}>
        {isUser ? <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p> : <MarkdownContent content={message.content} />}
      </div>
      {isUser && <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><UserRound className="h-4 w-4" /></div>}
    </div>
  );
}