"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  wrap,
} from "framer-motion";

interface VelocityRowProps {
  children: React.ReactNode;
  baseVelocity?: number;
  className?: string;
}

export function VelocityRow({
  children,
  baseVelocity = 5,
  className = "",
}: VelocityRowProps) {
  const baseX = useRef(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const [repetitions, setRepetitions] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateRepetitions = () => {
      if (!containerRef.current) return;
      const el = containerRef.current.querySelector("[data-text]") as HTMLElement;
      if (!el) return;
      const textWidth = el.offsetWidth;
      const screenWidth = window.innerWidth;
      const needed = Math.ceil(screenWidth / textWidth) + 2;
      setRepetitions(Math.max(needed, 4));
    };
    updateRepetitions();
    window.addEventListener("resize", updateRepetitions);
    return () => window.removeEventListener("resize", updateRepetitions);
  }, [children]);

  const x = useTransform(() => `${wrap(-100 / repetitions, 0, baseX.current)}%`);

  const directionFactor = useRef(1);
  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.current += moveBy;
  });

  return (
    <div className="overflow-hidden whitespace-nowrap" ref={containerRef}>
      <motion.div className={`inline-flex whitespace-nowrap ${className}`} style={{ x }}>
        {Array.from({ length: repetitions }).map((_, i) => (
          <span key={i} className="inline-block" data-text={i === 0 ? true : undefined}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
