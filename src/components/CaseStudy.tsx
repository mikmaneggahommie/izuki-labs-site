"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/FancyText";

import { assetPath } from "@/lib/asset-path";

export default function CaseStudy() {
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const sliderX = useMotionValue(50);
  const clipPath = useTransform(sliderX, (value) => `inset(0 ${100 - value}% 0 0)`);
  const sliderLeft = useTransform(sliderX, (value) => `${value}%`);

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
        const revealTargets = sectionRef.current?.querySelectorAll("[data-case-reveal]");
        if (!revealTargets?.length) return;

        gsap.fromTo(
          revealTargets,
          { y: 48, opacity: 0, filter: "blur(12px)" },
          {
            y: 0, opacity: 1, filter: "blur(0px)",
            duration: 0.94, stagger: 0.12, ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
          }
        );
      }, sectionRef);

      cleanup = () => context.revert();
    };

    void runReveal();
    return () => { active = false; cleanup?.(); };
  }, []);

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const clamped = Math.max(0, Math.min(clientX - bounds.left, bounds.width));
    sliderX.set((clamped / bounds.width) * 100);
  };

  return (
    <section ref={sectionRef} id="cases" className="section-shell">
      <div className="content-shell space-y-20">
        {/* Title block */}
        <div data-case-reveal className="space-y-6">
          <div className="section-label-row">
            <span className="accent-square accent-square--tiny" aria-hidden />
            <span className="section-label">Design Spotlight</span>
          </div>
          <h2 className="display-title">This Month&apos;s<br />Highlight</h2>
        </div>

        {/* Content grid — image LEFT, text RIGHT */}
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
          {/* Before / After Slider — left aligned */}
          <ScrollReveal>
            <div
              ref={containerRef}
              className="relative w-full overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-[0_28px_90px_rgba(0,0,0,0.42)]"
              onPointerDown={(event) => {
                setDragging(true);
                updateSlider(event.clientX);
              }}
              onPointerMove={(event) => {
                if (dragging) updateSlider(event.clientX);
              }}
              onPointerUp={() => setDragging(false)}
              onPointerLeave={() => setDragging(false)}
              style={{ touchAction: "none" }}
            >
              {/* After image — this is the base (taller portrait), sets container height */}
              <Image
                src={assetPath("/images/case-study/after.jpg")}
                alt="After design"
                width={2803}
                height={3480}
                className="block w-full h-auto"
                sizes="(max-width: 767px) 90vw, 55vw"
                priority
              />

              {/* Before image — clipped overlay from left */}
              <motion.div className="absolute inset-0" style={{ clipPath }}>
                <Image
                  src={assetPath("/images/case-study/before.jpg")}
                  alt="Before design"
                  width={1080}
                  height={1080}
                  className="w-full h-full object-cover grayscale"
                  sizes="(max-width: 767px) 90vw, 55vw"
                  priority
                />
              </motion.div>

              {/* Slider handle */}
              <motion.div
                className="absolute bottom-0 top-0 z-20 w-px bg-white"
                style={{ left: sliderLeft }}
              >
                <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-white/15 bg-black text-white shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
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

              {/* Labels */}
              <div className="absolute left-4 top-4 z-30 border border-white/10 bg-black/72 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/68">
                Before
              </div>
              <div className="absolute right-4 top-4 z-30 border border-white/10 bg-black/72 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/68">
                After
              </div>
            </div>
          </ScrollReveal>

          {/* Text — right side */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-10 lg:pt-4">
              <div className="space-y-4">
                <p className="section-label text-white/42">Campaign</p>
                <p className="text-[22px] font-semibold leading-[1.35] text-white">
                  5th Round Student Registration
                </p>
                <p className="section-label text-white/35 pt-1">April 2026</p>
              </div>

              <div className="space-y-6">
                <p className="body-copy">
                  The original campaign needed stronger hierarchy, sharper
                  messaging, and a more immediate sense of urgency for the launch.
                </p>
                <p className="body-copy">
                  I rebuilt the visual system for a vertical-first format, tightened
                  the spacing, lifted contrast, and reorganized the information so
                  it could stop the scroll faster.
                </p>
                <p className="text-[18px] font-semibold leading-[1.7] text-white">
                  The result is a cleaner campaign with better focus, stronger
                  momentum, and a more premium registration push.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
