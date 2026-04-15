import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { studioSystemPrompt } from "@/lib/studio-concierge";

// Vercel High-Stability Guard
export const maxDuration = 30;
export const dynamic = "force-dynamic";

// Armor V10: Explicit Key Resonance
// Correctly mapping the existing GEMINI_API_KEY to the official SDK
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, userInfo } = await req.json();

    // Verify key existence for diagnostics
    if (!process.env.GEMINI_API_KEY) {
      console.error("CRITICAL: GEMINI_API_KEY is missing from environment.");
      return new Response(JSON.stringify({ error: "API Key Missing" }), { status: 500 });
    }

    const systemInstructions = `${studioSystemPrompt}

VITAL INSTRUCTIONS:
- Name: ${userInfo?.name || "Unknown"}
- Telegram: ${userInfo?.telegram || "Unknown"}
- Phone: ${userInfo?.phone || "Unknown"}
- Email: ${userInfo?.email || "Unknown"}
- Response Mode: Brutalist, direct, human-like.
- PRIORITY: Follow all pricing/logo-addon rules from the Matrix of Truth.
`.trim();

    // Initialize the High-IQ Power Stream
    const result = await streamText({
      model: googleProvider('gemini-2.0-flash'), // Optimized 2.0 Engine
      system: systemInstructions,
      messages: messages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Returns the visible Text Stream for the ChatBubble typewriter
    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("Armor V10 Connection Error:", error);
    return new Response(
      JSON.stringify({ error: "Power Connection Interrupted", message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
