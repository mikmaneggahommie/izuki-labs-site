import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as {
      messages: Array<{ role: string; content: string }>;
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

    const systemPrompt = `
      You are the izuki.labs AI Assistant.
      Tone: precise, calm, premium, and concise.

      Context:
      - Mikiyas Daniel offers social media design retainers from Addis Ababa.
      - Packages: Essentials (7,500 Birr), Growth Plan (12,000 Birr), Remote Designer (20,000 Birr).
      - Focus on systems, visual distinction, and brand consistency.

      Rules:
      1. Keep answers direct and useful.
      2. If someone is interested, encourage them to start a project or share their goals.
      3. Stay aligned with the premium, editorial voice of the site.
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
