# izuki.labs Pricing Page Implementation Plan

3: > **For Antigravity:** Use superpowers to implement this premium design plan autonomously.


**Goal:** Build a premium, Awwwards-grade social media pricing page for `izuki.labs` at `/SocialmediaPackage`, replicating the complex image-stacking animations and aesthetics of `nickzoutendijk.nl`.

**Architecture:** Next.js 15 (React 19) + Tailwind v4 + Framer Motion. Uses a Supabase Knowledge Base for AI-driven chat and lead collection.

**Tech Stack:**
- **Core**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix Colors (HSL), Shadcn/UI
- **Motion**: Framer Motion (for stack physics), GSAP (for scroll orchestration)
- **Connectors**: Motion Primitives CLI, 21st.dev Magic (Discovery Pulse)
- **Backend**: Supabase (Database, Edge Functions for Chatbot)

---

### Phase 1: Foundation & Alpha Sovereignty
**Goal:** Initialize the project and establish the "Liquid Glass" design system.

#### Task 1: Initialize Project
**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`

**Step 1**: Run `npx -y create-next-app@latest . --ts --tailwind --eslint --app`
**Step 2**: Install animation libraries: `npm install framer-motion gsap lucide-react @supabase/supabase-js`
**Step 3**: Configure Tailwind v4 with HSL variables mapped to Radix scales.
**Step 4**: Commit.

#### Task 2: Setup Design Tokens (Radix + HSL)
**Files:**
- Create: `src/styles/globals.css`
- Create: `src/lib/utils.ts` (CN helper)

**Step 1**: Define `--background: 240 10% 3.9%` (Deep Black) and `--foreground: 0 0% 98%`.
**Step 2**: Add grain texture and noise overlay utilities.
**Step 3**: Commit.

---

### Phase 2: The "Interactive Stack" (Hero)
**Goal:** Replicate the Nick Zoutendijk unstack/restack image sequence.

#### Task 3: ExperienceStack Component
**Files:**
- Create: `src/components/ExperienceStack.tsx`

**Step 1**: Use `1.JPG` as the flagship card (flagship image).
**Step 2**: Map images 2-7 into a `motion.div` array.
**Step 3**: Implement the 4-phase animation loop (Unstack -> Iterate -> Push -> Restack).
**Step 4**: Apply 3D tilt tracking using `useMotionValue` and `useTransform`.
**Step 5**: Commit.

---

### Phase 3: Awwwards-Grade UX
**Goal:** Add the "Liquid Cursor" and "Rolling Text" motifs.

#### Task 4: LiquidCursor Component
**Files:**
- Create: `src/components/LiquidCursor.tsx`

**Step 1**: Implement custom dot cursor with spring inertia.
**Step 2**: Add "VIEW" mode morph for hover states on `ExperienceStack` cards.
**Step 3**: Commit.

#### Task 5: SpinningCircle Motif
**Files:**
- Create: `src/components/SpinningCircle.tsx`

**Step 1**: Create a circular SVG path with `textPath` for "CONTACT IZUKI.LABS • GET IN TOUCH •".
**Step 2**: Animate rotation 360deg loop.
**Step 3**: Commit.

---

### Phase 4: Pricing & Lead Collection
**Goal:** Build the interactive pricing matrix and chatbot.

#### Task 6: PricingMatrix Tiered Layout
**Files:**
- Create: `src/components/PricingMatrix.tsx`

**Step 1**: Implement the 3-column layout (Basic, Remote Designer, Starter).
**Step 2**: Add the "Best Value" highlight and collapsible add-ons sections.
**Step 3**: Commit.

#### Task 7: LeadChatbot (Supabase Bridge)
**Files:**
- Create: `src/components/Chatbot.tsx`

**Step 1**: Build the floating chat bubble.
**Step 2**: Implement the lead capture form (Name, Phone, Email).
**Step 3**: Add the knowledge-base search logic for your pricing/policies.
**Step 4**: Commit.

---

### Phase 5: Highlighting & Polish
**Goal:** The Invision Africa slider and final page assembly.

#### Task 8: HighlightSlider (Before/After)
**Files:**
- Create: `src/components/HighlightSlider.tsx`

**Step 1**: Implement the interactive handle slider between `Before.jpg` and `After.jpg`.
**Step 2**: Add the "Invision Africa Case Study" copy.
**Step 3**: Commit.

#### Task 9: Page Assembly & Routing
**Files:**
- Create: `src/app/SocialmediaPackage/page.tsx`
- Create: `src/app/page.tsx` (Under Construction)

**Step 1**: Assemble all components into the `/SocialmediaPackage` route.
**Step 2**: Setup the root redirect.
**Step 3**: Final verification.

---

**Plan complete and saved to `docs/plans/2026-04-13-izuki-labs-pricing.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
