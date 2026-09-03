import { ArrowUp, Paperclip } from "lucide-react";
import type { FormEvent, KeyboardEvent } from "react";

export default function ChatComposer({ input, isLoading, onChange, onSubmit }: { input: string; isLoading: boolean; onChange: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
  };
  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-4xl">
      <div className="flex items-end gap-2 rounded-2xl border border-border-theme bg-card p-2 shadow-lg shadow-slate-200/40 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 dark:shadow-black/20">
        <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-hover-theme hover:text-foreground" aria-label="Attach a file"><Paperclip className="h-5 w-5" /></button>
        <textarea value={input} onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown} rows={1} disabled={isLoading} placeholder="Ask about products, orders, users, or your catalog..." aria-label="Message Giftora AI" className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm leading-5 text-foreground outline-none placeholder:text-slate-400" />
        <button type="submit" disabled={!input.trim() || isLoading} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35" aria-label="Send message"><ArrowUp className="h-5 w-5" /></button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">Giftora AI can make mistakes. Verify important catalog and order details.</p>
    </form>
  );
}