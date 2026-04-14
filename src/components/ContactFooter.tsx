"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function ContactFooter() {
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
          sectionRef.current?.querySelectorAll("[data-contact-reveal]");
        if (!revealTargets?.length) {
          return;
        }

        gsap.fromTo(
          revealTargets,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
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
    <footer ref={sectionRef} id="contact" className="section-shell pb-0">
      <div className="content-shell space-y-16">
        <div data-contact-reveal className="mx-auto max-w-5xl space-y-8 text-center">
          <h2 className="display-title max-w-[12ch] mx-auto">
            LET&apos;S BUILD YOUR DIGITAL IDENTITY
            <span className="accent-square" aria-hidden />
          </h2>

          <p className="body-copy mx-auto max-w-[38ch]">
            With 4+ years of graphic design experience, I craft scalable
            content systems for ambitious brands. If you have a project to
            discuss, let&apos;s talk.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            <a href="mailto:it.mikiyas.daniel@gmail.com" className="primary-button">
              Start A Project
            </a>
            <a
              href="https://t.me/snowplugwalk"
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-button"
            >
              Message Via Telegram
            </a>
          </div>
        </div>

        <div
          data-contact-reveal
          className="grid gap-10 border-t border-white/10 py-16 md:grid-cols-3"
        >
          <div className="space-y-5">
            <p className="section-label">Sitemap</p>
            <div className="space-y-2.5 text-[15px] leading-[2.2] text-white">
              <Link href="/" className="interactive-link block">
                Home
              </Link>
              <a href="#work" className="interactive-link block">
                Work
              </a>
              <a href="#pricing" className="interactive-link block">
                Pricing
              </a>
              <a href="#about" className="interactive-link block">
                About
              </a>
            </div>
          </div>

          <div className="space-y-5">
            <p className="section-label">Connect</p>
            <div className="space-y-2.5 text-[15px] leading-[2.2] text-white">
              <a href="tel:+251954676421" className="interactive-link block">
                +251 954 676 421
              </a>
              <a
                href="mailto:it.mikiyas.daniel@gmail.com"
                className="interactive-link block"
              >
                it.mikiyas.daniel@gmail.com
              </a>
              <a
                href="https://t.me/snowplugwalk"
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-link block"
              >
                Telegram — @snowplugwalk
              </a>
            </div>
          </div>

          <div className="space-y-5">
            <p className="section-label">Social</p>
            <div className="space-y-2.5 text-[15px] leading-[2.2] text-white">
              <a
                href="https://www.instagram.com/izuki.labs/"
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-link block"
              >
                Instagram — @izuki.labs
              </a>
              <a
                href="https://www.tiktok.com/@izuki.labs"
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-link block"
              >
                TikTok — @izuki.labs
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 px-[var(--section-padding-x)] py-6">
        <div className="content-shell flex flex-col gap-2 text-[12px] text-white/35 md:flex-row md:items-center md:justify-between">
          <p>© 2026 izuki.labs — All rights reserved</p>
          <p>Built with love in Addis Ababa</p>
        </div>
      </div>
    </footer>
  );
}
