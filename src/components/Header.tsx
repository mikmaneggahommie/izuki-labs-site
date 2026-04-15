"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const menuItems = [
  { label: "Home", href: "#top" },
  { label: "Works", href: "#work" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = menuOpen ? "hidden" : originalOverflow;

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [menuOpen]);

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setMenuOpen(false);

    if (!href.startsWith("#")) {
      return;
    }

    event.preventDefault();
    const target = document.getElementById(href.slice(1));
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="content-shell px-[var(--section-padding-x)]">
          <div className="grid items-center gap-4 py-5 md:grid-cols-[1fr_auto_1fr]">
            <a
              href="#top"
              onClick={(event) => handleAnchorClick(event, "#top")}
              className="nav-copy interactive-link flex w-fit items-center tracking-[0.14em] text-white"
            >
              IZUKI<span className="inline-block w-[6px] h-[6px] bg-[var(--accent)] mx-[2px] translate-y-[1px]" />LABS
            </a>

            <div className="justify-self-start md:justify-self-center">
              <span className="nav-copy text-white">ADDIS ABABA</span>
            </div>

            <div className="justify-self-end">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="nav-copy interactive-link inline-flex items-center gap-3 text-white"
                aria-expanded={menuOpen}
                aria-label="Toggle menu"
              >
                <span className="accent-square accent-square--tiny" aria-hidden />
                <span>{menuOpen ? "CLOSE" : "MENU"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 overflow-y-auto bg-black/95 backdrop-blur-2xl"
          >
            <div className="content-shell flex min-h-full flex-col justify-between px-[var(--section-padding-x)] pb-10 pt-28">
              <nav className="grid gap-2">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    onClick={(event) => handleAnchorClick(event, item.href)}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="block text-[clamp(32px,8vw,80px)] font-black leading-[1.15] tracking-[-0.03em] text-white transition-colors duration-200 hover:text-[var(--accent)]"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              <div className="mt-12 grid gap-8 border-t border-white/10 pt-8 text-left md:grid-cols-3">
                <div className="space-y-3">
                  <p className="section-label">Location</p>
                  <p className="body-copy text-white">Addis Ababa, Ethiopia</p>
                </div>

                <div className="space-y-3">
                  <p className="section-label">Connect</p>
                  <a
                    href="mailto:it.mikiyas.daniel@gmail.com"
                    className="body-copy interactive-link block text-white"
                  >
                    it.mikiyas.daniel@gmail.com
                  </a>
                  <a
                    href="tel:+251954676421"
                    className="body-copy interactive-link block text-white"
                  >
                    +251 954 676 421
                  </a>
                </div>

                <div className="space-y-3">
                  <p className="section-label">Channels</p>
                  <a
                    href="https://t.me/IZUKILABS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body-copy interactive-link block text-white"
                  >
                    t.me/IZUKILABS
                  </a>
                  <a
                    href="https://t.me/netlaserz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body-copy interactive-link block text-white"
                  >
                    t.me/netlaserz
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
