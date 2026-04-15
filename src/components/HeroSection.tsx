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
 * The "Liquid Glass" Masterpiece
 */
const T_UNSTACK = 1.2;
const T_PRE_HOLD = 0.5;
const T_PUSH = 8.0;   // The smooth continuous sliding of cards!
const T_SNAP = 1.0;
const T_STACK_HOLD = 2.0;

export default function HeroSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let alive = true;
    let teardown: (() => void) | undefined;

    const boot = async () => {
      // Bypassing reduced motion cleanly so it never hangs
      if (!stageRef.current) return;
      const gsap = (await import("gsap")).default;
      if (!alive) return;

      const [wrapA, wrapB] = groupRefs.current;
      if (!wrapA || !wrapB) return;

      const cardsA = Array.from(wrapA.querySelectorAll<HTMLElement>("[data-ci]"));
      const cardsB = Array.from(wrapB.querySelectorAll<HTMLElement>("[data-ci]"));
      if (!cardsA.length || !cardsB.length) return;

      let tl: ReturnType<typeof gsap.timeline> | undefined;

      const measure = () => {
        const stage = stageRef.current!.getBoundingClientRect();
        // Fallback dimensions just in case NextJS loads styles late
        const stageW = stage.width || window.innerWidth;
        const stageH = stage.height || window.innerHeight;
        
        const n = cardsA.length;

      // Math Helpers
      // Perfect zero-offset stack logic: The cards perfectly overlap during consolidation
      // so it looks like a single card.
      const getStackX = (i: number) => 0;
      const getStackY = (i: number) => 0;

      // Fanned state logic: Perfectly spread across the screen
      // Reduced spread to 70% so they do NOT push off the screen edge
      const stepSpreadX = (stageW * 0.70) / (cardsA.length - 1);
      const stepSpreadY = (stageH * 0.70) / (cardsA.length - 1);
      
      const getFanX = (i: number) => (i - (cardsA.length - 1) / 2) * stepSpreadX;
      const getFanY = (i: number) => (i - (cardsA.length - 1) / 2) * stepSpreadY;

      // Mathematical offset to push exactly out of frame seamlessly
      const pushX = cardsA.length * stepSpreadX;
      const pushY = cardsA.length * stepSpreadY;

      const buildTimeline = () => {
        tl?.kill();
        const m = measure();

        // ─── GEOMETRIC ALIGNMENT ───
        
        // 1. Force the wrappers to stay perfectly dead center at 50% 50% ignoring any external CSS!
        gsap.set([wrapA, wrapB], { 
          position: "absolute",
          top: "50%", 
          left: "50%"
        });

        // 2. The CARDS get xPercent/yPercent because they have the physical dims. 
        // This ensures the Front card perfectly overlaps the dead center!
        gsap.set([...cardsA, ...cardsB], { 
          xPercent: -50, 
          yPercent: -50,
          scale: 1 
        });

        // ─── INITIAL STATE ───
        
        // Group A: Start PERFECTLY STACKED. Z-Index 10.
        gsap.set(cardsA, { x: getStackX, y: getStackY });
        gsap.set(wrapA, { x: 0, y: 0, zIndex: 10, autoAlpha: 1 });

        // Group B: Prepared offscreen (Top-Left), already FANNED!
        gsap.set(cardsB, { 
          x: getFanX, 
          y: getFanY
        });
        gsap.set(wrapB, { x: -pushX, y: -pushY, zIndex: 5, autoAlpha: 1 });

        tl = gsap.timeline({ repeat: -1 });

        // Admire the starting stack
        tl.to({}, { duration: 1.5 }); 

        /* ═══════════════════════════════════
           CYCLE A → B
           ═══════════════════════════════════ */

        // 1. FAN OUT BURST (Explode from the pack)
        tl.addLabel("unstack-a")
          .to(cardsA, {
            x: getFanX,
            y: getFanY,
            duration: 1.2,
            ease: "expo.out",
            stagger: { each: 0.04, from: "end" } // Front cards fly out first
          }, "unstack-a");

        tl.to({}, { duration: 0.8 }); // Pause before first step

        // 2. CONVEYOR BELT (Step-by-step sequential shifting)
        for(let step = 1; step <= cardsA.length; step++) {
           const curX = step * stepSpreadX;
           const curY = step * stepSpreadY;
           const label = `push-a-${step}`;
           
           tl.addLabel(label)
             .to(wrapA, { x: curX, y: curY, duration: 0.6, ease: "power2.inOut" }, label)
             .to(wrapB, { x: curX - pushX, y: curY - pushY, duration: 0.6, ease: "power2.inOut" }, label);
           
           tl.to({}, { duration: 0.8 }); // The decisive pause you requested between EACH card
        }

        // HIDE Group A immediately before snap, killing any ghost edge cards!
        tl.set(wrapA, { autoAlpha: 0 });

        // 3. CONSOLIDATE B (Snap perfectly back to center stack)
        tl.addLabel("snap-b")
          .to(cardsB, {
            x: getStackX,
            y: getStackY,
            duration: 1.2,
            ease: "expo.inOut",
            stagger: { each: 0.04, from: "start" } // Snaps from the back into the stack
          }, "snap-b");

        // Admire the finished B stack cleanly centered
        tl.to({}, { duration: 1.5 });

        // 5. HIDDEN RESET & Z-INDEX SWAP
        tl.call(() => {
          gsap.set(wrapB, { zIndex: 10 }); // Center becomes leader
          gsap.set(wrapA, { zIndex: 5, x: -pushX, y: -pushY, autoAlpha: 1 }); // Prepare A top-left cleanly
          gsap.set(cardsA, { 
            x: getFanX, 
            y: getFanY
          });
        });

        /* ═══════════════════════════════════
           CYCLE B → A
           ═══════════════════════════════════ */

        tl.addLabel("unstack-b")
          .to(cardsB, {
            x: getFanX,
            y: getFanY,
            duration: 1.2,
            ease: "expo.out",
            stagger: { each: 0.04, from: "end" }
          }, "unstack-b");

        tl.to({}, { duration: 0.8 }); // Pause before first step

        // CONVEYOR BELT B (Step-by-step)
        for(let step = 1; step <= cardsB.length; step++) {
           const curX = step * stepSpreadX;
           const curY = step * stepSpreadY;
           const label = `push-b-${step}`;
           
           tl.addLabel(label)
             .to(wrapB, { x: curX, y: curY, duration: 0.6, ease: "power2.inOut" }, label)
             .to(wrapA, { x: curX - pushX, y: curY - pushY, duration: 0.6, ease: "power2.inOut" }, label);
           
           tl.to({}, { duration: 0.8 }); // The decisive pause
        }

        // HIDE Group B immediately before snap
        tl.set(wrapB, { autoAlpha: 0 });

        tl.addLabel("snap-a")
          .to(cardsA, {
            x: getStackX,
            y: getStackY,
            duration: 1.2,
            ease: "expo.inOut",
            stagger: { each: 0.04, from: "start" }
          }, "snap-a");

        tl.to({}, { duration: 1.5 });

        tl.call(() => {
          gsap.set(wrapA, { zIndex: 10 });
          gsap.set(wrapB, { zIndex: 5, x: -pushX, y: -pushY, autoAlpha: 1 });
          gsap.set(cardsB, { 
            x: getFanX, 
            y: getFanY
          });
        });
      };

      // Ensure slight delay before measure logic bounds are 100% computed
      const timer = window.setTimeout(buildTimeline, 50);

      const onResize = () => {
        window.clearTimeout(timer);
        buildTimeline();
      };
      window.addEventListener("resize", onResize);

      teardown = () => {
        window.clearTimeout(timer);
        window.removeEventListener("resize", onResize);
        tl?.kill();
      };
    };

    void boot();
    return () => { alive = false; teardown?.(); };
  }, []);

  return (
    <section id="top" className="section-shell hero-shell z-0">
      <div className="content-shell hero-viewport relative min-h-screen">
        <div className="hero-copy absolute left-8 bottom-8 z-10 w-full max-w-lg">
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
          className="hero-stage absolute inset-0 z-30 pointer-events-none"
          aria-label="Automated portfolio animation"
        >
          {GROUPS.map((group, gi) => (
            <div
              key={`group-${gi}`}
              ref={(node) => { groupRefs.current[gi] = node; }}
              className="hero-unit"
              style={{ opacity: 0 }} /* Default hidden until GSAP takes over */
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
