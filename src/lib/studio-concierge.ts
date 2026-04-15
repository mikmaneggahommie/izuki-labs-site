type UserInfo = {
  name?: string;
  phone?: string;
  email?: string;
};

const packagesReply =
  "I offer three monthly retainers: Essentials (7,500 Birr) for focused support, Growth (12,000 Birr) for content systems, and the Remote Designer (20,000 Birr) which includes unlimited posts, source files, and content calendar collaboration.";

const remoteDesignerReply =
  "The Remote Designer plan (20,000 Birr/month) is my highest-tier support. It includes unlimited single-image posts, up to 10 carousels per month, source files, priority 24-48h turnaround, and support across all platforms including TikTok and LinkedIn.";

const timelineReply =
  "Standard turnaround is 24-48 hours for Remote Designer and Growth plans, and 72 hours for Essentials. Most projects kickoff within 3-5 days once the system is defined.";

const servicesReply =
  "I specialize in social media identities, high-fidelity campaign launches, content calendars, and brand systems. I focus on motion-first visual packages that stay consistent across Instagram, Telegram, TikTok, and more.";

const processReply =
  "We work on a sequential queue: I handle up to 2 active tasks at a time to ensure maximum quality. You get unlimited revisions within the original scope on the Remote Designer plan.";

const contactReply =
  "The best way to start is by sending your brief to it.mikiyas.daniel@gmail.com or messaging me directly on Telegram @snowplugwalk. We can hop on a call once the direction is clear.";

export const studioSystemPrompt = `
You are an intelligent, direct design partner for izuki.labs. Your goal is to provide precise information about our monthly design support systems.

Voice:
- Speak in first person as the studio.
- Sound calm, premium, direct, and intelligent.
- Keep answers short, useful, and confident.
- Do not use the title "Studio Concierge".
- DO NOT answer questions outside the scope of Izuki Labs services.

=== START KNOWLEDGE BASE ===
# 📘 Design Service Knowledge Base

# 🧾 OVERVIEW
**Service Model:** Fixed Monthly Retainer
Clients pay a monthly fee for ongoing design support based on their selected package.

# 📦 PACKAGES

## 🟢 Remote Designer (Best Value) — 20,000 Birr / month
### Includes:
* Unlimited single-image social media posts (fair use)
* Unlimited revisions
* 24–48 hour turnaround (queue-based)
* Up to 2 active tasks at a time
* All platforms: Instagram, Facebook, TikTok, LinkedIn, Telegram
* Stories & Reels covers included
* Carousels: Max 10/month (max 6 slides/each)
* Source files included (PSD, Illustrator, etc.)
### Add-Ons for Remote Designer:
- Logo Design: 2,500 Birr
- YouTube Thumbnail: 300 Birr
- Brand Identity Kit: 4,500 Birr
- Extra Fast Delivery (<12 hrs): 500 Birr

## 🔵 Growth Plan — 12,000 Birr / month
### Includes:
* Up to 12 posts/month
* 3 revision rounds per design
* 48-hour turnaround per post
* Instagram & Telegram only
* No stories, carousels, or source files
### Add-Ons for Growth Plan:
- YouTube Thumbnail: 400 Birr
- Logo Design: 3,500 Birr
- Brand Identity Kit: 6,000 Birr
- Extra post: 1,350 Birr
- Rush (<24 hrs): 250 Birr

## ⚪ Essentials Plan — 7,500 Birr / month
### Includes:
* Up to 6 posts/month
* 2 revision rounds per design
* 72-hour turnaround per post
* Instagram & Telegram only (Static posts only)
### Add-Ons for Essentials Plan:
- YouTube Thumbnail: 500 Birr
- Logo Design: 4,000 Birr
- Brand Identity Kit: 7,000 Birr
- Extra post: 1,500 Birr

# 📐 DEFINITIONS
- **Standard Post:** Single-image design (Promos, Quotes, Announcements).
- **Non-Standard:** Carousels, Logos, Branding, YouTube thumbnails (Add-ons).

# 🔄 POLICIES
- **Revisions:** Text/Color/Minor tweaks. New concepts = New requests.
- **Workflow:** Max 2 active tasks. Sequential queue.
- **Fair Use:** Unlimited volume over time, not simultaneous work.
=== END KNOWLEDGE BASE ===

REASONING & EXTRACTION RULES:
1. **Greetings vs. Identity**: If a user says "hi", "hello", or "hey", treat it as a greeting. DO NOT assume their name is "hi". 
2. **JSON OUTPUT**: ALWAYS return JSON:
{
  "reply": "Your message...",
  "extractedInfo": { "name": "...", "phone": "...", "email": "..." }
}
`.trim();

export function getStudioConciergeReply(message: string, userInfo: UserInfo = {}) {
  // Lightweight fallback if the AI fails
  const input = message.toLowerCase();
  const namePrefix = userInfo.name ? `${userInfo.name}, ` : "";

  if (/(thumbnail|youtube thumb)/.test(input)) {
    return `${namePrefix}I design performance-focused YouTube thumbnails. Pricing is tiered: 300 Birr for Remote Designer clients, up to 500 Birr on the Essentials plan. Which package are you using?`;
  }

  if (/(20k|20,000|remote|best value)/.test(input)) {
    return `${namePrefix}The Remote Designer plan (20,000 Birr/month) includes unlimited social media posts, source files, and 24-48h turnaround.`;
  }

  if (/(price|pricing|package|packages|cost|rate|birr|budget)/.test(input)) {
    return `${namePrefix}I offer three monthly retainers: Essentials (7,500 Birr), Growth (12,000 Birr), and Remote Designer (20,000 Birr).`;
  }

  if (/(hello|hi|hey)/.test(input)) {
    return `${namePrefix}How can I help with your design systems today? I can guide you through pricing, timelines, or the best package for your brand.`;
  }

  return `${namePrefix}I build visual systems that make brands feel sharper and harder to ignore. Tell me what you need help with and I can recommend the right package.`;
}


/**
 * Heuristic check to see if a user message is likely a question or intent 
 * rather than a specific data point (like a phone number or email).
 */
export function isLikelyQuestion(message: string): boolean {
  const input = message.trim().toLowerCase();
  
  // If it's very long, it's probably a message/question
  if (input.length > 25) return true;
  
  // Common question words/starters
  const questionWords = ["how", "what", "where", "when", "why", "who", "can", "could", "is", "are", "do", "does", "tell", "much", "price"];
  const words = input.split(/\s+/);
  
  if (questionWords.includes(words[0])) return true;
  
  // Contains common question punctuation
  if (input.includes("?") || input.includes("pricing") || input.includes("cost")) return true;
  
  // If it has spaces and isn't clearly a phone/email, it might be a sentence
  if (words.length >= 3) return true;

  return false;
}
