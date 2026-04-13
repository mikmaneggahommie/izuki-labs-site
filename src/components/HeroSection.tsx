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

// Staircase positions — diagonal cascade like nickzoutendijk.nl
const positions = [
  { x: 0, y: 0, rotate: -2, w: 280, h: 360, z: 7 },
  { x: 90, y: 50, rotate: 1.5, w: 250, h: 320, z: 6 },
  { x: 180, y: 100, rotate: -1, w: 240, h: 310, z: 5 },
  { x: 40, y: 160, rotate: 2.5, w: 230, h: 300, z: 4 },
  { x: 150, y: 200, rotate: -1.5, w: 220, h: 290, z: 3 },
  { x: -30, y: 260, rotate: 1, w: 210, h: 280, z: 2 },
  { x: 120, y: 310, rotate: -2, w: 200, h: 270, z: 1 },
];

const marqueeText =
  "izuki.labs is a Social Media Designer and Visual Architect focused on brand identity, content systems & digital growth. — ";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP parallax on images
    const loadGSAP = async () => {
      try {
        const gsap = (await import("gsap")).default;
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const imgs = containerRef.current?.querySelectorAll(".hero-parallax-img");
        if (!imgs) return;

        imgs.forEach((img, i) => {
          gsap.to(img, {
            y: (i + 1) * -60,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.5,
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
      className="section-dark relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-16"
    >
      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[80vh]">
          {/* Left — Typography */}
          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-hero text-white"
            >
              izuki<span className="accent-square" />labs
            </motion.h1>

            {/* Marquee */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-8 overflow-hidden"
            >
              <div className="marquee-track">
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className="text-body-large text-white/60 whitespace-nowrap mr-4"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {marqueeText}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — Cascading Image Staircase */}
          <div className="relative h-[600px] lg:h-[700px] hidden md:block">
            <div className="staircase-container">
              {images.map((img, i) => (
                <motion.div
                  key={img.src}
                  initial={{ opacity: 0, y: 80, rotate: positions[i].rotate * 2 }}
                  animate={{ opacity: 1, y: 0, rotate: positions[i].rotate }}
                  transition={{
                    delay: 0.2 + i * 0.12,
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="hero-parallax-img staircase-image"
                  style={{
                    left: positions[i].x,
                    top: positions[i].y,
                    width: positions[i].w,
                    height: positions[i].h,
                    zIndex: positions[i].z,
                    transform: `rotate(${positions[i].rotate}deg)`,
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes={`${positions[i].w}px`}
                    priority={i < 3}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile: single hero image */}
          <div className="relative h-[400px] md:hidden rounded-lg overflow-hidden">
            <Image
              src="/images/1.JPG"
              alt="Mikiyas Daniel"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-label text-white/30">(Scroll down)</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-[1px] h-8 bg-white/20"
        />
      </motion.div>
    </section>
  );
}
