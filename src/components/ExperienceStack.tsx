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
  const [phase, setPhase] = useState<"stacked" | "unstacked" | "focus" | "consolidate">("stacked");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animation Sequence Loop
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === "stacked") setPhase("unstacked");
      else if (phase === "unstacked") setPhase("focus");
      else if (phase === "consolidate") setPhase("stacked");
    }, 2500);

    return () => clearTimeout(timer);
  }, [phase]);

  // Handle Focus iteration
  useEffect(() => {
    if (phase === "focus") {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === images.length - 1) {
            setPhase("consolidate");
            return 0;
          }
          return prev + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Background Typography (Massive) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="text-[20vw] font-black uppercase tracking-tighter text-white/5 leading-none select-none">
          IZUKI<span className="text-white/10">.</span>LABS
        </h1>
      </div>

      <div className="relative w-full h-[80vh] max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {images.map((src, index) => {
            const isCurrent = index === currentIndex;
            
            // Positioning Logic for "Staircase" Cascade
            const cascadeX = (index - 3) * 120; // Staggered X
            const cascadeY = (index - 3) * 60;  // Staggered Y
            
            // Variants
            const variants = {
              stacked: {
                x: index * 4,
                y: index * -4,
                rotateZ: index * 2,
                scale: 0.9,
                opacity: 1,
                zIndex: 10 + index,
              },
              unstacked: {
                x: cascadeX,
                y: cascadeY,
                rotateZ: (index - 3) * 5,
                scale: 1,
                opacity: 0.8,
                zIndex: 20 + index,
              },
              focus: {
                x: isCurrent ? 0 : cascadeX * 1.5,
                y: isCurrent ? 0 : cascadeY * 1.5 - 100,
                rotateZ: isCurrent ? 0 : (index - 3) * 10,
                scale: isCurrent ? 1.2 : 0.6,
                zIndex: isCurrent ? 100 : 20 + index,
                opacity: isCurrent ? 1 : 0.3,
              },
              consolidate: {
                x: 0,
                y: 0,
                rotateZ: 0,
                scale: 0.8,
                opacity: 0,
                zIndex: 10,
              }
            };

            return (
              <motion.div
                key={src}
                initial="stacked"
                animate={phase}
                variants={variants}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 18,
                  mass: 0.8
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[450px] rounded-[2rem] overflow-hidden liquid-glass border-white/20 shadow-2xl"
              >
                <Image
                  src={src}
                  alt={`Experience ${index}`}
                  fill
                  className="object-cover"
                  priority={index < 2}
                  sizes="350px"
                />
                <div className="absolute inset-0 noise-overlay opacity-5" />
                
                {/* Image Label (Architectural Mono) */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">Artifact</span>
                  <span className="text-xs font-bold uppercase tracking-widest">{src.split('.')[0].slice(1)}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Foreground Typography */}
      <div className="absolute bottom-24 left-12 z-[101]">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col gap-2"
        >
          <h2 className="text-7xl font-black uppercase tracking-tighter leading-[0.85]">
            Experience <br /> <span className="text-white/40">Architecture</span>
          </h2>
          <div className="flex items-center gap-4 mt-4">
            <div className="h-[2px] w-12 bg-white" />
            <p className="text-xs font-mono uppercase tracking-[0.5em] opacity-60">
              Phase_{phase.toUpperCase()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Index Counter */}
      <div className="absolute top-12 right-12 z-[101] font-mono text-sm tracking-tighter opacity-20">
        [{currentIndex + 1} / {images.length}]
      </div>
    </div>
  );
}
