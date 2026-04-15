"use client";

import { useRef } from "react";
import { assetPath } from "@/lib/asset-path";
import InfiniteGallery from "@/components/ui/3d-gallery-photography";
import { VelocityRow } from "@/components/ui/scroll-velocity";

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
  const containerRef = useRef<HTMLDivElement>(null);

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
        isLocked={false}
        className="h-full w-full"
      />

      {/* IZUKI.LABS — edge-to-edge velocity scroll */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-50 mix-blend-exclusion">
        <VelocityRow baseVelocity={-3} className="pointer-events-none">
          <span className="text-[20vw] font-black tracking-[-0.04em] text-white whitespace-nowrap px-[0.15em] leading-[0.85]">
            IZUKI<span className="text-[#E50000]">.</span>LABS
          </span>
        </VelocityRow>
      </div>

      {/* Subtle scroll hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-50">
        <p className="font-mono uppercase text-[10px] tracking-widest text-white/30">
          Scroll to explore
        </p>
      </div>
    </section>
  );
}
