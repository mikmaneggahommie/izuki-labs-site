"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
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

const WORDMARK = (
  <>
    <span className="text-[clamp(56px,11vw,150px)] font-black tracking-[-0.04em] text-white whitespace-nowrap leading-[0.9]">
      IZUKI<span className="text-[#E50000]">.</span>LABS
    </span>
    <span className="text-[clamp(56px,11vw,150px)] font-black tracking-[-0.04em] text-white whitespace-nowrap leading-[0.9] ml-[0.5em]">
      IZUKI<span className="text-[#E50000]">.</span>LABS
    </span>
    <span className="text-[clamp(56px,11vw,150px)] font-black tracking-[-0.04em] text-white whitespace-nowrap leading-[0.9] ml-[0.5em]">
      IZUKI<span className="text-[#E50000]">.</span>LABS
    </span>
  </>
);

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress over a 350vh distance
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate subtle wordmark vertical shift during scroll
  const wordmarkY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  // Subtle opacity fade as we reach the end of the pin
  const heroOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[350vh] w-full z-0">
      {/* Sticky Container */}
      <section className="sticky top-0 h-screen w-full bg-black overflow-hidden">
        <motion.div style={{ opacity: heroOpacity }} className="h-full w-full">
          <InfiniteGallery
            images={HERO_IMAGES.map(img => ({ ...img, src: assetPath(img.src) }))}
            speed={1.0}
            zSpacing={3.5}
            visibleCount={7}
            isLocked={false}
            className="h-full w-full"
            scrollProgress={scrollYProgress} // Pass absolute progress to gallery
          />

          {/* IZUKI.LABS — TWO packed rows, full edge-to-edge */}
          <motion.div 
            style={{ y: wordmarkY }}
            className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-50 mix-blend-exclusion gap-1"
          >
            <VelocityRow baseVelocity={-4} className="pointer-events-none">
              {WORDMARK}
            </VelocityRow>
            <VelocityRow baseVelocity={4} className="pointer-events-none">
              {WORDMARK}
            </VelocityRow>

            {/* Edge fades */}
            <div className="absolute inset-y-0 left-0 w-[12%] bg-linear-to-r from-black to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-[12%] bg-linear-to-l from-black to-transparent z-10" />
          </motion.div>

          <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none z-50">
            <p className="font-mono uppercase text-[10px] tracking-widest text-white/30">
              Keep scrolling to explore the lab
            </p>
            {/* Visual indicator of scroll progress */}
            <div className="mt-4 mx-auto w-32 h-px bg-white/10 overflow-hidden">
              <motion.div 
                style={{ scaleX: scrollYProgress }} 
                className="h-full bg-[#E50000] origin-left" 
              />
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
