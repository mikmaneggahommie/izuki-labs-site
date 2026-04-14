"use client";

import { useEffect, useRef } from "react";

const headingLines = [
  "I build visual systems",
  "that make brands feel",
  "sharper, cleaner,",
  "and harder to ignore.",
];

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
        const headingLinesTargets =
          sectionRef.current?.querySelectorAll("[data-about-line]");
        const revealTargets =
          sectionRef.current?.querySelectorAll("[data-about-reveal]");

        if (headingLinesTargets?.length) {
          gsap.fromTo(
            headingLinesTargets,
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1,
              stagger: 0.08,
              ease: "expo.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 78%",
              },
            }
          );
        }

        if (revealTargets?.length) {
          gsap.fromTo(
            revealTargets,
            { y: 52, opacity: 0, filter: "blur(12px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.94,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 74%",
              },
            }
          );
        }
      }, sectionRef);

      cleanup = () => context.revert();
    };

    void runReveal();

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="section-shell">
      <div className="content-shell space-y-16">
        <div className="grid gap-8 border-b border-white/10 pb-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,0.48fr)] lg:items-end">
          <div className="space-y-5">
            <div data-about-reveal className="section-label-row">
              <span className="accent-square accent-square--tiny" aria-hidden />
              <span className="section-label">About</span>
            </div>

            <h2 className="max-w-[9ch] text-[clamp(48px,7vw,112px)] font-black leading-[0.92] tracking-[-0.05em] text-white">
              {headingLines.map((line) => (
                <span key={line} className="block overflow-hidden">
                  <span className="block" data-about-line>
                    {line}
                  </span>
                </span>
              ))}
            </h2>
          </div>

          <p
            data-about-reveal
            className="body-copy max-w-[34ch] lg:justify-self-end"
          >
            I work from Addis Ababa with a systems-first approach to content,
            campaigns, and identity. The goal is always the same: make the
            brand feel more intentional the moment someone lands on it.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {columns.map((column) => (
            <div
              key={column.title}
              data-about-reveal
              className="rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_44%),rgba(255,255,255,0.02)] p-8 transition-transform duration-500 hover:-translate-y-2"
            >
              <p className="section-label text-white/40">{column.label}</p>
              <h3 className="mt-6 text-[clamp(2.4rem,3.2vw,3.9rem)] font-black leading-[0.94] tracking-[-0.05em] text-white">
                {column.title}
              </h3>
              <ul className="mt-10 space-y-5">
                {column.items.map((item) => (
                  <li
                    key={item}
                    className="text-[clamp(1.12rem,1.55vw,1.6rem)] font-medium leading-[1.16] tracking-[-0.035em] text-white"
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
