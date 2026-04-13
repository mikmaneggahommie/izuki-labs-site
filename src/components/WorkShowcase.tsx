"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export default function WorkShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      try {
        const gsap = (await import("gsap")).default;
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const cards = sectionRef.current?.querySelectorAll(".work-card");
        if (!cards) return;

        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { y: 80, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "top 50%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      } catch (e) {
        console.warn("GSAP not available:", e);
      }
    };

    loadGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="section-light py-24 md:py-32"
    >
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Section Header */}
        <div className="mb-20">
          <p className="text-label text-[#1A1A1A]/40 mb-4">Selected Work</p>
          <h2 className="font-display text-section text-[#1A1A1A]">
            Social media accounts
            <br />
            I have worked with<span className="accent-square" />
          </h2>
        </div>

        {/* Marquee */}
        <div className="overflow-hidden mb-16 border-t border-b border-black/5 py-4">
          <div className="marquee-track">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="text-sm tracking-widest uppercase text-[#1A1A1A]/20 whitespace-nowrap mx-8 font-display font-bold"
              >
                Selected Work — Brand Identity — Social Media — Content Design —
                Creative Direction —{" "}
              </span>
            ))}
          </div>
        </div>

        {/* Elfsight Widget Integration */}
        <div className="w-full relative z-10 bg-white/50 rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100">
          <div className="elfsight-app-8ceec645-dcea-42d1-8f53-17d46a861c3f" data-elfsight-app-lazy></div>
        </div>
      </div>
    </section>
  );
}
