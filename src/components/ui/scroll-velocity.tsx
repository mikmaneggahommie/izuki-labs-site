"use client";

import React, { useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useMotionValue,
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
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const directionFactor = useRef(1);
  const prevTimestamp = useRef(0);

  useEffect(() => {
    let rafId: number;

    const tick = (timestamp: number) => {
      const delta = prevTimestamp.current
        ? (timestamp - prevTimestamp.current) / 1000
        : 0.016;
      prevTimestamp.current = timestamp;

      let moveBy = directionFactor.current * baseVelocity * delta;

      const vf = velocityFactor.get();
      if (vf < 0) {
        directionFactor.current = -1;
      } else if (vf > 0) {
        directionFactor.current = 1;
      }

      moveBy += directionFactor.current * moveBy * Math.abs(vf);

      let newX = baseX.get() + moveBy;

      // Wrap at -50% (2x content for seamless loop)
      if (newX <= -50) newX += 50;
      if (newX >= 0) newX -= 50;

      baseX.set(newX);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [baseVelocity, baseX, velocityFactor]);

  const x = useTransform(baseX, (v) => `${v}%`);

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className={`inline-flex whitespace-nowrap ${className}`}
        style={{ x }}
      >
        <span className="inline-block">{children}</span>
        <span className="inline-block">{children}</span>
      </motion.div>
    </div>
  );
}
