"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function HighlightSlider() {
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderPos = useMotionValue(50);
  const smoothedSliderPos = useSpring(sliderPos, { stiffness: 300, damping: 30 });

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    sliderPos.set(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isResizing) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isResizing) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Visual Hardening
          </h2>
          <p className="text-muted-foreground font-mono uppercase text-sm tracking-widest">
            Case Study: Invision Africa • Before & After
          </p>
        </div>

        <div 
          ref={containerRef}
          onMouseMove={onMouseMove}
          onTouchMove={onTouchMove}
          onMouseDown={() => setIsResizing(true)}
          onMouseUp={() => setIsResizing(false)}
          onMouseLeave={() => setIsResizing(false)}
          onTouchStart={() => setIsResizing(true)}
          onTouchEnd={() => setIsResizing(false)}
          className="relative aspect-[16/9] w-full liquid-glass rounded-[2rem] overflow-hidden cursor-ew-resize select-none border-white/10"
        >
          {/* Before Image */}
          <div className="absolute inset-0 grayscale">
            <img 
              src="/Before and After/BEfore.jpg" 
              alt="Before" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* After Image (Clipped) */}
          <motion.div 
            style={{ width: smoothedSliderPos.get() + "%" }}
            className="absolute inset-0 z-10 overflow-hidden pointer-events-none border-r-2 border-accent"
          >
            <div className="absolute inset-0 w-[100vw] h-full sm:w-[57rem] md:w-[64rem] lg:w-[80rem] xl:w-[90rem]">
              <img 
                src="/Before and After/After.jpg" 
                alt="After" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Liquid Glimmer effect on the edge */}
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-accent/20 to-transparent pointer-events-none" />
          </motion.div>

          {/* Slider Handle */}
          <motion.div
            style={{ left: smoothedSliderPos.get() + "%" }}
            className="absolute top-0 bottom-0 w-[2px] bg-accent z-20 pointer-events-none"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-accent bg-background/50 backdrop-blur-md flex items-center justify-center shadow-liquid">
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-accent" />
                <div className="w-1 h-1 rounded-full bg-accent" />
                <div className="w-1 h-1 rounded-full bg-accent" />
              </div>
            </div>
          </motion.div>

          {/* Labels */}
          <div className="absolute bottom-6 left-6 z-30 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] uppercase font-bold tracking-widest text-white/60">
            Initial State
          </div>
          <div className="absolute bottom-6 right-6 z-30 px-3 py-1 bg-accent/80 backdrop-blur-md rounded-full text-[10px] uppercase font-bold tracking-widest text-white">
            Liquid Result
          </div>
        </div>
      </div>
    </section>
  );
}
