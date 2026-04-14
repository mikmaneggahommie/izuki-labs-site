"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ContactFooter() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      try {
        const gsap = (await import("gsap")).default;
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const el = sectionRef.current;
        if (!el) return;

        gsap.fromTo(
          el.querySelector(".contact-text"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      } catch (e) {
        console.warn("GSAP not available:", e);
      }
    };

    loadGSAP();
  }, []);

  return (
    <footer
      ref={sectionRef}
      id="contact"
      className="section-dark py-24 md:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* CTA Area */}
        <div className="contact-text text-center mb-0">
          <h2 className="font-display text-section text-white mb-8">
            Let&apos;s build your<br />
            digital identity
          </h2>
          <p className="text-body-large text-white/60 max-w-2xl mx-auto mb-16">
            With 4+ years of graphic design experience, I craft scalable content systems for ambitious brands. If you have a project to discuss, let&apos;s talk.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a
              href="mailto:it.mikiyas.daniel@gmail.com"
              className="px-10 py-5 bg-[#FF3F11] text-white font-display font-bold uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-transform shadow-2xl"
            >
              Start a Project
            </a>
            <a
              href="https://t.me/snowplugwalk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-white/5 text-white border border-white/10 backdrop-blur-md font-display font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-colors"
            >
              Message via Telegram
            </a>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 border-t border-white/10">
          {/* Sitemap */}
          <div>
            <h4 className="text-label text-white/40 mb-6">Sitemap</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#work"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Work
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-label text-white/40 mb-6">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+251954676421"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  +251 954 676 421
                </a>
              </li>
              <li>
                <a
                  href="mailto:it.mikiyas.daniel@gmail.com"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  it.mikiyas.daniel@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/snowplugwalk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Telegram — @snowplugwalk
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-label text-white/40 mb-6">Social</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.instagram.com/izuki.labs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Instagram — @izuki.labs
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@izuki.labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  TikTok — @izuki.labs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/20">
            © 2026 izuki.labs — All rights reserved
          </p>
          <p className="text-xs text-white/20">
            Built with love in Addis Ababa
          </p>
        </div>
      </div>
    </footer>
  );
}
