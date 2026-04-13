"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";

export default function CaseStudy() {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderX = useMotionValue(50);
  const clipPath = useTransform(sliderX, (v) => `inset(0 ${100 - v}% 0 0)`);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      sliderX.set((x / rect.width) * 100);
    },
    [sliderX]
  );

  const onPointerDown = () => setIsDragging(true);
  const onPointerUp = () => setIsDragging(false);
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handleInteraction(e.clientX);
  };

  useEffect(() => {
    const loadGSAP = async () => {
      try {
        const gsap = (await import("gsap")).default;
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const el = sectionRef.current;
        if (!el) return;

        gsap.fromTo(
          el.querySelector(".case-content"),
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      } catch (e) {
        console.warn("GSAP not available:", e);
      }
    };

    loadGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cases"
      className="section-dark py-24 md:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 case-content">
        {/* Header */}
        <div className="mb-16">
          <p className="text-label text-white/40 mb-4">Case Study</p>
          <h2 className="font-display text-section text-white">
            This month&apos;s
            <br />
            highlighted design<span className="accent-square" />
          </h2>
          <p className="text-meta text-white/40 mt-4">April 2026</p>
        </div>

        {/* Before/After Slider */}
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerMove={onPointerMove}
          className="comparison-slider relative aspect-[16/9] w-full max-w-5xl mx-auto mb-16"
          style={{ touchAction: "none" }}
        >
          {/* Before — full background */}
          <div className="absolute inset-0">
            <Image
              src="/images/case-study/before.jpg"
              alt="Before redesign"
              fill
              className="object-cover grayscale"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>

          {/* After — clipped overlay */}
          <motion.div className="absolute inset-0" style={{ clipPath }}>
            <Image
              src="/images/case-study/after.jpg"
              alt="After redesign"
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </motion.div>

          {/* Slider handle */}
          <motion.div
            className="absolute top-0 bottom-0 w-[2px] bg-white z-20 pointer-events-none"
            style={{ left: useTransform(sliderX, (v) => `${v}%`) }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-black"
              >
                <path
                  d="M6 10L2 10M2 10L5 7M2 10L5 13M14 10L18 10M18 10L15 7M18 10L15 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>

          {/* Labels */}
          <div className="absolute bottom-4 left-4 z-30 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-md text-xs font-medium text-white/70">
            Before
          </div>
          <div className="absolute bottom-4 right-4 z-30 px-3 py-1.5 bg-white rounded-md text-xs font-medium text-black">
            After
          </div>
        </div>

        {/* Case Study Text */}
        <div className="max-w-3xl mx-auto">
          <h3 className="font-display text-2xl font-bold tracking-tight text-white mb-6">
            InVision Africa — 5th Round Student Registration
          </h3>
          <p className="text-white/50 leading-relaxed mb-4">
            InVision Africa approached me to overhaul their social media
            presence and create a compelling post for their 5th round student
            registration campaign. The brief was clear: make it impossible to
            scroll past.
          </p>
          <p className="text-white/50 leading-relaxed mb-4">
            After implementing the new design system — with bold typography,
            structured layouts, and an attention-grabbing color palette — the
            results spoke for themselves.
          </p>
          <p className="text-white/80 font-medium leading-relaxed">
            They saw a significant increase in student registration compared to
            their previous campaigns, proving that strategic visual design
            directly impacts conversion<span className="accent-square" />
          </p>
        </div>
      </div>
    </section>
  );
}
