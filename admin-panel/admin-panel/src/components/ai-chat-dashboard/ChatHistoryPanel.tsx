"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Check, MessageSquare, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import ConfirmDialog from "../../app/components/ui/ConfirmDialog";
import { useAiChats } from "../../app/context/AiChatContext";
import { useToast } from "../../context/ToastContext";
import type { AiChatSummary } from "../../app/services/aiChatService";

const DAY = 24 * 60 * 60 * 1000;

function chatTime(chat: AiChatSummary) {
    return new Date(chat.lastMessageAt || chat.updatedAt || chat.createdAt || 0).getTime();
}

/** Groups chats like ChatGPT: Today / Yesterday / Previous 7 days / Previous 30 days / Older */
function groupChats(chats: AiChatSummary[], now: number) {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const today = startOfToday.getTime();

    const groups: { label: string; items: AiChatSummary[] }[] = [
        { label: "Today", items: [] },
        { label: "Yesterday", items: [] },
        { label: "Previous 7 days", items: [] },
        { label: "Previous 30 days", items: [] },
        { label: "Older", items: [] },
    ];

    chats.forEach((chat) => {
        const time = chatTime(chat);
        if (time >= today) groups[0].items.push(chat);
        else if (time >= today - DAY) groups[1].items.push(chat);
        else if (time >= today - 7 * DAY) groups[2].items.push(chat);
        else if (time >= today - 30 * DAY) groups[3].items.push(chat);
        else groups[4].items.push(chat);
    });

    return groups.filter((group) => group.items.length > 0);
}

type Props = {
    /** Called after the user picks a chat / New chat (used to close the mobile drawer). */
    onNavigate?: () => void;
    /** On touch screens there is no hover, so action buttons stay visible. */
    alwaysShowActions?: boolean;
};

export default function ChatHistoryPanel({ onNavigate, alwaysShowActions = false }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const { showToast } = useToast();
    const { chats, loading, error, ensureLoaded, refresh, rename, remove } = useAiChats();

    const [now] = useState(() => Date.now());
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [pendingDelete, setPendingDelete] = useState<AiChatSummary | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        ensureLoaded();
    }, [ensureLoaded]);

    const visibleChats = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return chats;
        return chats.filter((chat:any) => chat.title.toLowerCase().includes(term));
    }, [chats, search]);

    const groups = useMemo(() => groupChats(visibleChats, now), [visibleChats, now]);

    const startRename = (chat: AiChatSummary) => {
        setEditingId(chat.chatId);
        setDraftTitle(chat.title);
    };

    const submitRename = async (event: FormEvent<HTMLFormElement>, chat: AiChatSummary) => {
        event.preventDefault();
        const title = draftTitle.trim();
        setEditingId(null);
        if (!title || title === chat.title) return;
        try {
            await rename(chat.chatId, title);
        } catch {
            showToast("Could not rename chat", "error");
        }
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const chat = pendingDelete;
        setDeleting(true);
        try {
            await remove(chat.chatId);
            showToast("Chat deleted", "success");
            if (pathname === `/chat/${chat.chatId}`) router.push("/chat");
        } catch {
            showToast("Could not delete chat", "error");
        } finally {
            setDeleting(false);
            setPendingDelete(null);
        }
    };

    const actionVisibility = alwaysShowActions
        ? "opacity-100"
        : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100";

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
            <Link
                href="/chat"
                onClick={onNavigate}
                className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-[13px] font-semibold text-white shadow-md transition hover:opacity-90"
            >
                <Plus className="h-4 w-4" />
                New chat
            </Link>

            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search chats"
                    aria-label="Search chats"
                    className="w-full rounded-xl border border-border-theme bg-background py-2 pl-8 pr-3 text-[13px] text-foreground outline-none placeholder:text-slate-400 focus:border-primary"
                />
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                {loading && chats.length === 0 && (
                    <div className="space-y-2">
                        {[0, 1, 2, 3].map((item) => (
                            <div key={item} className="h-9 animate-pulse rounded-xl bg-hover-theme" />
                        ))}
                    </div>
                )}

                {!loading && error && chats.length === 0 && (
                    <div className="rounded-xl border border-border-theme bg-background p-3 text-center text-xs text-slate-500">
                        <p>{error}</p>
                        <button
                            type="button"
                            onClick={() => void refresh()}
                            className="mt-2 font-semibold text-primary hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && chats.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border-theme p-4 text-center text-xs text-slate-500">
                        <MessageSquare className="mx-auto mb-2 h-5 w-5 text-slate-400" />
                        No chats yet. Ask something and it will be saved here.
                    </div>
                )}

                {chats.length > 0 && groups.length === 0 && (
                    <p className="px-1 text-xs text-slate-500">No chats match &quot;{search}&quot;.</p>
                )}

                {groups.map((group) => (
                    <section key={group.label}>
                        <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            {group.label}
                        </p>
                        <ul className="space-y-1">
                            {group.items.map((chat) => {
                                const active = pathname === `/chat/${chat.chatId}`;

                                if (editingId === chat.chatId) {
                                    return (
                                        <li key={chat.chatId}>
                                            <form
                                                onSubmit={(event) => void submitRename(event, chat)}
                                                className="flex items-center gap-1 rounded-xl border border-primary bg-background px-2 py-1.5"
                                            >
                                                <input
                                                    autoFocus
                                                    value={draftTitle}
                                                    maxLength={120}
                                                    onChange={(event) => setDraftTitle(event.target.value)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Escape") setEditingId(null);
                                                    }}
                                                    aria-label="Chat title"
                                                    className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none"
                                                />
                                                <button
                                                    type="submit"
                                                    aria-label="Save title"
                                                    className="rounded-md p-1 text-emerald-600 hover:bg-hover-theme"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(null)}
                                                    aria-label="Cancel rename"
                                                    className="rounded-md p-1 text-slate-500 hover:bg-hover-theme"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </form>
                                        </li>
                                    );
                                }

                                return (
                                    <li
                                        key={chat.chatId}
                                        className={`group flex items-center rounded-xl border transition ${active
                                                ? "border-primary bg-primary text-white shadow-md"
                                                : "border-transparent bg-background text-slate-500 hover:border-border-theme hover:bg-hover-theme hover:text-foreground"
                                            }`}
                                    >
                                        <Link
                                            href={`/chat/${chat.chatId}`}
                                            onClick={onNavigate}
                                            title={chat.title}
                                            className="min-w-0 flex-1 truncate px-3 py-2.5 text-[13px] font-semibold"
                                        >
                                            {chat.title}
                                        </Link>
                                        <div className={`flex shrink-0 items-center pr-1 transition ${active ? "opacity-100" : actionVisibility}`}>
                                            <button
                                                type="button"
                                                onClick={() => startRename(chat)}
                                                aria-label="Rename chat"
                                                className={`rounded-md p-1.5 ${active ? "hover:bg-white/20" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPendingDelete(chat)}
                                                aria-label="Delete chat"
                                                className={`rounded-md p-1.5 ${active ? "hover:bg-white/20" : "hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20"}`}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ))}
            </div>

            {/* Rendered in <body> so the dark backdrop covers the whole page, not just the sidebar */}
            {pendingDelete &&
                createPortal(
                    <ConfirmDialog
                        isOpen
                        title="Delete chat?"
                        message={`"${pendingDelete.title}" and all its messages will be permanently deleted.`}
                        confirmText="Delete"
                        onConfirm={() => void confirmDelete()}
                        onCancel={() => setPendingDelete(null)}
                        isLoading={deleting}
                    />,
                    document.body
                )}
        </div>
    );
}