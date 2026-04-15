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
      const Y_OFFSET = -80; // Pushed "up" as requested by user

      // Perfect zero-offset stack logic: The cards perfectly overlap during consolidation
      // and we hide the ones behind the front one to ensure zero peeking/ghosting.
      const getStackX = (i: number) => 0;
      const getStackY = (i: number) => 0;

      // Fanned state logic: Perfectly spread across the screen
      // Use 65% spread to keep everything within safe view on laptops
      const stepSpreadX = (stageW * 0.65) / (cardsA.length - 1);
      const stepSpreadY = (stageH * 0.65) / (cardsA.length - 1);
      
      const getFanX = (i: number) => (i - (cardsA.length - 1) / 2) * stepSpreadX;
      const getFanY = (i: number) => (i - (cardsA.length - 1) / 2) * stepSpreadY;

      // Calculate the displacement needed to center any specific card index
      const getCenterWrapX = (i: number) => -getFanX(i);
      const getCenterWrapY = (i: number) => -getFanY(i);

      // Total width of the fanned line
      const fanWidthX = (cardsA.length - 1) * stepSpreadX;
      const fanWidthY = (cardsA.length - 1) * stepSpreadY;

      const buildTimeline = () => {
        tl?.kill();
        const m = measure();

        // ─── GEOMETRIC ALIGNMENT ───
        
        // 1. Force the wrappers to stay perfectly dead center at 50% 50%
        gsap.set([wrapA, wrapB], { 
          position: "absolute",
          top: "50%", 
          left: "50%",
          y: Y_OFFSET
        });

        // 2. The CARDS get xPercent/yPercent because they have the physical dims. 
        // This ensures the Front card perfectly overlaps the dead center!
        gsap.set([...cardsA, ...cardsB], { 
          xPercent: -50, 
          yPercent: -50,
          scale: 1,
          autoAlpha: 1 
        });

        // ─── INITIAL STATE ───
        
        // Group A: Start in center stack. Only the TOP card is fully visible to prevent ghosting.
        gsap.set(cardsA, { x: 0, y: 0 });
        gsap.set(cardsA.slice(0, -1), { autoAlpha: 0 }); 
        gsap.set(wrapA, { x: 0, y: 0, zIndex: 10, autoAlpha: 1 });

        // Group B: Prepared at the perfect starting point to trail Group A
        // Moved back by exactly the fan width + one step
        const startX = getCenterWrapX(cardsA.length - 1) - (fanWidthX + stepSpreadX);
        const startY = getCenterWrapY(cardsA.length - 1) - (fanWidthY + stepSpreadY);

        gsap.set(cardsB, { x: getFanX, y: getFanY, autoAlpha: 1 });
        gsap.set(wrapB, { x: startX, y: startY, zIndex: 5, autoAlpha: 1 });

        tl = gsap.timeline({ repeat: -1 });

        // Admire the starting stack
        tl.to({}, { duration: 1.5 }); 

        /* ═══════════════════════════════════
           CYCLE A → B
           ═══════════════════════════════════ */

        // 1. FAN OUT BURST (Explode from the pack)
        tl.addLabel("unstack-a")
          .to(cardsA, { autoAlpha: 1, duration: 0.1 }, "unstack-a") // Show all hidden cards immediately
          .to(cardsA, {
            x: getFanX,
            y: getFanY,
            duration: 1.2,
            ease: "expo.out",
            stagger: { each: 0.04, from: "end" }
          }, "unstack-a");

        tl.to({}, { duration: 1.0 }); // Long pause at the start

        // 2. THE STEPPED CONVEYOR
        // We move the wrappers such that EACH card in the fan passes through the center point (0,0)
        // A goes from center to bottom-right, B follows into center.
        for(let i = cardsA.length - 1; i >= -1; i--) {
           const label = `step-a-${i}`;
           
           // If i is -1, it means we've passed all cards and Group B's first card is coming to center
           const targetAx = i >= 0 ? getCenterWrapX(i) : getCenterWrapX(0) + stepSpreadX;
           const targetAy = i >= 0 ? getCenterWrapY(i) : getCenterWrapY(0) + stepSpreadY;
           
           // B always trails A by exactly the fan-width gap
           const targetBx = targetAx - (fanWidthX + stepSpreadX);
           const targetBy = targetAy - (fanWidthY + stepSpreadY);

           tl.addLabel(label)
             .to(wrapA, { x: targetAx, y: targetAy, duration: 0.8, ease: "power3.inOut" }, label)
             .to(wrapB, { x: targetBx, y: targetBy, duration: 0.8, ease: "power3.inOut" }, label);
           
           tl.to({}, { duration: 1.2 }); // DECISIVE PAUSE at each card as requested
        }

        // 3. CONSOLIDATE B (Snap perfectly back to center stack)
        // Group B is now at x:0, y:0 essentially (well, the first card index is).
        tl.set(wrapA, { autoAlpha: 0 }); // KILL GHOSTS: Hide the outgoing group completely
        
        tl.addLabel("snap-b")
          .to(cardsB, {
            x: 0,
            y: 0,
            duration: 1.2,
            ease: "expo.inOut",
            stagger: { each: 0.04, from: "start" }
          }, "snap-b");

        // KILL GHOSTS: Once stacked, hide everything except the top card
        tl.set(cardsB.slice(0, -1), { autoAlpha: 0 });
        
        tl.to({}, { duration: 2.0 }); // Long hold on the clean single image

        // 5. HIDDEN RESET & SWAP
        tl.call(() => {
          gsap.set(wrapB, { zIndex: 10 });
          gsap.set(wrapA, { zIndex: 5, autoAlpha: 1 });
          gsap.set(cardsA, { x: getFanX, y: getFanY, autoAlpha: 1 });
          
          // Recalculate start for B now that it's leading
          const resetX = getCenterWrapX(cardsB.length - 1) - (fanWidthX + stepSpreadX);
          const resetY = getCenterWrapY(cardsB.length - 1) - (fanWidthY + stepSpreadY);
          gsap.set(wrapA, { x: resetX, y: resetY });
        });

        /* ═══════════════════════════════════
           CYCLE B → A (Identical Logic)
           ═══════════════════════════════════ */

        tl.addLabel("unstack-b")
          .to(cardsB, { autoAlpha: 1, duration: 0.1 }, "unstack-b")
          .to(cardsB, {
            x: getFanX,
            y: getFanY,
            duration: 1.2,
            ease: "expo.out",
            stagger: { each: 0.04, from: "end" }
          }, "unstack-b");

        tl.to({}, { duration: 1.0 });

        for(let i = cardsB.length - 1; i >= -1; i--) {
           const label = `step-b-${i}`;
           const targetBx = i >= 0 ? getCenterWrapX(i) : getCenterWrapX(0) + stepSpreadX;
           const targetBy = i >= 0 ? getCenterWrapY(i) : getCenterWrapY(0) + stepSpreadY;
           const targetAx = targetBx - (fanWidthX + stepSpreadX);
           const targetAy = targetBy - (fanWidthY + stepSpreadY);

           tl.addLabel(label)
             .to(wrapB, { x: targetBx, y: targetBy, duration: 0.8, ease: "power3.inOut" }, label)
             .to(wrapA, { x: targetAx, y: targetAy, duration: 0.8, ease: "power3.inOut" }, label);
           
           tl.to({}, { duration: 1.2 });
        }

        tl.set(wrapB, { autoAlpha: 0 });

        tl.addLabel("snap-a")
          .to(cardsA, {
            x: 0,
            y: 0,
            duration: 1.2,
            ease: "expo.inOut",
            stagger: { each: 0.04, from: "start" }
          }, "snap-a");

        tl.set(cardsA.slice(0, -1), { autoAlpha: 0 });
        
        tl.to({}, { duration: 2.0 });

        tl.call(() => {
          gsap.set(wrapA, { zIndex: 10 });
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
