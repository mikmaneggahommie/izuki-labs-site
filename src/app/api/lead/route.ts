import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { name, phone, email } = (await req.json()) as {
      name: string;
      phone: string;
      email: string;
    };

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert lead into Supabase
    const { error } = await supabase.from("leads").insert([
      { name, phone, email },
    ]);

    if (error) {
      console.error("Supabase Error saving lead:", error);
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 500 }
      );
    }

    // Ping the user's Telegram immediately
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && telegramChatId) {
      const message = `🚨 *NEW STUDIO LEAD* 🚨\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email}\n\n_Lead secured and saved to Supabase._`;
      
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
