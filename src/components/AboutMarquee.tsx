"use client";

import { useEffect, useRef } from "react";
import { ScrollReveal, ParallaxWrap } from "@/components/FancyText";
import { MagicText } from "@/components/ui/magic-text";

const columns = [
  {
    label: "What I Build",
    title: "Systems",
    items: [
      "Social media identities",
      "Campaign launches",
      "Content calendars",
      "Brand assets that stay consistent",
    ],
  },
  {
    label: "How I Work",
    title: "Process",
    items: [
      "Clear art direction",
      "Fast iteration cycles",
      "Structured monthly support",
      "Design decisions that feel intentional",
    ],
  },
  {
    label: "What It Feels Like",
    title: "Output",
    items: [
      "Sharper presence",
      "Higher perceived value",
      "Cleaner visual consistency",
      "Work that feels premium at first glance",
    ],
  },
];

export default function AboutMarquee() {
  const sectionRef = useRef<HTMLElement>(null);

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
        const revealTargets = sectionRef.current?.querySelectorAll("[data-about-reveal]");
        if (revealTargets?.length) {
          gsap.fromTo(
            revealTargets,
            { y: 52, opacity: 0, filter: "blur(12px)" },
            {
              y: 0, opacity: 1, filter: "blur(0px)",
              duration: 0.94, stagger: 0.12, ease: "power3.out",
              scrollTrigger: { trigger: sectionRef.current, start: "top 74%" },
            }
          );
        }
      }, sectionRef);

      cleanup = () => context.revert();
    };

    void runReveal();
    return () => { active = false; cleanup?.(); };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="section-shell">
      <div className="content-shell space-y-28">
        <div className="grid gap-14 border-b border-white/10 pb-20 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,0.48fr)] lg:items-end">
          <div className="space-y-6">
            <ScrollReveal>
              <div className="section-label-row">
                <span className="accent-square accent-square--tiny" aria-hidden />
                <span className="section-label">About</span>
              </div>
            </ScrollReveal>

            {/* MagicText — scroll-based word reveal */}
            <MagicText
              text="I build visual systems that make brands feel sharper, cleaner, and harder to ignore."
              className="text-[clamp(32px,5.5vw,80px)] font-black leading-[1.05] tracking-[-0.04em] text-white text-left w-full"
            />
          </div>

          <ScrollReveal delay={0.3}>
            <p className="body-copy max-w-[34ch] lg:justify-self-end">
              I work from Addis Ababa with a systems-first approach to content,
              campaigns, and identity. The goal is always the same: make the
              brand feel more intentional the moment someone lands on it.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid gap-16 lg:grid-cols-3">
          {columns.map((column, i) => (
            <ParallaxWrap key={column.title} speed={0.05 + i * 0.04}>
              <ScrollReveal delay={i * 0.1}>
                <div
                  data-about-reveal
                  className="flex flex-col justify-start pt-0 gap-24 lg:gap-44"
                >
                  <div className="space-y-6 lg:space-y-8">
                    <p className="section-label text-white/40">{column.label}</p>
                    <h3 className="text-[clamp(2.2rem,3.5vw,4rem)] font-black leading-[1.1] tracking-[-0.05em] text-[#E50000]">
                      {column.title}
                    </h3>
                  </div>
                  <ul className="space-y-6 lg:space-y-8">
                    {column.items.map((item) => (
                      <li
                        key={item}
                        className="text-[clamp(1rem,1.4vw,1.4rem)] font-medium leading-[1.4] tracking-[-0.02em] text-white/80"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </ParallaxWrap>
          ))}
        </div>
      </div>
    </section>
  );
}
