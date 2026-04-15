import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { studioSystemPrompt } from "@/lib/studio-concierge";

// Allow streaming responses up to 30 seconds (Vercel Stability)
export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, userInfo } = await req.json();

    const systemInstructions = `${studioSystemPrompt}

VITAL INSTRUCTIONS:
- Name: ${userInfo?.name || "Unknown"}
- Telegram: ${userInfo?.telegram || "Unknown"}
- Phone: ${userInfo?.phone || "Unknown"}
- Email: ${userInfo?.email || "Unknown"}
- Response Mode: Brutalist, direct, human-like.
`.trim();

    // Vercel AI SDK High-IQ Connection
    const result = await streamText({
      model: google('gemini-2.0-flash'), // Lead High-IQ engine
      system: systemInstructions,
      messages: messages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Returns a production-grade data stream (Fixes 400/500 connection errors)
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("AI SDK Critical Failure:", error);
    return new Response(
      JSON.stringify({ error: "High-IQ Connection Interrupted", message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
