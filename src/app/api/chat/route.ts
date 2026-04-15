import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
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

    const genAI = new GoogleGenerativeAI(apiKey);

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const modelIds = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];

    let result;
    let successModel = "";

    for (const modelId of modelIds) {
      try {
        console.log(`Trying model: ${modelId}`);
        const model = genAI.getGenerativeModel({ model: modelId, safetySettings });
        const lastMessage = messages[messages.length - 1]?.content ?? "";

        const systemPrompt = `${studioSystemPrompt}

Known visitor details:
- Name: ${userInfo?.name || "Unknown"}
- Telegram: ${userInfo?.telegram || "Unknown"}
- Phone: ${userInfo?.phone || "Unknown"}
- Email: ${userInfo?.email || "Unknown"}
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
              parts: [{ text: "Understood. I am now acting as the interactive assistant for the izuki.labs website." }],
            },
            ...conversationHistory,
          ],
        });

        result = await chat.sendMessageStream(lastMessage);
        successModel = modelId;
        break; // Success!
      } catch (err) {
        console.error(`Model ${modelId} failed:`, err);
        continue; // Try next move
      }
    }

    if (!result) {
      throw new Error("All model IDs failed to initialize. Check API key permissions.");
    }

    console.log(`Successfully connected using model: ${successModel}`);


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
