import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { studioSystemPrompt } from "@/lib/studio-concierge";

// Vercel Production Shield
export const dynamic = "force-dynamic";
export const maxDuration = 30; // 30s Lambda Timeout

export async function POST(req: Request) {
  try {
    const { messages, userInfo } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Diagnostic Logging (Visible in Vercel Logs)
    console.log("[IZUKI-API] Received request. Messages count:", messages.length);
    console.log("[IZUKI-API] API Key Status:", apiKey ? "Loaded" : "MISSING");

    if (!apiKey) {
      return NextResponse.json({ 
        error: "Configuration Error", 
        message: "GEMINI_API_KEY is not set in Vercel Environment Variables." 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ARMOR V20: AUTO-ENLIGHTENMENT (Model Discovery)
    // Instead of guessing, we find the absolute best model your key has access to.
    let targetModel = "gemini-1.5-flash"; 
    try {
      const availableModels = await genAI.listModels();
      console.log("[IZUKI-API] Available Models:", availableModels.models.map(m => m.name));
      
      // Auto-Upgrade Logic: Prioritize 2.0 -> 1.5 Pro -> 1.5 Flash
      const modelNames = availableModels.models.map(m => m.name);
      if (modelNames.some(n => n.includes("gemini-2.0-flash"))) {
        targetModel = "gemini-2.0-flash";
      } else if (modelNames.some(n => n.includes("gemini-1.5-pro"))) {
        targetModel = "gemini-1.5-pro";
      } else if (modelNames.some(n => n.includes("gemini-1.5-flash"))) {
        targetModel = "gemini-1.5-flash";
      }
      console.log("[IZUKI-API] Auto-Selected Engine:", targetModel);
    } catch (discoveryErr: any) {
      console.warn("[IZUKI-API] Discovery Failed. Falling back to 1.5-flash-latest.", discoveryErr.message);
      targetModel = "gemini-1.5-flash-latest";
    }

    const model = genAI.getGenerativeModel({ 
      model: targetModel,
      systemInstruction: `${studioSystemPrompt}

IDENTIFIED VISITOR:
- Name: ${userInfo?.name || "Unknown"}
- Contact: ${userInfo?.email || userInfo?.telegram || userInfo?.phone || "Unknown"}
`.trim(),
    });

    // 2. High-Resilience History Sanitizer (Armor V17)
    let history: any[] = [];
    
    for (const m of messages) {
       if (!m.content || m.role === 'system') continue;
       const role = m.role === "assistant" ? "model" : "user";
       
       if (history.length > 0 && history[history.length - 1].role === role) {
          history[history.length - 1].parts[0].text += "\n" + m.content;
       } else {
          history.push({ role, parts: [{ text: m.content }] });
       }
    }

    // CRITICAL: Google AI Protocol Enforcement
    // The very first message in history MUST be from the 'user'.
    while (history.length > 0 && history[0].role !== "user") {
      history.shift();
    }

    // Ensure we have something left
    if (history.length === 0) {
      history.push({ role: "user", parts: [{ text: "Hello" }] });
    }

    // Ensure the last message is from User to be used as final prompt
    if (history[history.length - 1].role === "model") {
       history.pop();
    }

    const lastMessage = history.length > 0 ? history.pop().parts[0].text : "What can you do?";
    const chat = model.startChat({ history });

    console.log("[IZUKI-API] Starting stream with Pro Engine...");
    const result = await chat.sendMessageStream(lastMessage);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          console.error("[IZUKI-API] Stream runtime error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error: any) {
    console.error("[IZUKI-API] Fatal Failure:", error);
    return NextResponse.json({ 
      error: "High-IQ Engine Failure", 
      message: error.message 
    }, { status: 500 });
  }
}
