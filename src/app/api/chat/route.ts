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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const lastMessage = messages[messages.length - 1]?.content ?? "";

    const systemPrompt = `${studioSystemPrompt}

Known visitor details:
- Name: ${userInfo?.name || "Unknown"}
- Phone: ${userInfo?.phone || "Unknown"}
- Email: ${userInfo?.email || "Unknown"}

IMPORTANT: 
- Stay strictly within the Izuki Labs knowledge base. 
- Output your conversational reply first.
- ONLY when you are completely finished with the reply, output the delimiter "@@@INFO_EXTRACTED@@@" followed by the JSON object with the extracted info.
`.trim();

    const conversationHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [{ text: "Understood. I am now acting as the interactive assistant for the izuki.labs website. I will use the established knowledge base and the @@@INFO_EXTRACTED@@@ delimiter for data." }],
        },
        ...conversationHistory,
      ],
    });

    const result = await chat.sendMessageStream(lastMessage);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: unknown) {
    console.error("Gemini Streaming Error:", error);
    return NextResponse.json({ error: "Failed to process stream" }, { status: 500 });
  }
}
