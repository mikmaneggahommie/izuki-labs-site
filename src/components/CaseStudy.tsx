"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function CaseStudy() {
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const sliderX = useMotionValue(52);
  const clipPath = useTransform(sliderX, (value) => `inset(0 ${100 - value}% 0 0)`);
  const sliderLeft = useTransform(sliderX, (value) => `${value}%`);

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
          sectionRef.current?.querySelectorAll("[data-case-reveal]");
        if (!revealTargets?.length) {
          return;
        }

        gsap.fromTo(
          revealTargets,
          { y: 40, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
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

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) {
      return;
    }

    const bounds = containerRef.current.getBoundingClientRect();
    const clamped = Math.max(0, Math.min(clientX - bounds.left, bounds.width));
    sliderX.set((clamped / bounds.width) * 100);
  };

  return (
    <section ref={sectionRef} id="cases" className="section-shell">
      <div className="content-shell space-y-14">
        <div
          data-case-reveal
          className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,0.5fr)] lg:items-end"
        >
          <div className="space-y-5">
            <div className="section-label-row">
              <span className="accent-square accent-square--tiny" aria-hidden />
              <span className="section-label">Case Study</span>
            </div>

            <h2 className="display-title max-w-[10ch]">
              InVision Africa
              <span className="accent-square" aria-hidden />
            </h2>
          </div>

          <p className="body-copy max-w-[34ch] lg:justify-self-end">
            A before-and-after look at how I tightened the hierarchy, clarified
            the messaging, and pushed the campaign toward a stronger
            registration response.
          </p>
        </div>

        <div data-case-reveal>
          <div
            ref={containerRef}
            className="relative mx-auto aspect-[16/9] w-full max-w-[1120px] overflow-hidden rounded-[18px] border border-white/10 bg-[#0A0A0A] shadow-[0_28px_90px_rgba(0,0,0,0.42)]"
            onPointerDown={(event) => {
              setDragging(true);
              updateSlider(event.clientX);
            }}
            onPointerMove={(event) => {
              if (dragging) {
                updateSlider(event.clientX);
              }
            }}
            onPointerUp={() => setDragging(false)}
            onPointerLeave={() => setDragging(false)}
            style={{ touchAction: "none" }}
          >
            <div className="absolute inset-0">
              <Image
                src="/images/case-study/before.jpg"
                alt="Before design"
                fill
                sizes="(max-width: 1120px) 100vw, 1120px"
                className="object-cover grayscale"
              />
            </div>

            <motion.div className="absolute inset-0" style={{ clipPath }}>
              <Image
                src="/images/case-study/after.jpg"
                alt="After design"
                fill
                sizes="(max-width: 1120px) 100vw, 1120px"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              className="absolute bottom-0 top-0 z-20 w-px bg-white"
              style={{ left: sliderLeft }}
            >
              <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black text-white shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
                  <path
                    d="M6 10H2m0 0 3-3m-3 3 3 3m9-3h4m0 0-3-3m3 3-3 3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </motion.div>

            <div className="absolute bottom-4 left-4 z-30 rounded-[4px] border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/68">
              Before
            </div>
            <div className="absolute bottom-4 right-4 z-30 rounded-[4px] border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/68">
              After
            </div>
          </div>
        </div>

        <div
          data-case-reveal
          className="grid gap-8 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.72fr)]"
        >
          <div className="space-y-2">
            <p className="section-label text-white/42">Campaign</p>
            <p className="text-[18px] font-medium leading-[1.5] text-white">
              5th Round Student Registration
            </p>
            <p className="section-label text-white/35">April 2026</p>
          </div>

          <div className="space-y-5">
            <p className="body-copy">
              The original campaign needed stronger hierarchy, sharper
              messaging, and a more immediate sense of urgency for the launch.
            </p>

            <p className="body-copy">
              I redesigned the visual system to tighten the spacing, increase
              contrast, and organize the information into a cleaner, faster,
              more social-first layout.
            </p>

            <p className="text-[18px] font-semibold leading-[1.7] text-white">
              The result is a more confident campaign that improves clarity,
              attention, and conversion momentum across the registration push.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
