"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { assetPath } from "@/lib/asset-path";

type HeroCardData = { src: string; alt: string };

const HERO_IMAGES: HeroCardData[] = [
  { src: "/images/7.jpg", alt: "Luminous motion artwork" },
  { src: "/images/6.jpg", alt: "Launch artwork" },
  { src: "/images/5.jpg", alt: "Poster layout artwork" },
  { src: "/images/4.jpg", alt: "Brand composition artwork" },
  { src: "/images/3.jpg", alt: "Mobile system artwork" },
  { src: "/images/2.jpg", alt: "Campaign detail artwork" },
  { src: "/images/1.JPG", alt: "Editorial surface artwork" }, // Index 6 is the Front Card (top layer)
];

export default function HeroSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    let teardown: (() => void) | undefined;

    const boot = async () => {
      if (!stageRef.current || !unitRef.current) return;
      const gsap = (await import("gsap")).default;
      if (!alive) return;

      const unit = unitRef.current;
      const cards = Array.from(unit.querySelectorAll<HTMLElement>("[data-ci]"));
      if (!cards.length) return;

      let tl: ReturnType<typeof gsap.timeline> | undefined;

      const measure = () => {
        const stage = stageRef.current!.getBoundingClientRect();
        const stageW = stage.width || window.innerWidth;
        const stageH = stage.height || window.innerHeight;
        
        // Push slightly higher since the wordmark is bottom-weighted
        const Y_OFFSET = -110; 

        // Diagonal Fan Geometry
        // We spread the 7 images across a diagonal line
        const stepX = (stageW * 0.55) / (cards.length - 1);
        const stepY = (stageH * 0.55) / (cards.length - 1);
        
        const getFanX = (i: number) => (i - (cards.length - 1) / 2) * stepX;
        const getFanY = (i: number) => (i - (cards.length - 1) / 2) * stepY;

        // Position of the wrapper to center any specific card index exactly at (0,0)
        const getWrapX = (i: number) => -getFanX(i);
        const getWrapY = (i: number) => -getFanY(i);

        return { Y_OFFSET, getFanX, getFanY, getWrapX, getWrapY };
      };

      const buildTimeline = () => {
        tl?.kill();
        const m = measure();

        // 1. GLOBAL RESET
        // Align all cards to the wrapper origin (centered)
        gsap.set(cards, { 
          xPercent: -50, 
          yPercent: -50,
          x: 0, 
          y: 0,
          autoAlpha: 1,
          scale: 1
        });

        // Align the single wrapper to dead center (adjusted by Y_OFFSET)
        gsap.set(unit, { x: 0, y: m.Y_OFFSET, autoAlpha: 1 });

        // Phase 1: Consolidated Static State (Hero card visible)
        // Ensure all background cards are hidden during the stack
        gsap.set(cards.slice(0, -1), { autoAlpha: 0 });

        tl = gsap.timeline({ repeat: -1 });

        // HOLD the hero
        tl.to({}, { duration: 2.0 });

        // Phase 2: Unstack to Diagonal Fan
        tl.addLabel("unstack")
          .set(cards, { autoAlpha: 1 }, "unstack")
          .to(cards, {
            x: m.getFanX,
            y: m.getFanY,
            duration: 1.25,
            ease: "expo.out",
            stagger: { each: 0.05, from: "end" }
          }, "unstack");

        tl.to({}, { duration: 1.0 });

        // Phase 3: Stepped Modular Conveyor
        // Each image moves to the center (0,0), pauses, then moves out.
        // We start from the Hero (index 6, who is already at the center relative to 0 fan pos)
        for(let i = cards.length - 1; i >= 0; i--) {
           const label = `step-${i}`;
           tl.addLabel(label)
             .to(unit, { 
               x: m.getWrapX(i), 
               y: m.Y_OFFSET + m.getWrapY(i), 
               duration: 0.85, 
               ease: "power2.inOut" 
             }, label);
           
           tl.to({}, { duration: 1.6 }); // Pause on each individual artwork
        }

        // Phase 4: Snap Consolidation
        // All cards collapse back into the origin
        tl.addLabel("snap")
          .to(unit, { x: 0, y: m.Y_OFFSET, duration: 1.2, ease: "expo.inOut" }, "snap")
          .to(cards, { x: 0, y: 0, duration: 1.2, ease: "expo.inOut" }, "snap");

        // Hide back cards again for a sharp loop reset
        tl.set(cards.slice(0, -1), { autoAlpha: 0 });
      };

      const timer = window.setTimeout(buildTimeline, 100);

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
          <div ref={unitRef} className="hero-unit">
            {HERO_IMAGES.map((card, ci) => (
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
                  priority={ci === HERO_IMAGES.length - 1}
                  sizes="(max-width: 767px) 42vw, (max-width: 1023px) 28vw, 360px"
                  className="hero-card-image"
                />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
