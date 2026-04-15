import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { studioSystemPrompt } from "@/lib/studio-concierge";

// VERCEL STABILITY CONFIG
export const dynamic = "force-dynamic";
export const maxDuration = 30; // 30s Guard

export async function POST(req: Request) {
  try {
    const { messages, userInfo } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY missing");
      return NextResponse.json({ error: "API Key Missing" }, { status: 500 });
    }

    const systemPromptCombined = `${studioSystemPrompt}

VITAL CONTEXT (USER DATA):
- Name: ${userInfo?.name || "Unknown"}
- Telegram: ${userInfo?.telegram || "Unknown"}
- Phone: ${userInfo?.phone || "Unknown"}
- Email: ${userInfo?.email || "Unknown"}
- Persona: Brutalist Design Concierge.
- Rules: Follow the provided "Matrix of Truth" pricing and logo-addon rules exactly.
`.trim();

    // 1. Initialize with System Instruction (ROOT CAUSE FIX)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Use Flash for ultra-fast Vercel response
      systemInstruction: systemPromptCombined, // Structural Heart of the AI
    });

    // 2. Pure History Sanitizer
    const history: any[] = [];
    
    // Add a specialized "Warm Up" message to the history if it's empty
    if (messages.length === 0) {
       history.push({ role: "user", parts: [{ text: "Hello" }] });
       history.push({ role: "model", parts: [{ text: "Welcome to Izuki Labs. I am your concierge. How can I help with your design systems today?" }] });
    } else {
       // Filter and alternate history turns
       for (const m of messages) {
          if (m.role === 'system') continue; // Never put system prompts in history
          const role = m.role === "assistant" ? "model" : "user";
          
          if (history.length > 0 && history[history.length - 1].role === role) {
             history[history.length - 1].parts[0].text += "\n" + m.content;
          } else {
             history.push({ role, parts: [{ text: m.content }] });
          }
       }
    }

    // Ensure the last message is from the user
    if (history.length > 0 && history[history.length - 1].role === "model") {
       history.pop();
    }

    const lastMessage = history.length > 0 ? history.pop().parts[0].text : "Hello";
    
    const chat = model.startChat({ 
      history,
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      }
    });

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
        } catch (err: any) {
          console.error("Final Stream Error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error: any) {
    console.error("Structural Connection Error:", error);
    return NextResponse.json({ 
      error: "Structural Failure", 
      message: error.message 
    }, { status: 500 });
  }
}
