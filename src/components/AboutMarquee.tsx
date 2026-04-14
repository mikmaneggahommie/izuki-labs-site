"use client";

import { useEffect, useRef } from "react";

const columns = [
  {
    label: "Experience",
    title: "Design Depth",
    items: [
      "4+ years of graphic design direction",
      "Identity systems for ambitious brands",
      "High-contrast layouts with editorial clarity",
    ],
  },
  {
    label: "Design Services",
    title: "Design Services",
    items: [
      "Social media systems",
      "Campaign art direction",
      "Content calendars and launch visuals",
      "Brand identity and collateral",
    ],
  },
  {
    label: "Digital Presence",
    title: "Digital Presence",
    items: [
      "Instagram",
      "TikTok",
      "Telegram",
      "Editorial and product storytelling",
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
      if (reducedMotion.matches || !sectionRef.current) {
        return;
      }

      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!active) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        const revealTargets =
          sectionRef.current?.querySelectorAll("[data-about-reveal]");
        if (!revealTargets?.length) {
          return;
        }

        gsap.fromTo(
          revealTargets,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 78%",
            },
          }
        );
      }, sectionRef);

      cleanup = () => context.revert();
    };

    runReveal();

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="section-shell">
      <div className="content-shell space-y-14">
        <div data-about-reveal className="section-label-row">
          <span className="accent-square accent-square--tiny" aria-hidden />
          <span className="section-label">About</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,1fr)]">
          <div />

          <p data-about-reveal className="statement-copy max-w-[15ch] md:max-w-none">
            Based in Addis Ababa, Mikiyas Daniel crafts digital identities for
            brands seeking visual distinction. From social media systems to full
            brand architectures, every pixel serves a purpose.
          </p>
        </div>

        <div className="grid gap-12 border-t border-white/10 pt-16 md:grid-cols-3 md:gap-x-10 lg:gap-x-16 lg:pt-20">
          {columns.map((column) => (
            <div
              key={column.title}
              data-about-reveal
              className="flex max-w-[26rem] flex-col gap-6"
            >
              <p className="text-[clamp(0.82rem,0.95vw,0.98rem)] font-medium uppercase tracking-[0.22em] text-white/42">
                {column.label}
              </p>
              <h3 className="text-[clamp(2.2rem,3vw,3.85rem)] font-black leading-[0.94] tracking-[-0.055em] text-white">
                {column.title}
              </h3>
              <ul className="space-y-3.5 pt-1">
                {column.items.map((item) => (
                  <li
                    key={item}
                    className="text-[clamp(1.35rem,1.72vw,2.05rem)] font-medium leading-[1.08] tracking-[-0.045em] text-white"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
