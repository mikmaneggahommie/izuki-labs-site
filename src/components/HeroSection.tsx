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
  { src: "/images/1.JPG", alt: "Editorial surface artwork" },
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
        // Anchor point is top: 50%, left: 70% as requested by User
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

        // Cycle through all cards as the "Anchor"
        for (let cycle = 0; cycle < cards.length; cycle++) {
          const currentAnchorIdx = (cards.length - 1 - cycle + cards.length) % cards.length;
          const otherCards = cards.filter((_, i) => i !== currentAnchorIdx);
          
          // Split of the other 6 cards into Top-Left and Bottom-Right groups
          const tlGroup = otherCards.slice(0, 3);
          const brGroup = otherCards.slice(3, 6);

          const labelPrefix = `cycle-${cycle}`;

          // Setup z-index so the current anchor is on top
          tl.set(cards, { zIndex: (i) => (i === currentAnchorIdx ? 100 : 10) }, `${labelPrefix}-start`)
            .set(otherCards, { autoAlpha: 0 }, `${labelPrefix}-start`);

          // Step 1: Hold (Consolidated)
          tl.to({}, { duration: 1.5 });

          // Step 2: Fan Out (The Spread)
          // Top-Left: indices 0-2 (multiplied by 160/140 for large spread)
          // Bottom-Right: indices 3-5 (multiplied by 160/140)
          tl.addLabel(`${labelPrefix}-fan`)
            .set(otherCards, { autoAlpha: 1 }, `${labelPrefix}-fan`)
            .to(tlGroup, {
              x: (i) => -(i + 1) * 160,
              y: (i) => -(i + 1) * 140,
              duration: 1.2,
              ease: "power3.out",
              stagger: { amount: 0.3, from: "center" }
            }, `${labelPrefix}-fan`)
            .to(brGroup, {
              x: (i) => (i + 1) * 160,
              y: (i) => (i + 1) * 140,
              duration: 1.2,
              ease: "power3.out",
              stagger: { amount: 0.3, from: "center" }
            }, `${labelPrefix}-fan`);

          // Step 3: Hold Spread
          tl.to({}, { duration: 1.5 });

          // Step 4: Consolidate (The Ripple Slap In)
          // Stagger amount: 0.3, from: "edges" for the slap-back look
          tl.addLabel(`${labelPrefix}-snap`)
            .to(otherCards, {
              x: 0,
              y: 0,
              duration: 0.8,
              ease: "power3.inOut",
              stagger: { amount: 0.3, from: "edges" }
            }, `${labelPrefix}-snap`);

          // Reset visibility for next cycle
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
