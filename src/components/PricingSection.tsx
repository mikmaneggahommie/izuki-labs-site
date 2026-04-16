"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/FancyText";
import { MagicText } from "@/components/ui/magic-text";

type AddOn = {
  name: string;
  price: string;
};

type Package = {
  id: string;
  name: string;
  price: string;
  period: string;
  featured?: boolean;
  cta: string;
  features: string[];
  addOns: AddOn[];
};

const packages: Package[] = [
  {
    id: "remote",
    name: "Remote Designer",
    price: "20,000",
    period: "Birr / month",
    featured: true,
    cta: "Book Remote",
    features: [
      "Unlimited social media posts",
      "Unlimited revisions",
      "24–48h priority turnaround",
      "All platforms (IG, FB, TT, LI, TG)",
      "Stories & Reels covers included",
      "Max 10 Full Carousels/mo (6 slides each)",
      "Content calendar collaboration",
      "Source files included",
    ],
    addOns: [
      { name: "Logo Design", price: "2,500 Birr" },
      { name: "YouTube Thumbnail", price: "300 Birr" },
      { name: "Brand Identity Kit", price: "4,500 Birr" },
      { name: "Extra Fast Delivery (<12h)", price: "500 Birr" },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "12,000",
    period: "Birr / month",
    cta: "Book Starter",
    features: [
      "Up to 12 posts per month",
      "3 revision rounds per design",
      "48-hour turnaround per post",
      "Instagram & Telegram support",
      "No stories or carousel designs",
      "No content calendar",
      "No source files",
    ],
    addOns: [
      { name: "Extra post", price: "1,350 Birr" },
      { name: "Stories / Reels cover", price: "350 Birr" },
      { name: "Carousel design (max 6 slides)", price: "850 Birr" },
      { name: "Extra revision", price: "50 Birr" },
      { name: "Major redesign", price: "250 Birr" },
      { name: "Rush delivery (<24h)", price: "250 Birr" },
      { name: "Source files", price: "50 Birr/file" },
      { name: "Logo Design", price: "3,500 Birr" },
      { name: "YouTube Thumbnail", price: "400 Birr" },
      { name: "Brand Identity Kit", price: "6,000 Birr" },
      { name: "Extra Fast Delivery (<12h)", price: "700 Birr" },
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: "7,500",
    period: "Birr / month",
    cta: "Book Basic",
    features: [
      "Up to 6 posts per month",
      "2 revision rounds per design",
      "72-hour turnaround per post",
      "Instagram & Telegram support",
      "Static posts only",
      "No content calendar",
      "No source files",
    ],
    addOns: [
      { name: "Extra post", price: "1,500 Birr" },
      { name: "Stories / Reels cover", price: "500 Birr" },
      { name: "Carousel design (max 4 slides, up to 2/mo)", price: "2,000 Birr" },
      { name: "Extra revision", price: "100 Birr" },
      { name: "Major redesign", price: "500 Birr" },
      { name: "Rush delivery (<24h)", price: "350 Birr" },
      { name: "Source files", price: "150 Birr/file" },
      { name: "Logo Design", price: "4,000 Birr" },
      { name: "YouTube Thumbnail", price: "500 Birr" },
      { name: "Brand Identity Kit", price: "7,000 Birr" },
      { name: "Extra Fast Delivery (<12h)", price: "900 Birr" },
    ],
  },
];

export default function PricingSection() {
  const [openAddOns, setOpenAddOns] = useState<Record<string, boolean>>({});
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
          sectionRef.current?.querySelectorAll("[data-price-reveal]");
        if (!revealTargets?.length) {
          return;
        }

        gsap.fromTo(
          revealTargets,
          { y: 60, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.95,
            stagger: 0.15,
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

    void runReveal();

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="section-shell">
      <div className="content-shell space-y-16">
        <div
          data-price-reveal
          className="grid gap-10 border-b border-white/10 pb-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.48fr)] lg:items-end"
        >
          <div className="space-y-6">
            <div className="section-label-row">
              <span className="accent-square accent-square--tiny" aria-hidden />
              <span className="section-label">Pricing</span>
            </div>

            <MagicText
              text="Packages"
              className="display-title"
            />
          </div>

          <MagicText
            text="Choose the level of support that matches your brand pace, content volume, and approval flow. Every package is built to keep the work consistent month after month."
            className="body-copy max-w-[34ch] lg:justify-self-end"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {packages.map((pkg, pkgIndex) => {
            const isOpen = openAddOns[pkg.id];

            return (
              <ScrollReveal key={pkg.id} delay={pkgIndex * 0.12}>
                <article
                  data-price-reveal
                  className={`group flex h-full flex-col justify-between border p-8 transition-transform duration-500 hover:-translate-y-2 xl:min-h-[640px] ${
                    pkg.featured
                      ? "border-[var(--accent)] bg-[linear-gradient(180deg,rgba(229,0,0,0.06),rgba(10,10,10,1)_18%)]"
                      : "border-white/10 bg-[#0A0A0A]"
                  }`}
                >
                  <div className="space-y-10">
                    <div className="space-y-6">
                      {pkg.featured ? (
                        <span className="inline-flex border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                          Most Requested
                        </span>
                      ) : null}

                      <div className="space-y-2">
                        <h3 className="text-[30px] font-bold tracking-[-0.04em] text-white">
                          {pkg.name}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-end gap-3 pt-2">
                        <span className="text-[60px] font-black leading-none tracking-[-0.06em] text-white">
                          {pkg.price}
                        </span>
                        <span className="pb-2 text-base text-white/42">
                          {pkg.period}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-4">
                      {pkg.features.map((feature, fIdx) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + fIdx * 0.05, duration: 0.4 }}
                          viewport={{ once: true }}
                          className="flex items-start gap-3 text-[15px] leading-[1.8] text-white/68 transition-colors duration-300 group-hover:text-white/90"
                        >
                          <span className="pt-1 text-sm font-bold text-[var(--accent)]">
                            +
                          </span>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-12 space-y-6">
                    <a
                      href="#contact"
                      className={`${
                        pkg.featured ? "primary-button" : "secondary-button"
                      } flex w-full`}
                    >
                      {pkg.cta}
                    </a>

                    <div className="border-t border-white/10 pt-5">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenAddOns((current) => ({
                            ...current,
                            [pkg.id]: !current[pkg.id],
                          }))
                        }
                        className="flex w-full items-center justify-between gap-4 text-left"
                      >
                        <span className="text-sm font-medium tracking-[0.04em] text-white/74">
                          Optional add-ons
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-white/45 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 pt-5">
                              {pkg.addOns.map((addOn) => (
                                <div
                                  key={addOn.name}
                                  className="flex items-center justify-between gap-4 border-b border-white/6 pb-3 text-[14px] text-white/58 last:border-b-0"
                                >
                                  <span>{addOn.name}</span>
                                  <span className="text-white/78">{addOn.price}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
