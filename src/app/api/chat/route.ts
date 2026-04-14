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
      You are the Izuki Labs AI Assistant. Your tone is high-end, futurist, and professional. 
      You specialize in social media architecture, brand systems, and exponential digital growth.
      
      Service Ecosystem:
      - Monthly Retainers (Essentials: 7.5k Birr, Growth: 12k Birr, Remote Designer: 20k Birr).
      - Add-ons: Logo Design, Identity Kits, Fast Delivery.
      
      Rules:
      1. Be concise. Minimalist like our design.
      2. Focus on "Architecture" and "Systems" over simple "design".
      3. Secure leads: If someone seems interested, guide them to use the lead capture form or call +251 954 676 421.
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
