"use client";

import { ArrowUp, Paperclip } from "lucide-react";
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";

type ChatComposerProps = {
  input: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  centered?: boolean;
  autoFocus?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
};

export default function ChatComposer({
  input,
  isLoading,
  onChange,
  onSubmit,
  centered = false,
  autoFocus = false,
  textareaRef,
}: ChatComposerProps) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const targetRef = textareaRef || localRef;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  useEffect(() => {
    if (targetRef.current) {
      targetRef.current.style.height = "auto";
      targetRef.current.style.height = `${Math.min(targetRef.current.scrollHeight, 140)}px`;
    }
  }, [input, targetRef]);

  useEffect(() => {
    if (autoFocus && targetRef.current) {
      targetRef.current.focus();
    }
  }, [autoFocus, targetRef]);

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-4xl">
      <div
        className={`flex items-end gap-2 rounded-2xl border border-border-theme bg-card transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 ${
          centered
            ? "p-2.5 sm:p-3 shadow-xl shadow-slate-300/30 dark:shadow-black/50"
            : "p-2 shadow-lg shadow-slate-200/40 dark:shadow-black/20"
        }`}
      >
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-hover-theme hover:text-foreground"
          aria-label="Attach a file"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <textarea
          ref={targetRef}
          value={input}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
          placeholder="Ask about products, orders, users, or your catalog..."
          aria-label="Message Giftora AI"
          className={`max-h-36 flex-1 resize-none bg-transparent leading-5 text-foreground outline-none placeholder:text-slate-400 ${
            centered
              ? "min-h-[46px] px-1.5 py-2.5 text-sm sm:text-base"
              : "min-h-10 px-1 py-2.5 text-sm"
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Send message"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}