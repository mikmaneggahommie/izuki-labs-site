"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { assetPath } from "@/lib/asset-path";

type HeroCardData = { src: string; alt: string };

const HERO_IMAGES: HeroCardData[] = [
  { src: "/images/7.jpg", alt: "Luminous artwork" },
  { src: "/images/6.jpg", alt: "Launch artwork" },
  { src: "/images/5.jpg", alt: "Poster layout artwork" },
  { src: "/images/4.jpg", alt: "Brand composition artwork" },
  { src: "/images/3.jpg", alt: "Mobile system artwork" },
  { src: "/images/2.jpg", alt: "Campaign detail artwork" },
  { src: "/images/1.JPG", alt: "Front Hero - Guy in Suit" },
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
      if (cards.length < 7) return;

      let tl: ReturnType<typeof gsap.timeline> | undefined;

      const buildTimeline = () => {
        tl?.kill();

        // 1. INITIAL SETUP
        // Fixed Anchor point: top: 50%, left: 70%
        gsap.set(cards, {
          position: "absolute",
          top: "50%",
          left: "70%",
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1
        });

        tl = gsap.timeline({ repeat: -1 });

        // Sequential cycle for the 7 images
        for (let cycle = 0; cycle < cards.length; cycle++) {
          const currentAnchorIdx = (cards.length - 1 - cycle + cards.length) % cards.length;
          const otherCards = cards.filter((_, i) => i !== currentAnchorIdx);
          
          const labelPrefix = `cycle-${cycle}`;

          // Step 0: Prep Cycle (Instantly swap z-index)
          tl.set(cards, { zIndex: (i) => (i === currentAnchorIdx ? 100 : 10) }, `${labelPrefix}-start`)
            .set(otherCards, { autoAlpha: 0 }, `${labelPrefix}-start`);

          // Phase 1: Consolidated Static State (Hold: 1.5s)
          tl.to({}, { duration: 1.5 });

          // Phase 2: The Burst (Duration: 1.0s)
          // Unified stagger from: "center" for true ripple effect
          tl.addLabel(`${labelPrefix}-fan`)
            .set(otherCards, { autoAlpha: 1 }, `${labelPrefix}-fan`)
            .to(otherCards, {
              x: (i) => (i < 3 ? -(3 - i) * 150 : (i - 2) * 150),
              y: (i) => (i < 3 ? -(3 - i) * 150 : (i - 2) * 150),
              duration: 1.0,
              ease: "power3.out",
              stagger: { amount: 0.4, from: "center" }
            }, `${labelPrefix}-fan`);

          // Phase 3: Momentum Hold (Duration: 1.5s)
          tl.to({}, { duration: 1.5 });

          // Phase 4: Velocity Snap (Duration: 0.6s)
          // High-velocity return using expo.in
          tl.addLabel(`${labelPrefix}-snap`)
            .to(otherCards, {
              x: 0,
              y: 0,
              duration: 0.6,
              ease: "expo.in",
              stagger: { amount: 0.3, from: "edges" }
            }, `${labelPrefix}-snap`);

          // Reset visibility for the next cycle transition
          tl.set(otherCards, { autoAlpha: 0 });
        }
      };

      const timer = window.setTimeout(buildTimeline, 100);
      const onResize = () => { window.clearTimeout(timer); buildTimeline(); };
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
