import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Extract the latest user message
    const lastMessage = messages[messages.length - 1].content;

    // Context / System Prompt for Izuki Labs
    const systemPrompt = `
      You are the Izuki Labs AI Assistant. Your tone is high-end, futuristic, minimalist, and professional. 
      You specialize in social media architecture, personal branding, and high-end graphic design.
      Izuki Labs offers:
      1. Monthly Social Media Management ($149/mo)
      2. Logo Design & Branding ($99/set)
      3. Video Editing & Reels ($79/vid)
      
      Your goal is to be helpful and secure leads. If someone asks deep questions, encourage them to use the lead form or contact the team.
      Keep responses concise and elegant.
    `;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Acknowledged. I am the Izuki Labs AI Assistant. How can I facilitate your brand architecture today?" }] },
      ],
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ role: "assistant", content: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
