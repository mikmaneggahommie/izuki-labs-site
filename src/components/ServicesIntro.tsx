"use client";

import { TextGenerateEffect } from "@/components/ui/text-generate";

const services = [
  "Social Media Design",
  "Brand Identity Systems",
  "Content Strategy",
  "Campaign Art Direction",
  "Logo & Visual Assets",
  "Monthly Creative Retainers",
];

export default function ServicesIntro() {
  return (
    <section className="relative bg-black py-32 md:py-44 overflow-hidden">
      <div className="content-shell">
        <TextGenerateEffect
          words="What I can build for you"
          className="text-[clamp(40px,8vw,100px)] font-black leading-[1] tracking-[-0.04em] text-white mb-16"
          staggerDelay={0.12}
          duration={0.6}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {services.map((service, i) => (
            <TextGenerateEffect
              key={service}
              words={service}
              className="text-[clamp(18px,2.5vw,28px)] font-semibold text-white/70 tracking-[-0.02em]"
              staggerDelay={0.08}
              duration={0.4}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
