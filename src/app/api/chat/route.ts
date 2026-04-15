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
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
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
- If asked about "20k plan", refer to the Remote Designer.
- Keep responses under 3 sentences unless technical details are requested.
- Maintain a sharp, premium, and calm tone.
`;

    // Format the conversation history for Gemini (excluding the final message which is sent below)
    const conversationHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I am now acting as the Izuki Labs studio concierge. I will be direct, systems-focused, and premium in my advice.",
            },
          ],
        },
        ...conversationHistory,
      ],
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;

    return NextResponse.json({
      role: "assistant",
      content: response.text(),
    });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
