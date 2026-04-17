"use client";

import { assetPath } from "@/lib/asset-path";
import dynamic from "next/dynamic";
import { VelocityRow } from "@/components/ui/scroll-velocity";

const InfiniteGallery = dynamic(() => import("@/components/ui/3d-gallery-photography"), {
  ssr: false,
});

const HERO_IMAGES = [
  { src: "/images/3.jpg", alt: "Izuki Portfolio 3" },
  { src: "/images/4.jpg", alt: "Izuki Portfolio 4" },
  { src: "/images/2.jpg", alt: "Izuki Portfolio 2" },
  { src: "/images/1.JPG", alt: "Izuki Portfolio 1" },
  { src: "/images/5.jpg", alt: "Izuki Portfolio 5" },
  { src: "/images/6.jpg", alt: "Izuki Portfolio 6" },
  { src: "/images/7.jpg", alt: "Izuki Portfolio 7" },
];

const WORDMARK = (
  <>
    <span className="text-[clamp(56px,11vw,150px)] font-black tracking-[-0.04em] text-white whitespace-nowrap leading-[0.9]">
      IZUKI<span className="text-[#E50000]">.</span>LABS<span className="text-[#E50000]">.</span>
    </span>
    <span className="text-[clamp(56px,11vw,150px)] font-black tracking-[-0.04em] text-white whitespace-nowrap leading-[0.9] ml-[0.1em]">
      IZUKI<span className="text-[#E50000]">.</span>LABS<span className="text-[#E50000]">.</span>
    </span>
    <span className="text-[clamp(56px,11vw,150px)] font-black tracking-[-0.04em] text-white whitespace-nowrap leading-[0.9] ml-[0.1em]">
      IZUKI<span className="text-[#E50000]">.</span>LABS<span className="text-[#E50000]">.</span>
    </span>
  </>
);

export default function HeroSection() {
  return (
    <section className="relative h-[200vh] w-full bg-black z-0">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <InfiniteGallery
          images={HERO_IMAGES.map(img => ({ ...img, src: assetPath(img.src) }))}
          speed={1.0}
          zSpacing={5.5}
          visibleCount={4}
          className="h-full w-full"
        />

        {/* IZUKI.LABS — TWO packed rows, full edge-to-edge */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-50 mix-blend-exclusion gap-1">
          <VelocityRow baseVelocity={-4} className="pointer-events-none">
            {WORDMARK}
          </VelocityRow>
          <VelocityRow baseVelocity={4} className="pointer-events-none">
            {WORDMARK}
          </VelocityRow>

          {/* Edge fades */}
          <div className="absolute inset-y-0 left-0 w-[12%] bg-linear-to-r from-black to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-[12%] bg-linear-to-l from-black to-transparent z-10" />
        </div>
      </div>
    </section>
  );
}
