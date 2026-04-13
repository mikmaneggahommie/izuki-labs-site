"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(0,0,0,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
        }}
      >
        <div className="grid grid-cols-4 items-center px-6 md:px-10 py-4 md:py-5">
          {/* Brand */}
          <Link href="/" className="font-display text-sm md:text-base font-bold tracking-tight text-white hover:opacity-70 transition-opacity">
            izuki.labs
          </Link>

          {/* Location */}
          <span className="text-label text-white/50 hidden md:block text-center">
            Addis Ababa
          </span>

          {/* Role */}
          <span className="text-label text-white/50 hidden md:block text-center">
            Social Media Designer
          </span>

          {/* Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-sm font-medium text-white hover:opacity-70 transition-opacity text-right bg-transparent border-none cursor-pointer"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {/* Full-screen Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(30px)" }}
          >
            <nav className="flex flex-col items-center gap-8">
              {[
                { label: "Home", href: "/" },
                { label: "Pricing", href: "#pricing" },
                { label: "Work", href: "#work" },
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white hover:text-[#FF3F11] transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 flex gap-8"
              >
                <a href="https://t.me/snowplugwalk" target="_blank" rel="noopener noreferrer" className="text-meta text-white/40 hover:text-white transition-colors">
                  Telegram
                </a>
                <a href="mailto:it.mikiyas.daniel@gmail.com" className="text-meta text-white/40 hover:text-white transition-colors">
                  Email
                </a>
                <a href="tel:+251954676421" className="text-meta text-white/40 hover:text-white transition-colors">
                  Phone
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
