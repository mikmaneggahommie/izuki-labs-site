"use client";

import { useEffect, useRef } from "react";

export default function ExperienceLayer() {
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const run = async () => {
      if (!auraRef.current) {
        return;
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reducedMotion.matches) {
        return;
      }

      const gsap = (await import("gsap")).default;
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

      cleanup = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
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
