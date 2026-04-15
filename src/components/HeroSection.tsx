"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { assetPath } from "@/lib/asset-path";

const HERO_IMAGES = [
  { src: "/images/7.jpg", alt: "Izuki Portfolio 7" },
  { src: "/images/6.jpg", alt: "Izuki Portfolio 6" },
  { src: "/images/5.jpg", alt: "Izuki Portfolio 5" },
  { src: "/images/4.jpg", alt: "Izuki Portfolio 4" },
  { src: "/images/3.jpg", alt: "Izuki Portfolio 3" },
  { src: "/images/2.jpg", alt: "Izuki Portfolio 2" },
  { src: "/images/1.JPG", alt: "Izuki Portfolio 1" },
];

export default function HeroSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLDivElement>(null);
  const projectIdxRef = useRef(0);

  useEffect(() => {
    let alive = true;
    let tl: gsap.core.Timeline | undefined;

    const boot = async () => {
      const gsap = (await import("gsap")).default;
      if (!alive || !unitRef.current) return;

      const cards = Array.from(unitRef.current.querySelectorAll<HTMLElement>(".hero-card"));
      if (cards.length === 0) return;

      const totalImages = HERO_IMAGES.length;

      const buildLoop = () => {
        tl?.kill();
        
        // Initial Reset
        gsap.set(cards, {
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 0,
          zIndex: 10,
          rotation: 0
        });

        tl = gsap.timeline({ repeat: -1 });

        // THE PIVOT LOOP
        // We use a manual loop inside GSAP to handle the source swaps on each iteration
        const runCycle = () => {
          const leadIdx = projectIdxRef.current % cards.length;
          const leadCard = cards[leadIdx];
          const otherCards = cards.filter((_, i) => i !== leadIdx);
          
          const cycleTl = gsap.timeline();

          // PHASE A: The Resting Spotlight (2.5s Hold)
          // All stacked, only lead visible
          cycleTl.set(cards, { zIndex: 10, autoAlpha: 0 });
          cycleTl.set(leadCard, { zIndex: 100, autoAlpha: 1, x: 0, y: 0 });
          
          cycleTl.to({}, { duration: 2.5 }); // Hold

          // PHASE B: The Diagonal Burst (1.0s Duration)
          // Expo.out, lead stationary, others fan edge-to-edge
          cycleTl.addLabel("burst");
          
          // Split others into Top-Left and Bottom-Right
          const tlGroup = otherCards.slice(0, Math.ceil(otherCards.length / 2));
          const brGroup = otherCards.slice(Math.ceil(otherCards.length / 2));

          cycleTl.set(otherCards, { autoAlpha: 1 }, "burst");
          
          cycleTl.to(tlGroup, {
            x: (i) => -(i + 1) * 280,
            y: (i) => -(i + 1) * 220,
            rotation: (i) => -(i + 1) * 5,
            duration: 1.0,
            ease: "expo.out",
            stagger: { amount: 0.1, from: "start" }
          }, "burst");

          cycleTl.to(brGroup, {
            x: (i) => (i + 1) * 280,
            y: (i) => (i + 1) * 220,
            rotation: (i) => (i + 1) * 5,
            duration: 1.0,
            ease: "expo.out",
            stagger: { amount: 0.1, from: "start" }
          }, "burst");

          // Phase B.5: Brief hold at max spread
          cycleTl.to({}, { duration: 0.4 });

          // PHASE C: The High-Velocity Snap (0.5s Duration)
          // Expo.in, snap back to exact center (0,0)
          cycleTl.addLabel("snap");
          cycleTl.to(otherCards, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.5,
            ease: "expo.in",
            onComplete: () => {
              // Increment index for next round
              projectIdxRef.current = (projectIdxRef.current + 1) % totalImages;
            }
          }, "snap");

          return cycleTl;
        };

        // Master loop logic: 
        // Since we want to update the lead card on every iteration, 
        // we'll just build a timeline that does a few cycles or use a recursive function.
        // Given GSAP's repeat structure, it's cleaner to just append cycles.
        for (let i = 0; i < cards.length; i++) {
          tl.add(runCycle());
        }
      };

      buildLoop();
    };

    boot();
    return () => { 
      alive = false; 
      tl?.kill();
    };
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
          className="hero-stage flex items-center justify-center"
        >
          <div ref={unitRef} className="hero-unit absolute inset-0 flex items-center justify-center">
            {HERO_IMAGES.map((item, i) => (
              <article
                key={i}
                className="hero-card"
                style={{ zIndex: 10 - i }}
              >
                <Image
                  src={assetPath(item.src)}
                  alt={item.alt}
                  fill
                  priority={i < 2}
                  className="hero-card-image"
                  sizes="(max-width: 768px) 100vw, 420px"
                />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
