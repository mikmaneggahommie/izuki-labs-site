"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const images = [
  { src: "/images/1.JPG", alt: "Mikiyas Daniel" },
  { src: "/images/2.jpg", alt: "Design Work 2" },
  { src: "/images/3.jpg", alt: "Design Work 3" },
  { src: "/images/4.jpg", alt: "Design Work 4" },
  { src: "/images/5.jpg", alt: "Design Work 5" },
  { src: "/images/6.jpg", alt: "Design Work 6" },
  { src: "/images/7.jpg", alt: "Design Work 7" },
];

// Staircase end positions — diagonal cascade like nickzoutendijk.nl
// Using more compact spacing for smaller screens
const endPositions = [
  { x: 0, y: 0, rotate: 0, w: 320, h: 420, z: 7 }, 
  { x: "10vw", y: "10vh", rotate: 2, w: 280, h: 380, z: 6 },
  { x: "20vw", y: "20vh", rotate: -2, w: 260, h: 360, z: 5 },
  { x: "30vw", y: "30vh", rotate: 1, w: 240, h: 340, z: 4 },
  { x: "40vw", y: "40vh", rotate: -1.5, w: 220, h: 320, z: 3 },
  { x: "50vw", y: "50vh", rotate: 2.5, w: 200, h: 300, z: 2 },
  { x: "60vw", y: "60vh", rotate: -1, w: 180, h: 280, z: 1 },
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const staircaseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP scroll trigger for unstacking animation
    const loadGSAP = async () => {
      try {
        const gsap = (await import("gsap")).default;
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const imgs = containerRef.current?.querySelectorAll(".staircase-image");
        if (!imgs) return;

        // Unstacking animation: scrubbed through scroll
        imgs.forEach((img, i) => {
          if (i === 0) return; // Main card stays anchored
          gsap.to(img, {
            x: endPositions[i].x,
            y: endPositions[i].y,
            rotation: endPositions[i].rotate,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        });
      } catch (e) {
        console.warn("GSAP not available:", e);
      }
    };

    loadGSAP();
  }, []);

  return (
    <section
      ref={containerRef}
      className="section-dark relative h-[250vh]" // Tall section to allow scrolling
    >
      <div className="sticky top-0 h-screen w-full flex flex-col justify-end overflow-hidden pb-16">
        <div className="max-w-7xl mx-auto w-full px-8 md:px-16 lg:px-24 h-full relative">
          
          {/* Images Stack - Centered */}
          <div 
            ref={staircaseRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-full pointer-events-none hidden md:block"
          >
            {images.map((img, i) => (
              <motion.div
                key={img.src}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2 + (images.length - i) * 0.05,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="staircase-image absolute rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  left: 0,
                  top: 0,
                  width: endPositions[i].w,
                  height: endPositions[i].h,
                  zIndex: endPositions[i].z,
                }}
              >
                <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none"></div>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes={`${endPositions[i].w}px`}
                  priority={i < 3}
                />
              </motion.div>
            ))}
          </div>

          {/* Typography & Marquee */}
          <div className="relative z-20 flex flex-col justify-end h-full pb-12">
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display leading-[0.85] tracking-tighter text-white uppercase font-extrabold"
              style={{ fontSize: "clamp(4rem, 15vw, 10rem)" }}
            >
              izuki<span className="text-[#FF3F11]">.</span><br />
              labs
            </motion.h1>

            {/* "Newskinda" Marquee Animation */}
            <div className="mt-20 overflow-hidden border-y border-white/5 py-5 opacity-40 hover:opacity-100 transition-opacity">
              <div className="marquee-track">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-12 px-6 whitespace-nowrap">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF3F11]">Systems</span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">Social Media Architecture</span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF3F11]">Growth</span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">Visual Distinction</span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF3F11]">Architecture</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: single hero image */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] h-[48vh] md:hidden rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            <Image
              src="/images/1.JPG"
              alt="Mikiyas Daniel"
              fill
              className="object-cover object-top pointer-events-none"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
