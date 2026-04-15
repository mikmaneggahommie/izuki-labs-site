import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { NextResponse } from "next/server";
import { studioSystemPrompt } from "@/lib/studio-concierge";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, userInfo } = (await req.json()) as {
      messages: Array<{ role: string; content: string }>;
      userInfo?: { name?: string; telegram?: string; phone?: string; email?: string };
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

// Initialize New 2026 SDK
const genAI = new GoogleGenAI({ apiKey });

// Sanitizer to guarantee User/Model alternation (Mandatory for 2026 SDK)
function sanitizeContents(rawContents: any[]) {
  const sanitized: any[] = [];
  for (const item of rawContents) {
    if (sanitized.length > 0 && sanitized[sanitized.length - 1].role === item.role) {
      // Merge consecutive same-role messages
      sanitized[sanitized.length - 1].parts[0].text += "\n" + item.parts[0].text;
    } else {
      sanitized.push(item);
    }
  }
  // Ensure we start with User
  if (sanitized.length > 0 && sanitized[0].role === "model") {
    sanitized.shift();
  }
  return sanitized;
}

// Model IDs (2026 stabilized)
const modelIds = [
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-flash-preview",
  "gemini-1.5-pro",
  "gemini-1.5-flash"
];

let result;
let successModel = "";

const systemPrompt = `${studioSystemPrompt}

VITAL INSTRUCTIONS:
- Name: ${userInfo?.name || "Unknown"}
- Telegram: ${userInfo?.telegram || "Unknown"}
- Phone: ${userInfo?.phone || "Unknown"}
- Email: ${userInfo?.email || "Unknown"}
`.trim();

// Construct raw history
const rawContents = [
  { role: "user" as const, parts: [{ text: systemPrompt }] },
  { role: "model" as const, parts: [{ text: "Understood. I'm ready." }] },
  ...messages.map(m => ({
    role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
    parts: [{ text: m.content }]
  }))
];

// Sanitize for the strict 2026 backend
const contents = sanitizeContents(rawContents);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

for (const modelId of modelIds) {
  try {
    console.log(`Trying model: ${modelId}`);
    
    result = await genAI.models.generateContentStream({
      model: modelId,
      contents: contents,
      config: {
        safetySettings: safetySettings
      }
    });
    
    successModel = modelId;
    break; // Success!
  } catch (err: any) {
    console.error(`Model ${modelId} failed [Status ${err?.status}]:`, err?.message);
    continue;
  }
}


    if (!result) {
      throw new Error("All model IDs failed.");
    }

    console.log(`Connected via: ${successModel}`);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (streamErr: any) {
          console.error("Stream error:", streamErr);
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
    
    let clientMessage = "I'm having a bit of trouble connecting to the network.";
    
    // Specifically check for quota/rate limit errors (Free Tier limits)
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota")) {
      clientMessage = "Daily knowledge quota exceeded for the free tier. Please try again tomorrow or contact me directly.";
    } else if (error?.status === 404 || error?.message?.includes("404")) {
      clientMessage = "The assistant model is currently being updated. Please try again soon.";
    }

    return NextResponse.json({ 
      error: "Failed to process stream", 
      details: clientMessage,
      isQuotaError: error?.status === 429 || error?.message?.includes("quota")
    }, { status: 500 });
  }
}
