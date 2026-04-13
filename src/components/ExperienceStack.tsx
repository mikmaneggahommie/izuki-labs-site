"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/1.JPG",
  "/2.jpg",
  "/3.jpg",
  "/4.jpg",
  "/5.jpg",
  "/6.jpg",
  "/7.jpg",
];

export default function ExperienceStack() {
  const [phase, setPhase] = useState<"stacked" | "unstacked" | "iterating" | "restacking">("stacked");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animation Loop: Stacked -> Unstacked -> Iterate through images -> Restacked
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === "stacked") setPhase("unstacked");
      else if (phase === "unstacked") setPhase("iterating");
      else if (phase === "restacking") setPhase("stacked");
    }, 2000);

    return () => clearTimeout(timer);
  }, [phase]);

  // Handle iteration through images
  useEffect(() => {
    if (phase === "iterating") {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === images.length - 1) {
            setPhase("restacking");
            return 0;
          }
          return prev + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <div className="relative flex items-center justify-center w-full h-[600px] overflow-hidden">
      <AnimatePresence mode="popLayout">
        {images.map((src, index) => {
          const isCurrent = index === currentIndex;
          const isStacked = phase === "stacked" || phase === "restacking";
          
          return (
            <motion.div
              key={src}
              initial={false}
              animate={{
                x: isStacked ? index * 4 : (isCurrent ? 0 : (index - currentIndex) * 120),
                y: isStacked ? index * -4 : 0,
                rotateZ: isStacked ? index * 2 : 0,
                scale: isCurrent ? 1 : 0.8,
                zIndex: isCurrent ? 50 : 10 - Math.abs(index - currentIndex),
                opacity: phase === "iterating" && !isCurrent ? 0.3 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="absolute w-[300px] h-[400px] rounded-2xl overflow-hidden liquid-glass shadow-liquid"
            >
              <Image
                src={src}
                alt={`Experience ${index}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
              {/* Grainy Noise Overlay integrated in CSS but applied via class */}
              <div className="absolute inset-0 noise-overlay opacity-5" />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Hero Text Overlay (Minimalist) */}
      <div className="absolute bottom-12 left-12 z-50 mix-blend-difference text-white">
        <h1 className="text-6xl font-bold tracking-tighter uppercase leading-none">
          Experience <br /> Stacks
        </h1>
        <p className="mt-4 text-sm opacity-60 max-w-xs font-mono">
          PHASE: {phase.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
