"use client";

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
  return (
    <section id="top" className="relative h-screen w-full overflow-hidden bg-black">
      <InfiniteGallery
        images={HERO_IMAGES.map(img => ({ ...img, src: assetPath(img.src) }))}
        speed={0.8}
        zSpacing={4}
        visibleCount={10}
        className="h-full w-full"
      />
      
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-center px-4 mix-blend-exclusion text-white z-50">
        <h1 className="font-serif text-6xl md:text-9xl tracking-tighter uppercase font-black">
          <span className="block opacity-90 italic">IZUKI</span>
          <span className="block -mt-4 md:-mt-8">LABS</span>
        </h1>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-50">
        <p className="font-mono uppercase text-[10px] tracking-widest text-white/40">
          Orbiting the perimeter — Use scroll / arrows to navigate
        </p>
      </div>
    </section>
  );
}
