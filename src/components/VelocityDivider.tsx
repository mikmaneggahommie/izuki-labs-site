"use client";

import { VelocityRow } from "@/components/ui/scroll-velocity";

export default function VelocityDivider() {
  return (
    <section className="relative bg-black py-12 md:py-16 overflow-hidden border-y border-white/5">
      <VelocityRow baseVelocity={4}>
        <span className="text-[clamp(48px,8vw,120px)] font-black tracking-[-0.04em] text-white/[0.06] uppercase whitespace-nowrap px-[0.5em] leading-[1]">
          Design · Strategy · Identity · Content · Systems · Speed ·
        </span>
      </VelocityRow>
      <VelocityRow baseVelocity={-3}>
        <span className="text-[clamp(48px,8vw,120px)] font-black tracking-[-0.04em] text-white/[0.06] uppercase whitespace-nowrap px-[0.5em] leading-[1]">
          Clarity · Precision · Impact · Growth · Vision · Craft ·
        </span>
      </VelocityRow>
    </section>
  );
}
