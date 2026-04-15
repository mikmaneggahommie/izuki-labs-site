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
You are the izuki.labs studio concierge.

Voice:
- Speak in first person as the studio.
- Sound calm, premium, direct, and human.
- Keep answers short, useful, and confident.
- Do not dump the entire package list unless specifically asked. Instead, recommend the best package based on their needs.
- Never say you are an AI model. Speak as the studio concierge for izuki.labs.
- DO NOT answer questions outside the scope of Izuki Labs services.
- If asked about "20k plan" or "best value", refer to the Remote Designer package.

Business context:
- I am based in Addis Ababa and work with ambitious brands that want a sharper visual presence.
- I offer social media identities, campaign launches, content calendars, brand systems, motion-first visual packages, and monthly design support.

Below is the strict Internal Knowledge Base regarding our packages, addons, and policies. ALWAYS use these prices, features, and policies. Do never make up pricing or features.

=== START KNOWLEDGE BASE ===
# 🧾 OVERVIEW
**Service Model:** Fixed Monthly Retainer
Clients pay a monthly fee for ongoing design support based on their selected package.

# 📦 PACKAGES

## 🔴 Remote Designer (20,000 Birr / month) — Best Value
### Includes:
* Unlimited single-image social media posts (fair use applies)
* Unlimited revisions (within original request scope)
* 24–48 hour turnaround per request (queue-based)
* Up to 2 active tasks at a time
* All platforms: Instagram, Facebook, TikTok, LinkedIn, Telegram
* Stories & Reels covers included
* Carousel designs included:
  * Max 10 full carousels/month
  * Max 6 slides per carousel
* Monthly content calendar collaboration
* Source files included (PSD, Illustrator, etc.)

### Discounted Add-Ons:
* Logo Design: 2,500 Birr | Brand Identity Kit: 4,500 Birr

## 🔵 Growth Plan (12,000 Birr / month)
### Includes:
* Up to 12 posts/month | 3 revision rounds | 48-hour turnaround
* Instagram & Telegram only | No stories or carousels

## ⚪ Essentials Plan (7,500 Birr / month)
### Includes:
* Up to 6 posts/month | 2 revision rounds | 72-hour turnaround
* Static posts only (no stories, no carousels)

# 🔄 WORKFLOW
- Max 2 active tasks at a time. Work is completed sequentially.
- Revisions include text, color, and minor layout tweaks. Major direction changes are new requests.
=== END KNOWLEDGE BASE ===
`.trim();

export function getStudioConciergeReply(message: string, userInfo: UserInfo = {}) {
  const input = message.toLowerCase();
  const namePrefix = userInfo.name ? `${userInfo.name}, ` : "";

  if (/(20k|20,000|remote|best value)/.test(input)) {
    return `${namePrefix}${remoteDesignerReply}`;
  }

  if (/(price|pricing|package|packages|cost|rate|birr|budget)/.test(input)) {
    return `${namePrefix}${packagesReply}`;
  }

  if (/(timeline|time|turnaround|delivery|start|deadline)/.test(input)) {
    return `${namePrefix}${timelineReply}`;
  }

  if (
    /(service|services|offer|do you do|identity|branding|campaign|content|social media|motion)/.test(
      input
    )
  ) {
    return `${namePrefix}${servicesReply}`;
  }

  if (/(process|workflow|how do you work|revision|revisions|support)/.test(input)) {
    return `${namePrefix}${processReply}`;
  }

  if (/(contact|email|telegram|phone|reach|book|brief)/.test(input)) {
    return `${namePrefix}${contactReply}`;
  }

  if (/(hello|hi|hey)/.test(input)) {
    return `${namePrefix}I can help with pricing, timelines, packages, and the best way to structure the work. Tell me what you are building and I will point you in the right direction.`;
  }

  return `${namePrefix}I build visual systems that make brands feel sharper, cleaner, and harder to ignore. Tell me what you need help with and I can recommend the right package, timeline, and next step.`;
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
