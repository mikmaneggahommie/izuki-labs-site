import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import { studioSystemPrompt } from "@/lib/studio-concierge";

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
`;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I’ll answer with a premium, concise, systems-first tone.",
            },
          ],
        },
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
