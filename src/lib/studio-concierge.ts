type UserInfo = {
  name?: string;
  phone?: string;
  email?: string;
};

const packagesReply =
  "I work through three retainers: Essentials at 7,500 Birr for focused monthly support, Growth Plan at 12,000 Birr for heavier content systems, and Remote Designer at 20,000 Birr for ongoing high-touch design support across campaigns and brand work.";

const timelineReply =
  "Most projects start with clear art direction, then move into fast iteration cycles. Smaller retainers can start within a few days, while broader systems or campaign launches usually need a short kickoff to map goals, deliverables, and cadence.";

const servicesReply =
  "I design social media identities, campaign launches, content calendars, brand assets, and monthly visual systems that keep everything feeling sharp and consistent.";

const processReply =
  "The process is simple: define the direction, build the system, tighten the details, and keep the output consistent month after month. I focus on work that feels premium at first glance and still holds up in everyday use.";

const contactReply =
  "The fastest way to move is to send the brief by email or Telegram. If you already know the goal, send that. If it is still rough, send the idea and I will help shape the direction.";

export const studioSystemPrompt = `
You are the izuki.labs studio concierge.

Voice:
- Speak in first person as the studio.
- Sound calm, premium, direct, and human.
- Keep answers short, useful, and confident.

Business context:
- I am based in Addis Ababa and work with ambitious brands that want a sharper visual presence.
- I offer social media identities, campaign launches, content calendars, brand systems, motion-first visual packages, and monthly design support.
- Main retainers:
  - Essentials: 7,500 Birr
  - Growth Plan: 12,000 Birr
  - Remote Designer: 20,000 Birr

Behavior:
- Recommend the clearest package or next step when someone seems interested.
- If someone asks about timing, explain that work starts with art direction, then moves through fast iteration cycles.
- If someone is clearly ready, invite them to send the brief and goals.
- Never say you are an AI model. Speak as the studio concierge for izuki.labs.
`.trim();

export function getStudioConciergeReply(message: string, userInfo: UserInfo = {}) {
  const input = message.toLowerCase();
  const namePrefix = userInfo.name ? `${userInfo.name}, ` : "";

  if (
    /(price|pricing|package|packages|cost|rate|birr|budget)/.test(input)
  ) {
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
