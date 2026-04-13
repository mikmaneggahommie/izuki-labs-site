"use client";

import { useEffect, useRef } from "react";

export default function AboutMarquee() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      try {
        const gsap = (await import("gsap")).default;
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const lines = sectionRef.current?.querySelectorAll(".about-line");
        if (!lines) return;

        lines.forEach((line, i) => {
          gsap.fromTo(
            line,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: line,
                start: "top 90%",
                toggleActions: "play none none reverse",
              },
              delay: i * 0.1,
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
      id="about"
      className="section-dark py-24 md:py-40"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Large text block — line-by-line reveal */}
        <div className="max-w-5xl">
          <div className="overflow-hidden mb-6">
            <p className="about-line text-body-large text-white/80 leading-[1.5]">
              Based in Addis Ababa, Mikiyas Daniel crafts
            </p>
          </div>
          <div className="overflow-hidden mb-6">
            <p className="about-line text-body-large text-white/80 leading-[1.5]">
              digital identities for brands seeking visual
            </p>
          </div>
          <div className="overflow-hidden mb-6">
            <p className="about-line text-body-large text-white/80 leading-[1.5]">
              distinction. From social media systems to full
            </p>
          </div>
          <div className="overflow-hidden mb-6">
            <p className="about-line text-body-large text-white/80 leading-[1.5]">
              brand architectures — every pixel serves
            </p>
          </div>
          <div className="overflow-hidden">
            <p className="about-line text-body-large text-white/80 leading-[1.5]">
              a purpose<span className="accent-square" />
            </p>
          </div>
        </div>

        {/* About + Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24 pt-16 border-t border-white/10">
          <div>
            <h3 className="text-label text-white/40 mb-6">About</h3>
            <h4 className="font-display text-xl font-bold tracking-tight text-white mb-4">
              Experience
            </h4>
            <p className="text-sm text-white/50 leading-relaxed">
              A designer focused on shaping brand identities and the visual
              worlds around them. From building brands from scratch to designing
              high-impact social media content — stripping away the noise to
              focus on the essential details that make a brand look and feel
              refined.
            </p>
          </div>

          <div>
            <h3 className="text-label text-white/40 mb-6">Services</h3>
            <h4 className="font-display text-xl font-bold tracking-tight text-white mb-4">
              Design Services
            </h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li>Social media design</li>
              <li>Brand identity</li>
              <li>Content systems</li>
              <li>Carousel design</li>
              <li>Stories & Reels covers</li>
              <li>Creative direction</li>
              <li>Logo design</li>
            </ul>
          </div>

          <div>
            <h3 className="text-label text-white/40 mb-6">Platforms</h3>
            <h4 className="font-display text-xl font-bold tracking-tight text-white mb-4">
              Digital Presence
            </h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>TikTok</li>
              <li>LinkedIn</li>
              <li>Telegram</li>
              <li>YouTube</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
