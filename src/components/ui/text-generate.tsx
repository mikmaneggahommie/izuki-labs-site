"use client";

import { motion, stagger, useAnimate, useInView } from "framer-motion";
import React, { useEffect, useMemo, useRef } from "react";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  staggerDelay?: number;
}

export function TextGenerateEffect({
  words,
  className = "",
  filter = true,
  duration = 0.5,
  staggerDelay = 0.15,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10% 0px" });
  const wordsArray = useMemo(() => words.split(" "), [words]);

  useEffect(() => {
    if (isInView && scope.current) {
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration,
          delay: stagger(staggerDelay),
        }
      );
    }
  }, [isInView, animate, duration, filter, scope, staggerDelay]);

  return (
    <div className={className} ref={containerRef}>
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            className="inline-block mr-[0.25em] opacity-0 will-change-[transform,opacity,filter]"
            style={{
              filter: filter ? "blur(10px)" : "none",
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
