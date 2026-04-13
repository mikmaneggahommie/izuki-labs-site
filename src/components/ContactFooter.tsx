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
        <div className="contact-text text-center mb-20">
          <p className="text-body-large text-white/60 max-w-2xl mx-auto mb-12">
            If you have a project to discuss or want to learn more, let&apos;s
            talk
          </p>

          {/* Rotating Circle CTA with Face */}
          <div className="flex justify-center">
            <a
              href="mailto:it.mikiyas.daniel@gmail.com"
              className="relative group"
            >
              {/* Rotating text */}
              <svg
                viewBox="0 0 200 200"
                className="spin-slow w-48 h-48 md:w-56 md:h-56"
              >
                <defs>
                  <path
                    id="contactCirclePath"
                    d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
                  />
                </defs>
                <text
                  className="fill-white text-[11px] font-bold uppercase"
                  style={{ letterSpacing: "0.25em" }}
                >
                  <textPath xlinkHref="#contactCirclePath">
                    SEND A MESSAGE • GET IN TOUCH • SEND A MESSAGE • GET IN TOUCH •
                  </textPath>
                </text>
              </svg>

              {/* Center face */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-[#FF3F11] transition-colors duration-500 group-hover:scale-110 transform transition-transform">
                  <Image
                    src="/images/1.JPG"
                    alt="Mikiyas Daniel"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
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
                  href="https://www.instagram.com/atmosphere_251/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Instagram — @atmosphere_251
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/loline_mag/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Instagram — @loline_mag
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
