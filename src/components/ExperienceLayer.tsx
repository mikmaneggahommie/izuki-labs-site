"use client";

import { useEffect, useRef } from "react";

export default function ExperienceLayer() {
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const run = async () => {
      if (!auraRef.current) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reducedMotion.matches) return;

      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Cursor aura
      const xTo = gsap.quickTo(auraRef.current, "x", {
        duration: 0.7,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(auraRef.current, "y", {
        duration: 0.7,
        ease: "power3.out",
      });

      const handlePointerMove = (event: PointerEvent) => {
        xTo(event.clientX);
        yTo(event.clientY);
      };

      const handlePointerLeave = () => {
        xTo(window.innerWidth * 0.72);
        yTo(window.innerHeight * 0.18);
      };

      handlePointerLeave();
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerleave", handlePointerLeave);

      // --- GLOBAL SCROLL REVEAL ANIMATIONS ---
      // Animate display-title: clip from bottom, translate up
      gsap.utils.toArray(".display-title").forEach((el) => {
        const element = el as HTMLElement;
        gsap.fromTo(
          element,
          { y: 60, opacity: 0, filter: "blur(8px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Animate section-label: fade in + slide right
      gsap.utils.toArray(".section-label-row").forEach((el) => {
        const element = el as HTMLElement;
        gsap.fromTo(
          element,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Animate body-copy: fade in + blur
      gsap.utils.toArray(".body-copy").forEach((el) => {
        const element = el as HTMLElement;
        gsap.fromTo(
          element,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      cleanup = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    };

    void run();

    return () => cleanup?.();
  }, []);

  return (
    <div className="experience-layer" aria-hidden>
      <div ref={auraRef} className="experience-aura" />
      <div className="experience-gradient experience-gradient--top" />
      <div className="experience-gradient experience-gradient--bottom" />
      <div className="experience-noise" />
    </div>
  );
}
