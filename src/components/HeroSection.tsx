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
        const runCycle = () => {
          const leadIdx = projectIdxRef.current % cards.length;
          const leadCard = cards[leadIdx];
          const otherCards = cards.filter((item, i) => i !== leadIdx);
          
          const cycleTl = gsap.timeline();

          // PHASE A: The Resting Spotlight (2.5s Hold)
          cycleTl.set(cards, { zIndex: 10, autoAlpha: 0 });
          cycleTl.set(leadCard, { zIndex: 100, autoAlpha: 1, x: 0, y: 0 });
          
          cycleTl.to({}, { duration: 2.5 }); 

          // PHASE B: The Diagonal Burst (1.0s Duration)
          cycleTl.addLabel("burst");
          
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

          cycleTl.to({}, { duration: 0.4 });

          // PHASE C: The High-Velocity Snap (0.5s Duration)
          cycleTl.addLabel("snap");
          cycleTl.to(otherCards, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.5,
            ease: "expo.in",
            onComplete: () => {
              projectIdxRef.current = (projectIdxRef.current + 1) % totalImages;
            }
          }, "snap");

          return cycleTl;
        };

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
    <section id="top" className="section-shell hero-shell z-0 relative h-screen w-full overflow-hidden bg-black">
      <div className="content-shell hero-viewport relative min-h-screen">
        <div className="hero-copy absolute left-8 bottom-8 z-10 w-full max-w-lg">
          <h1 className="hero-wordmark" aria-label="Izuki Labs">
            <span className="hero-wordmark-line flex items-center">
              <span className="font-serif text-6xl md:text-9xl tracking-tighter uppercase font-black text-white">IZUKI</span>
              <span className="ml-2 h-4 w-4 bg-[#00FF00] rounded-full animate-pulse" aria-hidden />
            </span>
            <span className="hero-wordmark-line block font-serif text-6xl md:text-9xl tracking-tighter uppercase font-black text-white">LABS</span>
          </h1>
        </div>

        <div
          ref={stageRef}
          className="hero-stage absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div ref={unitRef} className="hero-unit relative w-[320px] h-[450px] md:w-[420px] md:h-[600px] flex items-center justify-center">
            {HERO_IMAGES.map((item, i) => (
              <article
                key={i}
                className="hero-card absolute inset-0"
                style={{ zIndex: 10 - i }}
              >
                <Image
                  src={assetPath(item.src)}
                  alt={item.alt}
                  fill
                  priority={i < 2}
                  className="hero-card-image object-cover border-[1px] border-[#00FF00]/20"
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
