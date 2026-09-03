import { NextRequest, NextResponse } from "next/server";

// This route runs on the server only, never in the browser bundle.
// It exists so the AI agent's internal key never reaches the client.
export const runtime = "nodejs";

const AI_AGENT_URL = (process.env.AI_AGENT_URL || "https://giftfestiveai.onrender.com").replace(/\/$/, "");
const AI_INTERNAL_KEY = process.env.AI_INTERNAL_KEY;

export async function POST(req: NextRequest) {
  // The browser sends the admin's normal login JWT (from AuthContext) here.
  // We forward that same token to the AI agent, which forwards it to the
  // GiftFestive backend for every tool call — so the AI can only ever see
  // whatever that specific admin is already allowed to see. No separate
  // AI login is needed.
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "You must be signed in to use the AI assistant." },
      { status: 401 }
    );
  }

  if (!AI_INTERNAL_KEY) {
    console.error("AI_INTERNAL_KEY is not set on the admin-panel server.");
    return NextResponse.json(
      { success: false, message: "AI assistant is not configured yet." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${AI_AGENT_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        "X-AI-Internal-Key": AI_INTERNAL_KEY,
      },
      body: JSON.stringify(body),
      // Prevent Next.js from caching an AI answer against a future request.
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({
      success: false,
      message: "The AI assistant returned an unexpected response.",
    }));

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error("AI agent proxy error:", err);
    return NextResponse.json(
      { success: false, message: "Could not reach the AI assistant. Please try again." },
      { status: 502 }
    );
  }
}
