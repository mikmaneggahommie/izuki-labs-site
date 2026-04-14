"use client";

import { useEffect, useRef } from "react";

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
        const revealTargets =
          sectionRef.current?.querySelectorAll("[data-about-reveal]");
        if (!revealTargets?.length) {
          return;
        }

        gsap.fromTo(
          revealTargets,
          { y: 44, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.92,
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

    void runReveal();

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="section-shell">
      <div className="content-shell space-y-14">
        <div
          data-about-reveal
          className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,0.5fr)] lg:items-end"
        >
          <div className="space-y-5">
            <div className="section-label-row">
              <span className="accent-square accent-square--tiny" aria-hidden />
              <span className="section-label">About</span>
            </div>

            <h2 className="display-title max-w-[8ch]">
              I build visual systems that make brands feel sharper, cleaner,
              and harder to ignore.
            </h2>
          </div>

          <p className="body-copy max-w-[34ch] lg:justify-self-end">
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
              className="rounded-[18px] border border-white/8 bg-white/[0.02] p-7"
            >
              <p className="section-label text-white/40">{column.label}</p>
              <h3 className="mt-5 text-[clamp(2rem,3vw,3.6rem)] font-black leading-[0.92] tracking-[-0.06em] text-white">
                {column.title}
              </h3>
              <ul className="mt-8 space-y-3.5">
                {column.items.map((item) => (
                  <li
                    key={item}
                    className="text-[clamp(1.1rem,1.45vw,1.55rem)] font-medium leading-[1.08] tracking-[-0.045em] text-white"
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
