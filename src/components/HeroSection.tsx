"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { assetPath } from "@/lib/asset-path";

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

/*
 * STRICT TIMING — DIAGONAL CONVEYOR BELT LOOP
 * Phase 1: Diagonal Unstack  → 0.8s (expo.out)
 * Phase 2: Hold (stationary) → 1.5s
 * Phase 3: Conveyor Push     → 1.5s (power2.inOut)
 * Phase 4: Center Snap       → 0.6s (expo.in)
 */
const T_UNSTACK = 0.8;
const T_HOLD    = 1.5;
const T_PUSH    = 1.5;
const T_SNAP    = 0.6;

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

      const measure = () => {
        const stage = stageRef.current!.getBoundingClientRect();
        const n = cardsA.length;

        // Fan stretches 85% of screen to hit corners perfectly without overflowing too much
        const stepX = (stage.width * 0.85) / (n - 1);
        const stepY = (stage.height * 0.85) / (n - 1);

        // Mathematical push distance for perfect edge-to-edge tracking
        // This guarantees Group B seamlessly follows Group A with identical spacing
        const pushX = n * stepX;
        const pushY = n * stepY;

        return { stepX, stepY, pushX, pushY };
      };

      // Distribute symmetrically from -half to +half so the array centers at (0,0)
      const getT = (i: number, n: number) => {
        return i - (n - 1) / 2;
      };

      const buildTimeline = () => {
        tl?.kill();
        const m = measure();

        // ─── INITIALIZATION ───
        
        // Group A: Start CLEANLY STACKED in dead center. Z-Index 10 because it is the current visible group.
        gsap.set(cardsA, { x: 0, y: 0, scale: 1, xPercent: -50, yPercent: -50 });
        gsap.set(wrapA, { x: 0, y: 0, zIndex: 10, autoAlpha: 1 });

        // Group B: Prepared offscreen (Top-Left), already FANNED to act as incoming conveyor.
        // Lower z-index because it is physically further top-left (further away from camera).
        gsap.set(cardsB, { 
          x: (i) => getT(i, cardsB.length) * m.stepX, 
          y: (i) => getT(i, cardsB.length) * m.stepY,
          scale: 1, xPercent: -50, yPercent: -50
        });
        gsap.set(wrapB, { x: -m.pushX, y: -m.pushY, zIndex: 5, autoAlpha: 1 });

        tl = gsap.timeline({ repeat: -1 });

        tl.to({}, { duration: 0.3 }); // Breathing room at start

        /* ═══════════════════════════════════
           CYCLE A → B
           ═══════════════════════════════════ */

        // 1. DIAGONAL BURST
        tl.addLabel("unstack-a")
          .to(cardsA, {
            x: (i) => getT(i, cardsA.length) * m.stepX,
            y: (i) => getT(i, cardsA.length) * m.stepY,
            duration: T_UNSTACK,
            ease: "expo.out",
            stagger: { each: 0.05, from: "center" }
          }, "unstack-a");

        // 2. HOLD IT
        tl.to({}, { duration: T_HOLD });

        // 3. DIAGONAL CONVEYOR BELT (The Seamless Push)
        tl.addLabel("push-a")
          .to(wrapA, {
            x: m.pushX, // Slides out Bottom-Right
            y: m.pushY,
            duration: T_PUSH,
            ease: "power2.inOut"
          }, "push-a")
          .to(wrapB, {
            x: 0,        // Slides into Center from Top-Left
            y: 0,
            duration: T_PUSH,
            ease: "power2.inOut"
          }, "push-a");

        // 4. CONSOLIDATE IN CENTER
        tl.addLabel("snap-b")
          .to(cardsB, {
            x: 0,
            y: 0,
            duration: T_SNAP,
            ease: "expo.in",
            stagger: { each: 0.03, from: "edges" }
          }, "snap-b");

        // 5. HIDDEN RESET & Z-INDEX SWAP
        tl.call(() => {
          gsap.set(wrapB, { zIndex: 10 }); // Now in center, becomes leader
          gsap.set(wrapA, { zIndex: 5, x: -m.pushX, y: -m.pushY }); // Prepare A offscreen Top-Left
          gsap.set(cardsA, { 
            x: (i) => getT(i, cardsA.length) * m.stepX, 
            y: (i) => getT(i, cardsA.length) * m.stepY 
          }); // Fan A to be ready
        });

        tl.to({}, { duration: 0.4 }); // Breathing room

        /* ═══════════════════════════════════
           CYCLE B → A
           ═══════════════════════════════════ */

        // 1. DIAGONAL BURST
        tl.addLabel("unstack-b")
          .to(cardsB, {
            x: (i) => getT(i, cardsB.length) * m.stepX,
            y: (i) => getT(i, cardsB.length) * m.stepY,
            duration: T_UNSTACK,
            ease: "expo.out",
            stagger: { each: 0.05, from: "center" }
          }, "unstack-b");

        // 2. HOLD IT
        tl.to({}, { duration: T_HOLD });

        // 3. DIAGONAL CONVEYOR BELT
        tl.addLabel("push-b")
          .to(wrapB, {
            x: m.pushX, // Slides out Bottom-Right
            y: m.pushY,
            duration: T_PUSH,
            ease: "power2.inOut"
          }, "push-b")
          .to(wrapA, {
            x: 0,        // Slides into Center from Top-Left
            y: 0,
            duration: T_PUSH,
            ease: "power2.inOut"
          }, "push-b");

        // 4. CONSOLIDATE IN CENTER
        tl.addLabel("snap-a")
          .to(cardsA, {
            x: 0,
            y: 0,
            duration: T_SNAP,
            ease: "expo.in",
            stagger: { each: 0.03, from: "edges" }
          }, "snap-a");

        // 5. HIDDEN RESET & Z-INDEX SWAP
        tl.call(() => {
          gsap.set(wrapA, { zIndex: 10 });
          gsap.set(wrapB, { zIndex: 5, x: -m.pushX, y: -m.pushY });
          gsap.set(cardsB, { 
            x: (i) => getT(i, cardsB.length) * m.stepX, 
            y: (i) => getT(i, cardsB.length) * m.stepY 
          });
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
    <section id="top" className="section-shell hero-shell z-0">
      <div className="content-shell hero-viewport relative min-h-screen">
        {/* Bottom-left wordmark — explicitly z-index 10 behind images */}
        <div className="hero-copy absolute left-8 bottom-8 z-10 w-full max-w-lg">
          <h1 className="hero-wordmark" aria-label="Izuki Labs">
            <span className="hero-wordmark-line">
              <span>IZUKI</span>
              <span className="hero-wordmark-dot" aria-hidden />
            </span>
            <span className="hero-wordmark-line">LABS</span>
          </h1>
        </div>

        {/* Animation stage — explicitly z-index 30 ON TOP of text */}
        <div
          ref={stageRef}
          className="hero-stage absolute inset-0 z-30 pointer-events-none"
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
                  // Lowest index renders at back (Top-Left); Highest renders at front (Bottom-Right)
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
