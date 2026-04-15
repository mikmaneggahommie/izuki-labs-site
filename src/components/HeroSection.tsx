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

export default function HeroSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let alive = true;
    let teardown: (() => void) | undefined;

    const boot = async () => {
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
        const stageW = stage.width || window.innerWidth;
        const stageH = stage.height || window.innerHeight;
        
        // Math Helpers
        const Y_OFFSET = -100; // Pushed "up" as requested by user

        // Spread logic
        const stepSpreadX = (stageW * 0.65) / (cardsA.length - 1);
        const stepSpreadY = (stageH * 0.65) / (cardsA.length - 1);
        
        const getFanX = (i: number) => (i - (cardsA.length - 1) / 2) * stepSpreadX;
        const getFanY = (i: number) => (i - (cardsA.length - 1) / 2) * stepSpreadY;

        const getCenterWrapX = (i: number) => -getFanX(i);
        const getCenterWrapY = (i: number) => -getFanY(i);

        const fanWidthX = (cardsA.length - 1) * stepSpreadX;
        const fanWidthY = (cardsA.length - 1) * stepSpreadY;

        return { 
          Y_OFFSET, stepSpreadX, stepSpreadY, getFanX, getFanY, 
          getCenterWrapX, getCenterWrapY, fanWidthX, fanWidthY 
        };
      };

      const buildTimeline = () => {
        tl?.kill();
        const m = measure();

        // Standard card setup
        gsap.set([...cardsA, ...cardsB], { 
          xPercent: -50, 
          yPercent: -50,
          x: 0,
          y: 0,
          autoAlpha: 1 
        });

        gsap.set([wrapA, wrapB], { 
          position: "absolute",
          top: "50%", 
          left: "50%",
          y: m.Y_OFFSET
        });

        // Initial State: A at center, B trailing behind
        gsap.set(cardsA.slice(0, -1), { autoAlpha: 0 }); // Hide backgrounds in stack
        gsap.set(wrapA, { x: 0, y: 0, zIndex: 10, autoAlpha: 1 });

        const startBx = m.getCenterWrapX(cardsA.length - 1) - (m.fanWidthX + m.stepSpreadX);
        const startBy = m.getCenterWrapY(cardsA.length - 1) - (m.fanWidthY + m.stepSpreadY);
        gsap.set(wrapB, { x: startBx, y: startBy, zIndex: 5, autoAlpha: 1 });
        gsap.set(cardsB, { x: m.getFanX, y: m.getFanY });

        tl = gsap.timeline({ repeat: -1 });

        // Phase 1: Group A sequence
        tl.to({}, { duration: 1.5 }); // HOLD stack

        // 1. Unstack
        tl.addLabel("unstack-a")
          .set(cardsA, { autoAlpha: 1 }, "unstack-a")
          .to(cardsA, {
            x: m.getFanX,
            y: m.getFanY,
            duration: 1.0,
            ease: "expo.out",
            stagger: { each: 0.04, from: "end" }
          }, "unstack-a");

        tl.to({}, { duration: 1.0 });

        // 2. Conveyor steps
        for(let i = cardsA.length - 1; i >= -1; i--) {
           const label = `step-a-${i}`;
           const targetAx = i >= 0 ? m.getCenterWrapX(i) : m.getCenterWrapX(0) + m.stepSpreadX;
           const targetAy = i >= 0 ? m.getCenterWrapY(i) : m.getCenterWrapY(0) + m.stepSpreadY;
           const targetBx = targetAx - (m.fanWidthX + m.stepSpreadX);
           const targetBy = targetAy - (m.fanWidthY + m.stepSpreadY);

           tl.addLabel(label)
             .to(wrapA, { x: targetAx, y: targetAy, duration: 0.7, ease: "power3.inOut" }, label)
             .to(wrapB, { x: targetBx, y: targetBy, duration: 0.7, ease: "power3.inOut" }, label);
           
           tl.to({}, { duration: 1.2 }); // PAUSE for each image
        }

        // 3. Consolidate B
        tl.set(wrapA, { autoAlpha: 0 }); // Nuke ghost group
        tl.addLabel("snap-b")
          .to(cardsB, {
            x: 0,
            y: 0,
            duration: 1.2,
            ease: "expo.inOut",
            stagger: { each: 0.04, from: "start" }
          }, "snap-b");

        tl.set(cardsB.slice(0, -1), { autoAlpha: 0 }); // Hide background ghosts
        tl.to({}, { duration: 2.0 });

        // 4. Swap and Loop
        tl.call(() => {
          gsap.set(wrapB, { zIndex: 10 });
          gsap.set(wrapA, { zIndex: 5, autoAlpha: 1 });
          gsap.set(cardsA, { x: m.getFanX, y: m.getFanY, autoAlpha: 1 });
          
          const resetX = m.getCenterWrapX(cardsB.length - 1) - (m.fanWidthX + m.stepSpreadX);
          const resetY = m.getCenterWrapY(cardsB.length - 1) - (m.fanWidthY + m.stepSpreadY);
          gsap.set(wrapA, { x: resetX, y: resetY });
        });

        // Phase 2: Group B sequence (Identical logic)
        tl.addLabel("unstack-b")
          .set(cardsB, { autoAlpha: 1 }, "unstack-b")
          .to(cardsB, {
            x: m.getFanX,
            y: m.getFanY,
            duration: 1.0,
            ease: "expo.out",
            stagger: { each: 0.04, from: "end" }
          }, "unstack-b");

        tl.to({}, { duration: 1.0 });

        for(let i = cardsB.length - 1; i >= -1; i--) {
           const label = `step-b-${i}`;
           const targetBx = i >= 0 ? m.getCenterWrapX(i) : m.getCenterWrapX(0) + m.stepSpreadX;
           const targetBy = i >= 0 ? m.getCenterWrapY(i) : m.getCenterWrapY(0) + m.stepSpreadY;
           const targetAx = targetBx - (m.fanWidthX + m.stepSpreadX);
           const targetAy = targetBy - (m.fanWidthY + m.stepSpreadY);

           tl.addLabel(label)
             .to(wrapB, { x: targetBx, y: targetBy, duration: 0.7, ease: "power3.inOut" }, label)
             .to(wrapA, { x: targetAx, y: targetAy, duration: 0.7, ease: "power3.inOut" }, label);
           
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
          gsap.set(wrapB, { zIndex: 5, autoAlpha: 1 });
          gsap.set(cardsB, { x: m.getFanX, y: m.getFanY, autoAlpha: 1 });
          
          const resetX = m.getCenterWrapX(cardsA.length - 1) - (m.fanWidthX + m.stepSpreadX);
          const resetY = m.getCenterWrapY(cardsA.length - 1) - (m.fanWidthY + m.stepSpreadY);
          gsap.set(wrapB, { x: resetX, y: resetY });
        });
      };

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
        >
          {GROUPS.map((group, gi) => (
            <div
              key={`group-${gi}`}
              ref={(node) => { groupRefs.current[gi] = node; }}
              className="hero-unit"
              style={{ opacity: 0 }}
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
