"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/FancyText";
import { MagicText } from "@/components/ui/magic-text";

import { assetPath } from "@/lib/asset-path";

const workAccounts = [
  {
    name: "Atmosphere",
    handle: "@atmosphere_251",
    followers: "12,657 followers",
    href: "https://www.instagram.com/atmosphere_251/",
    summary:
      "A multipurpose cultural and creative space in the heart of Addis Ababa with a feed built around atmosphere, events, and visual culture.",
    avatar: "/images/atmosphere/profile.jpeg",
    previews: [
      "/images/atmosphere/1.jpeg",
      "/images/atmosphere/2.png",
      "/images/atmosphere/3.png",
      "/images/atmosphere/4.png",
      "/images/atmosphere/5.png",
      "/images/atmosphere/6.png",
    ],
  },
  {
    name: "Loline Mag | Ethiopian Digital Magazine",
    handle: "@loline_mag",
    followers: "15,216 followers",
    href: "https://www.instagram.com/loline_mag/",
    summary:
      "An Ethiopian digital magazine focused on stories, entrepreneurship, and community-led editorial publishing.",
    avatar: "/images/loline/profile.jpeg",
    previews: [
      "/images/loline/1.jpeg",
      "/images/loline/2.jpeg",
      "/images/loline/3.jpeg",
      "/images/loline/4.jpeg",
      "/images/loline/5.jpeg",
      "/images/loline/6.jpeg",
    ],
  },
];

export default function WorkShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeHover, setActiveHover] = useState<{ handle: string; idx: number } | null>(null);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | undefined;

    const runReveal = async () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reducedMotion.matches || !sectionRef.current) return;

      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!active) return;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        const revealTargets = sectionRef.current?.querySelectorAll("[data-work-reveal]");
        if (!revealTargets?.length) return;

        gsap.fromTo(
          revealTargets,
          { y: 48, opacity: 0, filter: "blur(10px)" },
          {
            y: 0, opacity: 1, filter: "blur(0px)",
            duration: 0.9, stagger: 0.12, ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
          }
        );
      }, sectionRef);

      cleanup = () => context.revert();
    };

    runReveal();
    return () => { active = false; cleanup?.(); };
  }, []);

  return (
    <section ref={sectionRef} id="work" className="section-shell">
      <div className="content-shell space-y-20">
        {/* Title — same style as Pricing */}
        <div
          data-work-reveal
          className="grid gap-14 border-b border-white/10 pb-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.48fr)] lg:items-end"
        >
          <div className="space-y-6">
            <div className="section-label-row">
              <span className="accent-square accent-square--tiny" aria-hidden />
              <span className="section-label">Works</span>
            </div>
            <MagicText
              text="Works"
              className="display-title"
            />
          </div>

          <MagicText
            text="Social media accounts I designed, managed, and grew from the ground up."
            className="body-copy max-w-[34ch] lg:justify-self-end"
          />
        </div>

        {/* Cards with lens-focus hover effect */}
        <div className="grid gap-10 lg:grid-cols-2">
          {workAccounts.map((account) => (
            <ScrollReveal key={account.handle}>
              <div
                data-work-reveal
                className={`group/card relative flex h-full flex-col gap-10 border transition-all duration-700 p-8
                  ${activeHover && activeHover.handle !== account.handle ? "blur-3xl! opacity-5! pointer-events-none scale-95 grayscale" : activeHover && activeHover.handle === account.handle ? "border-white/20 z-50 scale-[1.01]" : "border-white/8 hover:border-white/20"}
                  bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(10,10,10,1))]
                `}
              >
                {/* Header Section — blurs if ANY image in this card is hovered */}
                <div 
                  className={`transition-all duration-700 
                  ${activeHover && activeHover.handle === account.handle ? "opacity-100 scale-[1.02]" : activeHover ? "blur-xl opacity-5 scale-95" : "opacity-100"}
                `}>
                  {/* Top header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full">
                        <Image
                          src={assetPath(account.avatar)}
                          alt={account.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[22px] font-bold tracking-[-0.03em] text-white">{account.name}</p>
                        <p className="text-sm font-medium text-white">{account.handle}</p>
                      </div>
                    </div>
                    <a 
                      href={account.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-center justify-center h-10 w-10 border border-white/10 hover:border-white/30 transition-all active:scale-95"
                    >
                      <ArrowUpRight className="h-5 w-5 text-white/40 transition-colors group-hover/link:text-(--accent)" />
                    </a>
                  </div>

                  {/* Stats + summary */}
                  <div className="mt-8 flex items-center justify-between gap-4 border-y border-white/8 py-4 text-sm">
                    <span className="font-medium uppercase tracking-[0.15em] text-white">Instagram</span>
                    <span className="font-medium text-white">{account.followers}</span>
                  </div>

                  <p className="body-copy mt-6">{account.summary}</p>
                </div>

                {/* Images grid — siblings blur when one is hovered */}
                <div className="grid grid-cols-3 gap-4">
                  {account.previews.map((preview, idx) => {
                    const isHovered = activeHover?.handle === account.handle && activeHover?.idx === idx;
                    const isOtherHoveredInSameCard = activeHover?.handle === account.handle && activeHover?.idx !== idx;

                    return (
                      <div
                        key={`${account.handle}-${idx}`}
                        onMouseEnter={() => setActiveHover({ handle: account.handle, idx })}
                        onMouseLeave={() => setActiveHover(null)}
                        className={`relative aspect-square overflow-hidden transition-all duration-500 cursor-pointer border border-white/5 
                          ${isHovered ? "z-30 scale-[1.2] blur-none! opacity-100! shadow-[0_30px_90px_rgba(0,0,0,0.8)] border-white/20" : ""}
                          ${isOtherHoveredInSameCard ? "blur-xs opacity-30 grayscale scale-[0.9]" : ""}
                        `}
                      >
                        <Image
                          src={assetPath(preview)}
                          alt={`${account.name} preview ${idx + 1}`}
                          fill
                          sizes="(max-width: 1023px) 30vw, 150px"
                          className="object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
