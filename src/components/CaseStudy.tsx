"use client";

import { useEffect, useRef } from "react";
import { ScrollReveal } from "@/components/FancyText";
import { MagicText } from "@/components/ui/magic-text";
import { DoubleWordText } from "@/components/ui/double-word-text";

import { assetPath } from "@/lib/asset-path";
import { Compare } from "@/components/ui/compare";

export default function CaseStudy() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | undefined;

    const runReveal = async () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reducedMotion.matches || !sectionRef.current) return;

      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!active) return;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        const revealTargets = sectionRef.current?.querySelectorAll("[data-case-reveal]");
        if (!revealTargets?.length) return;

        gsap.fromTo(
          revealTargets,
          { y: 48, opacity: 0, filter: "blur(12px)" },
          {
            y: 0, opacity: 1, filter: "blur(0px)",
            duration: 0.94, stagger: 0.12, ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
          }
        );
      }, sectionRef);

      cleanup = () => context.revert();
    };

    void runReveal();
    return () => { active = false; cleanup?.(); };
  }, []);



  return (
    <section ref={sectionRef} id="cases" className="section-shell">
      <div className="content-shell space-y-20">
        {/* Title block — Always visible to ensure the design is 'there' */}
        <div className="space-y-6 mb-16">
          <div className="section-label-row">
            <span className="accent-square accent-square--tiny" aria-hidden />
            <span className="section-label">DESIGN SPOTLIGHT</span>
          </div>
          <h2 className="display-title text-white">
            This Month&apos;s Highlight
          </h2>
        </div>

        {/* Content grid — image LEFT, text RIGHT */}
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start pt-10">
          {/* Before / After Slider — left aligned */}
          <ScrollReveal>
            <div className="relative w-full overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
              <Compare
                firstImage={assetPath("/images/case-study/before.jpg")}
                secondImage={assetPath("/images/case-study/after.jpg")}
                firstImageClassName="object-contain"
                secondImageClassname="object-contain"
                className="w-full h-[400px] md:h-[550px] lg:h-[600px]"
                slideMode="drag"
                autoplay={false}
                showHandlebar={true}
              />
              {/* Labels */}
              <div className="absolute left-3 bottom-4 z-30 border border-white/5 bg-black/40 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white pointer-events-none">
                Before
              </div>
              <div className="absolute right-3 bottom-4 z-30 border border-white/5 bg-black/40 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white pointer-events-none">
                After
              </div>
            </div>
          </ScrollReveal>

          {/* Text — right side */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-10 lg:pt-4">
              <div className="space-y-4">
                <p className="section-label text-white">Campaign</p>
                <MagicText
                  text="5th Round Student Registration"
                  className="text-[22px] font-semibold leading-[1.35] text-white"
                />
                <MagicText
                  text="April 2026"
                  className="section-label text-white pt-1"
                />
              </div>

              <div className="space-y-6">
                 <DoubleWordText
            text="I completely overhauled their visual presence. By replacing inconsistent, low-impact content with a precision-engineered content system, I established a sharp and unique brand identity in Adobe Photoshop."
                  className="text-[14px] font-medium leading-[1.6] text-white/50"
                />
                <div className="border-t border-white/5 mt-12 pt-8">
                  <DoubleWordText
                    text="Following the implementation of this new design language, the project realized a 60% jump in registrations."
                    className="text-[14px] font-medium leading-[1.6] text-white/50"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
