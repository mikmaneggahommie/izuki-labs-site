import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function list() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in .env.local");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const models = await genAI.listModels();
    console.log("AVAILABLE MODELS:");
    models.models.forEach(m => {
      console.log(`- ${m.name} (${m.displayName})`);
    });
  } catch (err) {
    console.error("Error listing models:", err.message);
  }
}
list();
