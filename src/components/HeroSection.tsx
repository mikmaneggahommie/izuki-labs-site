"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { assetPath } from "@/lib/asset-path";

/* ─── Card groups ─── */
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

/* ─── Timing ─── */
const T_HOLD    = 0.7;   // pause on stacked state
const T_UNSTACK = 1.0;   // fan out duration
const T_PUSH    = 2.8;   // conveyor push duration (cards stay fanned)
const T_SNAP    = 0.6;   // consolidation snap-back

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

      /* ── Compute responsive metrics ── */
      const measure = () => {
        const stage = stageRef.current!.getBoundingClientRect();
        const card  = cardsA[0].getBoundingClientRect();
        const n     = cardsA.length;

        // Diagonal step between fanned cards
        // Reference: cards fan from top-left to bottom-right
        // Each card offsets to the top-left from the anchor
        const stepX = card.width * 0.55;
        const stepY = card.height * 0.22;

        // The full diagonal span of a fanned group
        const fanSpanX = stepX * (n - 1);
        const fanSpanY = stepY * (n - 1);

        // The total vertical distance to push a fanned group completely off screen
        // and bring the next one into view. We push by the full viewport height
        // plus padding so no gap is visible.
        const pushDist = stage.height + fanSpanY + card.height;

        return { stepX, stepY, fanSpanX, fanSpanY, pushDist, n, stageH: stage.height, cardH: card.height };
      };

      /* ── Fan position for card i (0=back, n-1=front/anchor) ── */
      const fanXY = (i: number, count: number, m: ReturnType<typeof measure>) => {
        const dist = count - 1 - i; // 0 for anchor, higher for further cards
        return {
          x: -dist * m.stepX,
          y: -dist * m.stepY,
          z: -dist * 18,
          rotX: dist === 0 ? 0 : 1.5,
          rotY: dist === 0 ? 0 : -8,
          rotZ: dist === 0 ? 0 : 3.5,
        };
      };

      /* ── Apply stacked state (all behind anchor) ── */
      const setStack = (cards: HTMLElement[]) => {
        cards.forEach((el, i) => {
          gsap.set(el, {
            x: 0, y: 0, z: -i * 6,
            rotationX: 0, rotationY: 0, rotationZ: 0,
            transformPerspective: 1800,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      };

      /* ── Apply fanned state ── */
      const setFan = (cards: HTMLElement[], m: ReturnType<typeof measure>) => {
        cards.forEach((el, i) => {
          const f = fanXY(i, cards.length, m);
          gsap.set(el, {
            x: f.x, y: f.y, z: f.z,
            rotationX: f.rotX, rotationY: f.rotY, rotationZ: f.rotZ,
            transformPerspective: 1800,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      };

      /* ── Animate cards to fanned state ── */
      const tweenToFan = (
        cards: HTMLElement[],
        m: ReturnType<typeof measure>,
        label: string,
        timeline: ReturnType<typeof gsap.timeline>
      ) => {
        timeline.to(cards, {
          x: (i: number) => fanXY(i, cards.length, m).x,
          y: (i: number) => fanXY(i, cards.length, m).y,
          z: (i: number) => fanXY(i, cards.length, m).z,
          rotationX: (i: number) => fanXY(i, cards.length, m).rotX,
          rotationY: (i: number) => fanXY(i, cards.length, m).rotY,
          rotationZ: (i: number) => fanXY(i, cards.length, m).rotZ,
          duration: T_UNSTACK,
          ease: "power4.out",
          stagger: { each: 0.07, from: "start" },
        }, label);
      };

      /* ── Animate cards to stacked state ── */
      const tweenToStack = (
        cards: HTMLElement[],
        label: string,
        timeline: ReturnType<typeof gsap.timeline>
      ) => {
        timeline.to(cards, {
          x: 0, y: 0,
          z: (i: number) => -i * 6,
          rotationX: 0, rotationY: 0, rotationZ: 0,
          duration: T_SNAP,
          ease: "back.in(1.7)",
          stagger: { each: 0.03, from: "end" },
        }, label);
      };

      /* ═══════════════════════════════════════
         BUILD THE MASTER TIMELINE
         ═══════════════════════════════════════ */
      const buildTimeline = () => {
        tl?.kill();
        const m = measure();

        /*
         * COORDINATE SYSTEM:
         * The .hero-unit elements are positioned via CSS at the ANCHOR point
         * (center-right of viewport). All card x/y offsets are RELATIVE to
         * this anchor. The wrapper y-translate moves the entire group up/down.
         *
         * Anchor = (0, 0) in wrapper-local space
         * Fan extends to the TOP-LEFT (negative x, negative y)
         * Push direction = UPWARD (negative wrapper y)
         */

        // Initial state:
        // Group A = STACKED at anchor, visible
        // Group B = FANNED, positioned BELOW viewport (ready to push up)
        setStack(cardsA);
        setFan(cardsB, m);

        gsap.set(wrapA, { y: 0, autoAlpha: 1 });
        gsap.set(wrapB, { y: m.pushDist, autoAlpha: 1 });

        tl = gsap.timeline({ repeat: -1 });

        /* ════ CYCLE 1: A unstacks → push → B consolidates ════ */

        // HOLD: show clean stack
        tl.to({}, { duration: T_HOLD });

        // PHASE 1 — UNSTACK A: fan out from stack
        tl.addLabel("fan-a");
        tweenToFan(cardsA, m, "fan-a", tl);

        // Small breath after fan completes
        tl.to({}, { duration: 0.2 });

        // PHASE 2 — HEAVY PUSH: conveyor belt
        // Group A moves UP (fanned). Group B moves UP from below (also fanned).
        // Cards STAY FANNED during entire push.
        tl.addLabel("push-a")
          .to(wrapA, {
            y: -m.pushDist,
            duration: T_PUSH,
            ease: "power1.inOut",
          }, "push-a")
          .to(wrapB, {
            y: 0,
            duration: T_PUSH,
            ease: "power1.inOut",
          }, "push-a");

        // PHASE 3 — SNAP B: consolidate Group B into stack at anchor
        // Starts near the END of the push so it overlaps slightly
        tl.addLabel("snap-b", `push-a+=${T_PUSH * 0.85}`);
        tweenToStack(cardsB, "snap-b", tl);

        // RESET A: teleport below, re-fan, for next cycle
        tl.call(() => {
          setFan(cardsA, m);
          gsap.set(wrapA, { y: m.pushDist });
        });

        /* ════ CYCLE 2: B unstacks → push → A consolidates ════ */

        tl.to({}, { duration: T_HOLD });

        tl.addLabel("fan-b");
        tweenToFan(cardsB, m, "fan-b", tl);

        tl.to({}, { duration: 0.2 });

        tl.addLabel("push-b")
          .to(wrapB, {
            y: -m.pushDist,
            duration: T_PUSH,
            ease: "power1.inOut",
          }, "push-b")
          .to(wrapA, {
            y: 0,
            duration: T_PUSH,
            ease: "power1.inOut",
          }, "push-b");

        tl.addLabel("snap-a", `push-b+=${T_PUSH * 0.85}`);
        tweenToStack(cardsA, "snap-a", tl);

        tl.call(() => {
          setFan(cardsB, m);
          gsap.set(wrapB, { y: m.pushDist });
        });
      };

      buildTimeline();

      const onResize = () => {
        window.clearTimeout(resizeId);
        resizeId = window.setTimeout(buildTimeline, 200);
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
