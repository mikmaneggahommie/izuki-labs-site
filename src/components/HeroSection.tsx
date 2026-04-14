"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { assetPath } from "@/lib/asset-path";

/* ─── Card data ─── */
type HeroCard = { src: string; alt: string };

const GROUP_A: HeroCard[] = [
  { src: "/images/1.JPG", alt: "Editorial surface artwork" },
  { src: "/images/2.jpg", alt: "Campaign detail artwork" },
  { src: "/images/6.jpg", alt: "Launch artwork" },
  { src: "/images/4.jpg", alt: "Brand composition artwork" },
  { src: "/images/5.jpg", alt: "Poster layout artwork" },
  { src: "/images/3.jpg", alt: "Mobile system artwork" },
];

const GROUP_B: HeroCard[] = [
  { src: "/images/7.jpg", alt: "Luminous motion artwork" },
  { src: "/images/5.jpg", alt: "Print layout artwork" },
  { src: "/images/2.jpg", alt: "Feed design artwork" },
  { src: "/images/4.jpg", alt: "Graphic composition artwork" },
  { src: "/images/1.JPG", alt: "Brand motion artwork" },
  { src: "/images/6.jpg", alt: "Immersive launch artwork" },
];

const GROUPS = [GROUP_A, GROUP_B];

/* ─── Timing constants ─── */
const T_HOLD     = 0.5;   // pause on stacked state before unstacking
const T_UNSTACK  = 1.0;   // Phase 1: fan out
const T_PUSH     = 2.6;   // Phase 2: vertical conveyor push (fanned state held)
const T_SNAP     = 0.65;  // Phase 3: consolidation snap-back

