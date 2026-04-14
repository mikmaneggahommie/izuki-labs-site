"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";

const workAccounts = [
  {
    name: "Atmosphere",
    handle: "@atmosphere_251",
    followers: "12,657 followers",
    href: "https://www.instagram.com/atmosphere_251/",
    summary:
      "A multipurpose cultural and creative space in the heart of Addis Ababa with a feed built around atmosphere, events, and visual culture.",
    avatar: "/images/2.jpg",
    previews: ["/images/2.jpg", "/images/4.jpg", "/images/6.jpg", "/images/7.jpg", "/images/5.jpg", "/images/3.jpg"],
  },
  {
    name: "Loline Mag | Ethiopian Digital Magazine",
    handle: "@loline_mag",
    followers: "15,216 followers",
    href: "https://www.instagram.com/loline_mag/",
    summary:
      "An Ethiopian digital magazine focused on stories, entrepreneurship, and community-led editorial publishing.",
    avatar: "/images/1.JPG",
    previews: ["/images/1.JPG", "/images/3.jpg", "/images/5.jpg", "/images/6.jpg", "/images/7.jpg", "/images/4.jpg"],
  },
];

export default function WorkShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | undefined;

    const runReveal = async () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reducedMotion.matches || !sectionRef.current) {
        return;
      }

      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!active) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        const revealTargets =
          sectionRef.current?.querySelectorAll("[data-work-reveal]");
        if (!revealTargets?.length) {
          return;
        }

        gsap.fromTo(
          revealTargets,
          { y: 48, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 78%",
            },
          }
        );
      }, sectionRef);

      cleanup = () => context.revert();
    };

    runReveal();

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section ref={sectionRef} id="work" className="section-shell">
      <div className="content-shell">
        <div
          data-work-reveal
          className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] md:items-end"
        >
          <div className="space-y-5">
            <div className="section-label-row">
              <span className="accent-square accent-square--tiny" aria-hidden />
              <span className="section-label">Selected Work</span>
            </div>

            <h2 className="display-title max-w-[10ch]">
              Selected Work
              <span className="accent-square" aria-hidden />
            </h2>
          </div>

          <p className="body-copy max-w-[36ch] md:justify-self-end">
            My work is about crafting compelling social media identities through
            strategic design and visual storytelling.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {workAccounts.map((account) => (
            <a
              key={account.handle}
              data-work-reveal
              href={account.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col gap-8 rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(10,10,10,1))] p-8 transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full">
                    <Image
                      src={account.avatar}
                      alt={account.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[22px] font-bold tracking-[-0.03em] text-white">
                      {account.name}
                    </p>
                    <p className="text-sm font-medium text-white/50">
                      {account.handle}
                    </p>
                  </div>
                </div>

                <ArrowUpRight className="h-5 w-5 text-white/40 transition-colors group-hover:text-[#E8503A]" />
              </div>

              <div className="flex items-center justify-between gap-4 border-y border-white/8 py-4 text-sm">
                <span className="font-medium uppercase tracking-[0.15em] text-white/35">
                  Instagram
                </span>
                <span className="font-medium text-white/75">
                  {account.followers}
                </span>
              </div>

              <p className="body-copy">{account.summary}</p>

              <div className="grid grid-cols-3 gap-3">
                {account.previews.map((preview, previewIndex) => (
                  <div key={`${account.handle}-${previewIndex}`} className="work-preview">
                    <Image
                      src={preview}
                      alt={`${account.name} preview ${previewIndex + 1}`}
                      fill
                      sizes="(max-width: 1023px) 30vw, 150px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
