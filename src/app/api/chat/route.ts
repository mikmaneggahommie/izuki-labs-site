import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { studioSystemPrompt } from "@/lib/studio-concierge";

// Vercel Edge Network
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, userInfo } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("[IZUKI-API] Request received. Messages:", messages.length);
    console.log("[IZUKI-API] API Key:", apiKey ? "Loaded" : "MISSING");

    if (!apiKey) {
      return NextResponse.json({ 
        error: "Configuration Error", 
        message: "GEMINI_API_KEY is not set in Vercel Environment Variables." 
      }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build the full system instruction with visitor context
    const systemInstruction = `${studioSystemPrompt}

IDENTIFIED VISITOR:
- Name: ${userInfo?.name || "Unknown"}
- Contact: ${userInfo?.email || userInfo?.telegram || userInfo?.phone || "Unknown"}
`.trim();

    // Build conversation history for context
    // Filter and clean messages
    const chatHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
    
    for (const m of messages) {
      if (!m.content || m.role === "system") continue;
      const role = m.role === "assistant" ? "model" as const : "user" as const;
      
      if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === role) {
        chatHistory[chatHistory.length - 1].parts[0].text += "\n" + m.content;
      } else {
        chatHistory.push({ role, parts: [{ text: m.content }] });
      }
    }

    // Google AI Protocol: first message MUST be 'user'
    while (chatHistory.length > 0 && chatHistory[0].role !== "user") {
      chatHistory.shift();
    }

    if (chatHistory.length === 0) {
      chatHistory.push({ role: "user", parts: [{ text: "Hello" }] });
    }

    // Last message must be user (the prompt)
    if (chatHistory[chatHistory.length - 1].role === "model") {
      chatHistory.pop();
    }

    const lastMessage = chatHistory.length > 0 ? chatHistory.pop()!.parts[0].text : "What can you do?";

    console.log("[IZUKI-API] Starting stream with gemini-3-flash-preview...");

    // Use the new SDK's chat with streaming
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction,
      },
      history: chatHistory,
    });

    const response = await chat.sendMessageStream({ message: lastMessage });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          console.error("[IZUKI-API] Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error: any) {
    console.error("[IZUKI-API] Fatal:", error);
    return NextResponse.json({ 
      error: "Engine Failure", 
      message: error.message 
    }, { status: 500 });
  }
}
