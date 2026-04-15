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
  const wrapARef = useRef<HTMLDivElement>(null);
  const wrapBRef = useRef<HTMLDivElement>(null);
  
  const [groupA, setGroupA] = useState<HeroCardData[]>([]);
  const [groupB, setGroupB] = useState<HeroCardData[]>([]);
  const projectIdx = useRef(0);

  const getSet = (offset: number) => {
    const set = [];
    for (let i = 0; i < 7; i++) {
      set.push(ALL_PROJECTS[(offset + i) % ALL_PROJECTS.length]);
    }
    return set;
  };

  useEffect(() => {
    // Initial Setup
    setGroupA(getSet(0));
    setGroupB(getSet(1));
  }, []);

  useEffect(() => {
    let alive = true;
    let tl: gsap.core.Timeline | undefined;

    const boot = async () => {
      const gsap = (await import("gsap")).default;
      if (!alive || !wrapARef.current || !wrapBRef.current) return;

      const cardsA = Array.from(wrapARef.current.querySelectorAll<HTMLElement>(".hero-card"));
      const cardsB = Array.from(wrapBRef.current.querySelectorAll<HTMLElement>(".hero-card"));

      // Setup styles
      gsap.set([wrapARef.current, wrapBRef.current], { 
        position: "absolute", 
        top: "50%", 
        left: "70%", 
        xPercent: -50, 
        yPercent: -50 
      });
      gsap.set([cardsA, cardsB], { x: 0, y: 0, xPercent: -50, yPercent: -50, autoAlpha: 1 });
      
      // Hide back-cards initially
      gsap.set(cardsA.slice(0, -1), { autoAlpha: 0 });
      gsap.set(cardsB.slice(0, -1), { autoAlpha: 0 });

      tl = gsap.timeline({ repeat: -1 });

      const addSequence = (activeCards: HTMLElement[], inactiveWrap: HTMLElement, isFirst: boolean) => {
        const tlGroup = activeCards.slice(0, 3);
        const brGroup = activeCards.slice(3, 6);
        const anchor = activeCards[6];

        // 1. Hold
        tl!.to({}, { duration: 1.5 });

        // 2. Unstack
        tl!.addLabel(isFirst ? "fan-a" : "fan-b")
           .set(activeCards, { autoAlpha: 1 })
           .to(tlGroup, {
             x: (i) => -((3 - i) * 200),
             y: (i) => -((3 - i) * 180),
             duration: 1.2,
             ease: "expo.out",
             stagger: 0.05
           }, isFirst ? "fan-a" : "fan-b")
           .to(brGroup, {
             x: (i) => (i + 1) * 200,
             y: (i) => (i + 1) * 180,
             duration: 1.2,
             ease: "expo.out",
             stagger: 0.05
           }, isFirst ? "fan-a" : "fan-b");

        // 3. Hold Fan
        tl!.to({}, { duration: 1.5 });

        // 4. Snap back to local (0,0) - The Anchor
        tl!.addLabel(isFirst ? "snap-a" : "snap-b")
           .to(activeCards, {
             x: 0,
             y: 0,
             duration: 1.2,
             ease: "expo.inOut",
             stagger: { each: 0.04, from: "start" }
           }, isFirst ? "snap-a" : "snap-b");

        // 5. Swap Prep
        tl!.call(() => {
          projectIdx.current = (projectIdx.current + 1) % ALL_PROJECTS.length;
          if (isFirst) {
            setGroupB(getSet(projectIdx.current + 1));
          } else {
            setGroupA(getSet(projectIdx.current + 1));
          }
        });

        tl!.set(activeCards.slice(0, -1), { autoAlpha: 0 });
        tl!.to(activeCards, { autoAlpha: 0, duration: 0.6 });
        tl!.to(inactiveWrap, { autoAlpha: 1, duration: 0.6 }, "<");
      };

      // Play A
      gsap.set(wrapARef.current, { autoAlpha: 1 });
      gsap.set(wrapBRef.current, { autoAlpha: 0 });
      addSequence(cardsA, wrapBRef.current, true);
      
      // Play B
      addSequence(cardsB, wrapARef.current, false);
    };

    boot();
    return () => { alive = false; tl?.kill(); };
  }, [groupA.length, groupB.length]); // Re-run only on init or if structure changes (rare)

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
          {/* Layer A */}
          <div ref={wrapARef} className="hero-unit" style={{ opacity: 0 }}>
            {groupA.map((card, ci) => (
              <article key={`a-${ci}`} className="hero-card" style={{ zIndex: ci + 1 }}>
                <Image src={assetPath(card.src)} alt={card.alt} fill 
                  priority={ci === 6} className="hero-card-image" 
                  sizes="360px" />
              </article>
            ))}
          </div>

          {/* Layer B */}
          <div ref={wrapBRef} className="hero-unit" style={{ opacity: 0 }}>
            {groupB.map((card, ci) => (
              <article key={`b-${ci}`} className="hero-card" style={{ zIndex: ci + 1 }}>
                <Image src={assetPath(card.src)} alt={card.alt} fill 
                  className="hero-card-image" sizes="360px" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


