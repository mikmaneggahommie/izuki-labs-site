import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import { studioSystemPrompt } from "@/lib/studio-concierge";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, userInfo } = (await req.json()) as {
      messages: Array<{ role: string; content: string }>;
      userInfo?: { name?: string; phone?: string; email?: string };
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const lastMessage = messages[messages.length - 1]?.content ?? "";

    const systemPrompt = `${studioSystemPrompt}

Known visitor details:
- Name: ${userInfo?.name || "Unknown"}
- Phone: ${userInfo?.phone || "Unknown"}
- Email: ${userInfo?.email || "Unknown"}
`.trim();

    console.log("Initing chat with model: gemini-1.5-flash-latest");

    const conversationHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [{ text: "Understood. I am now acting as the interactive assistant for the izuki.labs website." }],
        },
        ...conversationHistory,
      ],
    });

    const result = await chat.sendMessageStream(lastMessage);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (streamErr: any) {
          console.error("Stream generation error:", streamErr);
          controller.error(streamErr);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Gemini API Route Error:", error);
    return NextResponse.json({ 
      error: "Failed to process stream", 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}
