import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, telegram, phone, email } = (await req.json()) as {
      name?: string;
      telegram?: string;
      phone?: string;
      email?: string;
    };

    if (!name && !phone && !email && !telegram) {
      return NextResponse.json(
        { error: "No lead information provided" },
        { status: 400 }
      );
    }

    // 1. Log to Google Sheets via Composio API (v3.1)
    const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
    const SPREADSHEET_ID = "1DgP1WdGULNf2RMJ1QZPpv9M3yKD_BhLSIct5F_JQHvw";
    
    if (COMPOSIO_API_KEY) {
      try {
        const sheetResponse = await fetch(`https://backend.composio.dev/api/v3.1/tools/execute/GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND`, {
          method: "POST",
          headers: { 
            "x-api-key": COMPOSIO_API_KEY,
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            arguments: {
              spreadsheetId: SPREADSHEET_ID,
              range: "Sheet1!A:E",
              valueInputOption: "USER_ENTERED",
              values: [[name, email, phone, telegram, new Date().toISOString()]]
            }
          }),
        });

        if (!sheetResponse.ok) {
          const errorData = await sheetResponse.text();
          console.error("Composio API Error Payload:", errorData);
          throw new Error(`Composio Error: ${sheetResponse.status}`);
        }
      } catch (sheetErr) {
        console.error("Composio Google Sheets Logging Failed:", sheetErr);
      }
    }

    // 2. Ping Telegram
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && telegramChatId) {
      const message = `🚀 *NEW STUDIO LEAD* 🚀\n\n*Name:* ${name || "N/A"}\n*Telegram:* ${telegram || "N/A"}\n*Phone:* ${phone || "N/A"}\n*Email:* ${email || "N/A"}\n\n_Lead logged to Dashboard._`;
      
      try {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
            parse_mode: "Markdown",
          }),
        });
      } catch (err) {
        console.error("Telegram notification failed:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Lead API Error:", error);
    return NextResponse.json(
      { error: "Failed to process lead" },
      { status: 500 }
    );
  }
}
