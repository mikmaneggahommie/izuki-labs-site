import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const leadData = await req.json();
    
    // 1. Telegram Restoration (Armor V11)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const message = `
<b>🚨 NEW LEAD: IZUKI LABS</b>
----------------------
<b>👤 Name:</b> ${leadData.name || 'N/A'}
<b>📧 Email:</b> ${leadData.email || 'N/A'}
<b>📱 Phone:</b> ${leadData.phone || 'N/A'}
<b>✈️ Telegram:</b> ${leadData.telegram || 'N/A'}
----------------------
`.trim();

      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
        });
        console.log("Lead sent to Telegram successfully.");
      } catch (tgError) {
        console.error("Telegram Delivery Failed:", tgError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Lead processed (Telegram)" 
    });

  } catch (error: unknown) {
    console.error("Lead API Error:", error);
    return NextResponse.json({ error: "Failed to process lead" }, { status: 500 });
  }
}
