"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AddOn = {
  name: string;
  price: string;
};

type Package = {
  id: string;
  packageLabel: string;
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
    id: "essentials",
    packageLabel: "Package 3",
    name: "Essentials",
    price: "7,500",
    period: "Birr / month",
    cta: "Start Essentials",
    features: [
      "Up to 6 social media posts per month",
      "2 revision rounds per design",
      "72-hour turnaround per request",
      "Instagram and Telegram coverage",
      "Static post design system",
    ],
    addOns: [
      { name: "Extra post", price: "1,500 Birr" },
      { name: "Stories / Reels cover", price: "500 Birr" },
      { name: "Carousel design", price: "2,000 Birr" },
      { name: "Rush delivery", price: "350 Birr" },
    ],
  },
  {
    id: "remote",
    packageLabel: "Package 1",
    name: "Remote Designer",
    price: "20,000",
    period: "Birr / month",
    featured: true,
    cta: "Book Best Value",
    features: [
      "Unlimited posts under fair use",
      "Unlimited revisions",
      "24 to 48 hour priority turnaround",
      "Instagram, Facebook, TikTok, LinkedIn, Telegram",
      "Stories and Reels covers included",
      "Up to 10 carousels per month",
      "Monthly content calendar collaboration",
      "Source files included",
    ],
    addOns: [
      { name: "Logo design", price: "2,500 Birr" },
      { name: "Brand identity kit", price: "4,500 Birr" },
      { name: "YouTube thumbnail", price: "300 Birr" },
      { name: "Extra fast delivery", price: "500 Birr" },
    ],
  },
  {
    id: "growth",
    packageLabel: "Package 2",
    name: "Growth Plan",
    price: "12,000",
    period: "Birr / month",
    cta: "Start Growth",
    features: [
      "Up to 12 social media posts per month",
      "3 revision rounds per design",
      "48-hour turnaround per request",
      "Instagram and Telegram coverage",
      "Structured monthly content support",
    ],
    addOns: [
      { name: "Extra post", price: "1,350 Birr" },
      { name: "Stories / Reels cover", price: "350 Birr" },
      { name: "Carousel design", price: "850 Birr" },
      { name: "Rush delivery", price: "250 Birr" },
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
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
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
    <section ref={sectionRef} id="pricing" className="section-shell">
      <div className="content-shell">
        <div data-price-reveal className="mx-auto max-w-4xl text-center">
          <div className="section-label-row justify-center">
            <span className="accent-square accent-square--tiny" aria-hidden />
            <span className="section-label">Fixed Monthly Retainer</span>
          </div>

          <h2 className="display-title mt-5">
            PRICING
            <span className="accent-square" aria-hidden />
          </h2>

          <p className="body-copy mx-auto mt-6 max-w-[40ch]">
            Choose a package that fits your brand. All packages include
            dedicated design support with predictable monthly costs.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {packages.map((pkg) => {
            const isOpen = openAddOns[pkg.id];

            return (
              <article
                key={pkg.id}
                data-price-reveal
                className={`flex min-h-[620px] flex-col justify-between rounded-[16px] border p-9 md:p-12 ${
                  pkg.featured
                    ? "border-[#E8503A] bg-[#0A0A0A] shadow-[0_0_0_1px_rgba(232,80,58,0.18),0_30px_80px_rgba(232,80,58,0.06)]"
                    : "border-white/10 bg-[#0A0A0A]"
                }`}
              >
                <div className="space-y-8">
                  <div className="space-y-4">
                    {pkg.featured ? (
                      <span className="inline-flex rounded-[4px] bg-[#E8503A] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                        Best Value
                      </span>
                    ) : null}

                    <p className="section-label">{pkg.packageLabel}</p>
                    <h3 className="text-[28px] font-bold tracking-[-0.03em] text-white">
                      {pkg.name}
                    </h3>
                    <div className="flex flex-wrap items-end gap-3">
                      <span className="text-[64px] font-black leading-none tracking-[-0.05em] text-white">
                        {pkg.price}
                      </span>
                      <span className="pb-2 text-base text-white/45">
                        {pkg.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-[15px] leading-[2.2] text-white/58"
                      >
                        <span className="pt-1 text-sm font-bold text-[#E8503A]">
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 space-y-6">
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
                      <span className="text-sm font-medium tracking-[0.02em] text-white/72">
                        Premium Add-Ons
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
                                className="flex items-center justify-between gap-4 text-sm text-white/48"
                              >
                                <span>{addOn.name}</span>
                                <span className="text-white/68">{addOn.price}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
