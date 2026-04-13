"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const accounts = [
  {
    handle: "@atmosphere_251",
    url: "https://www.instagram.com/atmosphere_251/",
    category: "Event Branding & Atmosphere Design",
    // Replace with a real post ID if needed
    embedUrl: "https://www.instagram.com/p/DAnXl4wM3b-/embed",
    description:
      "Full social media identity for Addis Ababa's premier event brand — from stories to feed aesthetics.",
  },
  {
    handle: "@loline_mag",
    url: "https://www.instagram.com/loline_mag/",
    category: "Editorial & Creative Direction",
    // Replace with a real post ID if needed
    embedUrl: "https://www.instagram.com/p/C9H8uKCMaWf/embed",
    description:
      "Visual direction and content design for a digital lifestyle and culture magazine.",
  },
];

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

        {/* Work Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {accounts.map((account, i) => (
            <div
              key={account.handle}
              className="work-card group block"
            >
              <div className="relative overflow-hidden rounded-2xl mb-8 flex items-center justify-center bg-gray-50 aspect-[4/5] shadow-sm">
                
                {/* Instagram Iframe Embed */}
                <iframe
                  className="w-[320px] md:w-[350px] max-w-[100%] h-[500px] md:h-[550px] border border-gray-200 rounded-lg shadow-sm bg-white mx-auto z-10"
                  src={`${account.embedUrl}`}
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency={true}
                  allow="encrypted-media"
                ></iframe>

                {/* Subtle Background elements to make it look premium */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-100/50 to-gray-200/20 blur-2xl -z-10"></div>
              </div>

              {/* Card Info */}
              <a href={account.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between group-hover:opacity-80 transition-opacity cursor-pointer">
                <div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#1A1A1A] group-hover:text-[#FF3F11] transition-colors">
                    {account.handle}
                  </h3>
                  <p className="text-meta text-[#1A1A1A]/50 mt-1">
                    {account.category}
                  </p>
                </div>
                <span className="text-[#1A1A1A]/30 group-hover:text-[#FF3F11] transition-colors text-2xl">
                  ↗
                </span>
              </a>

              <p className="text-sm text-[#1A1A1A]/60 mt-4 max-w-md leading-relaxed">
                {account.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
