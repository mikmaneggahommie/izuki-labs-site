"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const accounts = [
  {
    handle: "@atmosphere_251",
    url: "https://www.instagram.com/atmosphere_251/",
    category: "Event Branding & Atmosphere Design",
    image: "/images/4.jpg",
    description:
      "Full social media identity for Addis Ababa's premier event brand — from stories to feed aesthetics.",
  },
  {
    handle: "@loline_mag",
    url: "https://www.instagram.com/loline_mag/",
    category: "Editorial & Creative Direction",
    image: "/images/5.jpg",
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

        // Parallax on phone mockups
        const mockups = sectionRef.current?.querySelectorAll(".phone-parallax");
        mockups?.forEach((mockup) => {
          gsap.to(mockup, {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: mockup,
              start: "top bottom",
              end: "bottom top",
              scrub: 2,
            },
          });
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {accounts.map((account, i) => (
            <a
              key={account.handle}
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              className="work-card group block"
            >
              <div className="relative overflow-hidden rounded-lg mb-6">
                {/* Phone Mockup */}
                <div className="relative aspect-[4/5] bg-[#ddd] rounded-lg overflow-hidden">
                  <Image
                    src={account.image}
                    alt={account.handle}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  {/* Phone mockup overlay */}
                  <div className="phone-parallax absolute bottom-6 right-6 z-10">
                    <div className="phone-mockup" style={{ width: 180, height: 360 }}>
                      <div className="phone-mockup-notch" />
                      <div className="phone-mockup-screen">
                        <Image
                          src={account.image}
                          alt={`${account.handle} phone`}
                          fill
                          className="object-cover"
                          sizes="180px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="flex items-start justify-between">
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
              </div>

              <p className="text-sm text-[#1A1A1A]/60 mt-3 max-w-md leading-relaxed">
                {account.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
