import axios from "axios";

export type ChatRole = "user" | "assistant";

export interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

export interface ToolTrace {
  name: string;
  arguments: Record<string, unknown>;
  success: boolean;
}

export interface AskAiResponse {
  success: boolean;
  answer: string;
  message?: string;
  tool_calls?: ToolTrace[];
}

/**
 * Sends a message to the GiftFestive AI agent via the app's own
 * /api/ai-chat route (never calls the Render URL directly from the
 * browser, so the internal key stays server-side).
 */
export const askAi = async (
  message: string,
  history: ChatHistoryItem[],
  token: string
): Promise<AskAiResponse> => {
  const response = await axios.post<AskAiResponse>(
    "/api/chat",
    { message, history },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
