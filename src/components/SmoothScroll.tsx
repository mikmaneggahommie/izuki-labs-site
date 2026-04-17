"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.15, // Smooth interpolation (0.1 = luxurious, 0.15 = snappy and tight)
      wheelMultiplier: 1,
      touchMultiplier: 2, // Feels better on mobile
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const reqId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(reqId);
    };
  }, []);

  return <>{children}</>;
}
