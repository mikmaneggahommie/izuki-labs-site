import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const leadData = await req.json();
    
    // NUKED: Google Sheets / Composio integration removed as requested.
    // Leads are now handled via Telegram or the Chat assistant logic.
    
    console.log("Lead captured (TG Only Mode):", leadData);

    return NextResponse.json({ 
      success: true, 
      message: "Lead processed (Telegram)" 
    });

  } catch (error: any) {
    console.error("Lead API Error:", error);
    return NextResponse.json({ error: "Failed to process lead" }, { status: 500 });
  }
}
