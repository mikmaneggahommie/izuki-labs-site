import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { studioSystemPrompt } from "@/lib/studio-concierge";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, userInfo } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY missing");
      return NextResponse.json({ error: "API Key Missing" }, { status: 500 });
    }

    // Initialize Stable v0.x SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", // High Intelligence Pro Engine
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      }
    });

    const systemPromptCombined = `${studioSystemPrompt}

VITAL INSTRUCTIONS:
- Name: ${userInfo?.name || "Unknown"}
- Telegram: ${userInfo?.telegram || "Unknown"}
- Phone: ${userInfo?.phone || "Unknown"}
- Email: ${userInfo?.email || "Unknown"}
- Design Mode: Brutalist, high-contrast, mechanical.
- RESPONSE: Direct, human-like, non-robotic.
`.trim();

    // 1. Role Sanitizer (Restored Armor V5 Protocol)
    const history: any[] = [
      { role: "user", parts: [{ text: systemPromptCombined }] },
      { role: "model", parts: [{ text: "Understood. I am your High-IQ design partner. I follow all pricing rules precisely." }] },
    ];

    // Manually reconstruct history to guarantee alternation
    for (const m of messages) {
      const currentRole = m.role === "assistant" ? "model" : "user";
      const lastItem = history[history.length - 1];
      
      if (lastItem.role === currentRole) {
        // Merge consecutive roles to prevent 400 errors
        lastItem.parts[0].text += "\n" + m.content;
      } else {
        history.push({ role: currentRole, parts: [{ text: m.content }] });
      }
    }

    // Ensure the last message in history is the model, and we send the NEW user input separately
    // Or just pop the last message if it's user and send it as the prompt
    if (history[history.length - 1].role === "user") {
      const userMessage = history.pop().parts[0].text;
      
      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(userMessage);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) controller.enqueue(encoder.encode(text));
            }
            controller.close();
          } catch (err: any) {
            console.error("Stream reader error:", err);
            controller.error(err);
          }
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return NextResponse.json({ error: "Invalid message history" }, { status: 400 });

  } catch (error: any) {
    console.error("Iron Reset Critical Error:", error);
    return NextResponse.json({ 
      error: "High-IQ Connection Failed", 
      message: error.message 
    }, { status: 500 });
  }
}
