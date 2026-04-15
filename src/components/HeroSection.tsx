"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/asset-path";

type HeroCardData = { src: string; alt: string };

const ALL_PROJECTS: HeroCardData[] = [
  { src: "/images/1.JPG", alt: "Editorial surface artwork" },
  { src: "/images/2.jpg", alt: "Campaign detail artwork" },
  { src: "/images/3.jpg", alt: "Mobile system artwork" },
  { src: "/images/4.jpg", alt: "Brand composition artwork" },
  { src: "/images/5.jpg", alt: "Poster layout artwork" },
  { src: "/images/6.jpg", alt: "Launch artwork" },
  { src: "/images/7.jpg", alt: "Luminous motion artwork" },
];

export default function HeroSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLDivElement>(null);
  const [projectSet, setProjectSet] = useState(ALL_PROJECTS);

  useEffect(() => {
    let alive = true;
    let tl: any;

    const boot = async () => {
      const gsap = (await import("gsap")).default;
      if (!alive || !unitRef.current) return;

      const cards = Array.from(unitRef.current.querySelectorAll<HTMLElement>(".hero-card"));
      if (cards.length === 0) return;

      // Reset positions
      gsap.set(cards, { x: 0, y: 0, xPercent: -50, yPercent: -50, autoAlpha: 1 });
      gsap.set(unitRef.current, { autoAlpha: 1 });

      // Identify groups
      // Indices 0, 1, 2 -> Top Left
      // Indices 3, 4, 5 -> Bottom Right
      // Index 6 -> Anchor (Pivot)
      const topLeftCards = cards.slice(0, 3);
      const bottomRightCards = cards.slice(3, 6);
      const anchorCard = cards[6];

      // Exclude anchor from being hidden in stack phase
      gsap.set(cards.slice(0, -1), { autoAlpha: 0 });

      const buildTimeline = () => {
        tl?.kill();
        tl = gsap.timeline({ repeat: -1 });

        // Phase 1: Hold Stack
        tl.to({}, { duration: 1.5 });

        // Phase 2: Unstack (Fan Out)
        tl.addLabel("fan")
          .set(cards, { autoAlpha: 1 }, "fan")
          .to(topLeftCards, {
            x: (i) => -((3 - i) * 160),
            y: (i) => -((3 - i) * 160),
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.05
          }, "fan")
          .to(bottomRightCards, {
            x: (i) => (i + 1) * 160,
            y: (i) => (i + 1) * 160,
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.05
          }, "fan");

        // Phase 3: Hold Fan
        tl.to({}, { duration: 1.5 });

        // Phase 4: Snap Back to Anchor (Reset coordinates to 0,0)
        tl.addLabel("snap")
          .to(cards, {
            x: 0,
            y: 0,
            duration: 1.0,
            ease: "expo.inOut",
            stagger: { each: 0.03, from: "start" }
          }, "snap");

        // Phase 5: Swap Image Set
        tl.call(() => {
          setProjectSet(prev => {
            const next = [...prev];
            const first = next.shift()!;
            next.push(first);
            return next;
          });
        });

        tl.set(cards.slice(0, -1), { autoAlpha: 0 });
        tl.to({}, { duration: 0.5 }); // Mini pause after swap
      };

      buildTimeline();
    };

    boot();
    return () => { 
      alive = false; 
      tl?.kill(); 
    };
  }, [projectSet]); 
  // We re-run the effect when projectSet changes to re-capture DOM elements and build timeline 
  // However, it's better to keep projectSet swap inside the loop if possible.
  // But since we are swapping React state, the DOM will re-render.

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
          <div
            ref={unitRef}
            className="hero-unit"
            style={{ opacity: 0 }}
          >
            {projectSet.map((card, ci) => (
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
                  priority={ci === projectSet.length - 1}
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

