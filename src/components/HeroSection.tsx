"use client";

import { useState, useEffect, useRef } from "react";
import { assetPath } from "@/lib/asset-path";
import InfiniteGallery from "@/components/ui/3d-gallery-photography";

const HERO_IMAGES = [
  { src: "/images/7.jpg", alt: "Izuki Portfolio 7" },
  { src: "/images/6.jpg", alt: "Izuki Portfolio 6" },
  { src: "/images/5.jpg", alt: "Izuki Portfolio 5" },
  { src: "/images/4.jpg", alt: "Izuki Portfolio 4" },
  { src: "/images/3.jpg", alt: "Izuki Portfolio 3" },
  { src: "/images/2.jpg", alt: "Izuki Portfolio 2" },
  { src: "/images/1.JPG", alt: "Izuki Portfolio 1" },
];

export default function HeroSection() {
  const [isLocked, setIsLocked] = useState(true);
  const [virtualScroll, setVirtualScroll] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Threshold: How many scroll "ticks" before we unlock the page
  const LOCK_THRESHOLD = 2000; 

  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (!isLocked) return;

      // Only capture if we are at the top of the page
      if (window.scrollY > 10) {
        setIsLocked(false);
        return;
      }

      // Accumulate virtual scroll
      setVirtualScroll(prev => {
        const next = prev + Math.abs(e.deltaY);
        if (next > LOCK_THRESHOLD) {
          setIsLocked(false);
          return next;
        }
        return next;
      });
    };

    window.addEventListener("wheel", handleGlobalWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleGlobalWheel);
  }, [isLocked]);

  return (
    <section 
      ref={containerRef}
      id="top" 
      className="relative h-screen w-full bg-black overflow-hidden z-0"
    >
      <InfiniteGallery
        images={HERO_IMAGES.map(img => ({ ...img, src: assetPath(img.src) }))}
        speed={1.2}
        zSpacing={3.5}
        visibleCount={7}
        isLocked={isLocked}
        className="h-full w-full"
      />
      
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-center px-4 mix-blend-exclusion text-white z-50">
        <h1 className="font-serif text-6xl md:text-9xl tracking-tighter uppercase font-black">
          <span className="block opacity-90 italic">IZUKI</span>
          <span className="block -mt-4 md:-mt-8">LABS</span>
        </h1>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-50 transition-opacity duration-500" style={{ opacity: isLocked ? 1 : 0 }}>
        <p className="font-mono uppercase text-[10px] tracking-widest text-white/40">
          Capture Initiated — Scroll to reveal depth
        </p>
        <div className="mt-2 h-1 w-24 mx-auto bg-white/5 overflow-hidden">
          <div 
            className="h-full bg-[#00FF00] transition-all duration-300" 
            style={{ width: `${Math.min(100, (virtualScroll / LOCK_THRESHOLD) * 100)}%` }} 
          />
        </div>
      </div>
    </section>
  );
}