export default function HeroSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let alive = true;
    let teardown: (() => void) | undefined;

    const boot = async () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!stageRef.current) return;

      const gsap = (await import("gsap")).default;
      if (!alive) return;

      const [wrapA, wrapB] = groupRefs.current;
      if (!wrapA || !wrapB) return;

      const cardsA = Array.from(wrapA.querySelectorAll<HTMLElement>("[data-ci]"));
      const cardsB = Array.from(wrapB.querySelectorAll<HTMLElement>("[data-ci]"));
      if (!cardsA.length || !cardsB.length) return;

      let tl: ReturnType<typeof gsap.timeline> | undefined;
      let resizeId: number | undefined;

      /* ── Responsive metrics ── */
      const measure = () => {
        const stage = stageRef.current!.getBoundingClientRect();
        const card  = cardsA[0].getBoundingClientRect();
        const n     = cardsA.length;

        // Diagonal step between fanned cards (top-left → bottom-right)
        const stepX = Math.max(card.width * 0.48, Math.min(stage.width * 0.11, card.width * 0.7));
        const stepY = Math.max(card.height * 0.18, Math.min(stage.height * 0.13, card.height * 0.28));

        // Total span of the fan + travel distance for the push
        const fanSpanY = stepY * (n - 1) + card.height;
        // Push distance = enough to move entire fan off viewport + bring next one in
        const pushY = fanSpanY + stage.height * 0.1;

        return { stepX, stepY, pushY, n };
      };

      /* ── Fan position for a single card ── */
      const fanPos = (i: number, count: number, m: ReturnType<typeof measure>) => {
        const dist = count - 1 - i; // 0 = anchor (stays put), higher = further top-left
        return {
          x: -dist * m.stepX,
          y: -dist * m.stepY,
          z: -dist * 20,
          rotationX: dist === 0 ? 0 : 1.5,
          rotationY: dist === 0 ? 0 : -8,
          rotationZ: dist === 0 ? 0 : 3.8,
        };
      };

      /* ── Apply states ── */
      const setStack = (cards: HTMLElement[]) => {
        cards.forEach((el, i) => {
          gsap.set(el, {
            x: 0, y: 0, z: -i * 8,
            rotationX: 0, rotationY: 0, rotationZ: 0,
            transformPerspective: 1800,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      };

      const setFan = (cards: HTMLElement[], m: ReturnType<typeof measure>) => {
        cards.forEach((el, i) => {
          const p = fanPos(i, cards.length, m);
          gsap.set(el, {
            ...p,
            transformPerspective: 1800,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      };

      /* ── Build the master loop ── */
      const buildTimeline = () => {
        tl?.kill();
        const m = measure();

        // ═══ INITIAL STATE ═══
        // Group A: stacked at anchor (visible)
        // Group B: already FANNED, sitting below viewport (ready to push up)
        setStack(cardsA);
        setFan(cardsB, m);

        gsap.set(wrapA, { y: 0, autoAlpha: 1 });
        gsap.set(wrapB, { y: m.pushY, autoAlpha: 1 });

        tl = gsap.timeline({ repeat: -1 });

        /* ════════════════════════════════════════════════
           CYCLE 1: A unstacks → push up → B consolidates
           ════════════════════════════════════════════════ */

        // Hold: show the clean stack briefly
        tl.to({}, { duration: T_HOLD });

        // PHASE 1 — UNSTACK: Group A fans out (power4.out — snappy mechanical burst)
        tl.addLabel("unstack-a")
          .to(cardsA, {
            x: (i: number) => fanPos(i, cardsA.length, m).x,
            y: (i: number) => fanPos(i, cardsA.length, m).y,
            z: (i: number) => fanPos(i, cardsA.length, m).z,
            rotationX: (i: number) => fanPos(i, cardsA.length, m).rotationX,
            rotationY: (i: number) => fanPos(i, cardsA.length, m).rotationY,
            rotationZ: (i: number) => fanPos(i, cardsA.length, m).rotationZ,
            duration: T_UNSTACK,
            ease: "power4.out",
            stagger: { each: 0.07, from: "start" },
          }, "unstack-a");

        // PHASE 2 — HEAVY PUSH: Move both wrappers UP. Cards stay fanned.
        // Group A goes UP and out. Group B rises from below (already fanned).
        // Linear / power1.inOut = conveyor belt feel. Zero gap between groups.
        tl.addLabel("push-a", `unstack-a+=${T_UNSTACK + 0.15}`)
          .to(wrapA, {
            y: -m.pushY,
            duration: T_PUSH,
            ease: "power1.inOut",
          }, "push-a")
          .to(wrapB, {
            y: 0,
            duration: T_PUSH,
            ease: "power1.inOut",
          }, "push-a");

        // PHASE 3 — CONSOLIDATION: Group B snaps its fanned cards back into a stack.
        // This starts AFTER the push lands Group B at anchor position.
        // back.in(1.7) = magnetic snap-back.
        tl.addLabel("snap-b", `push-a+=${T_PUSH - 0.1}`)
          .to(cardsB, {
            x: 0, y: 0,
            z: (i: number) => -i * 8,
            rotationX: 0, rotationY: 0, rotationZ: 0,
            duration: T_SNAP,
            ease: "back.in(1.7)",
            stagger: { each: 0.035, from: "end" },
          }, "snap-b");

        // RESET A: teleport offscreen below, re-fan for next cycle
        tl.addLabel("reset-a", `snap-b+=${T_SNAP}`)
          .call(() => {
            setFan(cardsA, m);
            gsap.set(wrapA, { y: m.pushY });
          }, undefined, `reset-a`);

        /* ════════════════════════════════════════════════
           CYCLE 2: B unstacks → push up → A consolidates
           ════════════════════════════════════════════════ */

        tl.to({}, { duration: T_HOLD });

        tl.addLabel("unstack-b")
          .to(cardsB, {
            x: (i: number) => fanPos(i, cardsB.length, m).x,
            y: (i: number) => fanPos(i, cardsB.length, m).y,
            z: (i: number) => fanPos(i, cardsB.length, m).z,
            rotationX: (i: number) => fanPos(i, cardsB.length, m).rotationX,
            rotationY: (i: number) => fanPos(i, cardsB.length, m).rotationY,
            rotationZ: (i: number) => fanPos(i, cardsB.length, m).rotationZ,
            duration: T_UNSTACK,
            ease: "power4.out",
            stagger: { each: 0.07, from: "start" },
          }, "unstack-b");

        tl.addLabel("push-b", `unstack-b+=${T_UNSTACK + 0.15}`)
          .to(wrapB, {
            y: -m.pushY,
            duration: T_PUSH,
            ease: "power1.inOut",
          }, "push-b")
          .to(wrapA, {
            y: 0,
            duration: T_PUSH,
            ease: "power1.inOut",
          }, "push-b");

        tl.addLabel("snap-a", `push-b+=${T_PUSH - 0.1}`)
          .to(cardsA, {
            x: 0, y: 0,
            z: (i: number) => -i * 8,
            rotationX: 0, rotationY: 0, rotationZ: 0,
            duration: T_SNAP,
            ease: "back.in(1.7)",
            stagger: { each: 0.035, from: "end" },
          }, "snap-a");

        tl.addLabel("reset-b", `snap-a+=${T_SNAP}`)
          .call(() => {
            setFan(cardsB, m);
            gsap.set(wrapB, { y: m.pushY });
          }, undefined, `reset-b`);
      };

      buildTimeline();

      const onResize = () => {
        window.clearTimeout(resizeId);
        resizeId = window.setTimeout(buildTimeline, 150);
      };
      window.addEventListener("resize", onResize);

      teardown = () => {
        window.removeEventListener("resize", onResize);
        window.clearTimeout(resizeId);
        tl?.kill();
      };
    };

    void boot();
    return () => { alive = false; teardown?.(); };
  }, []);

  return (
    <section id="top" className="section-shell hero-shell">
      <div className="content-shell hero-viewport">
        <div className="hero-copy">
          <h1 className="hero-wordmark" aria-label="Izuki Labs">
            <span className="hero-wordmark-line">
              <span>IZUKI</span>
              <span className="hero-wordmark-dot" aria-hidden />
            </span>
            <span className="hero-wordmark-line">LABS</span>
          </h1>
        </div>

        <div
          ref={stageRef}
          className="hero-stage"
          aria-label="Automated portfolio animation"
        >
          {GROUPS.map((group, gi) => (
            <div
              key={`group-${gi}`}
              ref={(node) => { groupRefs.current[gi] = node; }}
              className="hero-unit"
            >
              {group.map((card, ci) => (
                <article
                  key={`${card.src}-${ci}`}
                  className="hero-card"
                  data-ci={ci}
                  style={{ zIndex: ci + 1 }}
                >
                  <Image
                    src={assetPath(card.src)}
                    alt={card.alt}
                    fill
                    priority={gi === 0 && ci === group.length - 1}
                    sizes="(max-width: 767px) 42vw, (max-width: 1023px) 28vw, 360px"
                    className="hero-card-image"
                  />
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
