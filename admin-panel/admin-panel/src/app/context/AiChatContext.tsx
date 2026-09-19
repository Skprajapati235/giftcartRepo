"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    deleteChat as deleteChatApi,
    getChats,
    renameChat as renameChatApi,
    type AiChatSummary,
} from "../services/aiChatService";

type AiChatContextValue = {
    chats: AiChatSummary[];
    loading: boolean;
    error: string;
    /** Loads the chat list once (safe to call many times). */
    ensureLoaded: () => void;
    /** Force reload from the server. */
    refresh: () => Promise<void>;
    /** Add a new chat / update an existing one (moves it to the top). */
    upsert: (chat: AiChatSummary) => void;
    rename: (chatId: string, title: string) => Promise<void>;
    remove: (chatId: string) => Promise<void>;
};

const AiChatContext = createContext<AiChatContextValue | null>(null);

function sortByLatest(list: AiChatSummary[]) {
    const time = (c: AiChatSummary) =>
        new Date(c.lastMessageAt || c.updatedAt || c.createdAt || 0).getTime();
    return [...list].sort((a, b) => time(b) - time(a));
}

export function AiChatProvider({ children }: { children: ReactNode }) {
    const [chats, setChats] = useState<AiChatSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const startedRef = useRef(false);

    const refresh = useCallback(async () => {
        startedRef.current = true;
        setLoading(true);
        setError("");
        try {
            const list = await getChats();
            setChats(sortByLatest(list));
        } catch {
            setError("Could not load chats");
        } finally {
            setLoading(false);
        }
    }, []);

    const ensureLoaded = useCallback(() => {
        if (startedRef.current) return;
        void refresh();
    }, [refresh]);

    const upsert = useCallback((chat: AiChatSummary) => {
        setChats((current) =>
            sortByLatest([chat, ...current.filter((item) => item.chatId !== chat.chatId)])
        );
    }, []);

    const rename = useCallback(async (chatId: string, title: string) => {
        const updated = await renameChatApi(chatId, title);
        setChats((current) =>
            current.map((item) => (item.chatId === chatId ? { ...item, title: updated.title } : item))
        );
    }, []);

    const remove = useCallback(async (chatId: string) => {
        await deleteChatApi(chatId);
        setChats((current) => current.filter((item) => item.chatId !== chatId));
    }, []);

    const value = useMemo(
        () => ({ chats, loading, error, ensureLoaded, refresh, upsert, rename, remove }),
        [chats, loading, error, ensureLoaded, refresh, upsert, rename, remove]
    );

    return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
}

export function useAiChats() {
    const ctx = useContext(AiChatContext);
    if (!ctx) {
        throw new Error("useAiChats must be used within AiChatProvider");
    }
    return ctx;
}