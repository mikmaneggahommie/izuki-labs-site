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
    id: "remote",
    packageLabel: "Package 1",
    name: "Remote Designer",
    price: "20,000",
    period: "Birr / month",
    featured: true,
    cta: "Book Remote",
    features: [
      "Unlimited single-image posts",
      "Priority 24–48h turnaround",
      "Up to 2 active tasks at a time",
      "Unlimited revisions",
      "All platforms (IG, FB, TT, LI, TG)",
      "Stories & Reels covers included",
      "10 Carousels/mo included",
      "Source files & Content calendar",
    ],
    addOns: [
      { name: "Logo Design", price: "2,500 Birr" },
      { name: "Brand Identity Kit", price: "4,500 Birr" },
      { name: "YouTube Thumbnail", price: "300 Birr" },
      { name: "Extra Fast Delivery (<12h)", price: "500 Birr" },
    ],
  },
  {
    id: "growth",
    packageLabel: "Package 2",
    name: "Growth Plan",
    price: "12,000",
    period: "Birr / month",
    cta: "Book Growth",
    features: [
      "Up to 12 posts per month",
      "48-hour turnaround",
      "3 revision rounds per design",
      "Instagram & Telegram support",
      "Standard static posts",
      "No carousels or stories",
    ],
    addOns: [
      { name: "Logo Design", price: "3,500 Birr" },
      { name: "Brand Identity Kit", price: "6,000 Birr" },
      { name: "YouTube Thumbnail", price: "400 Birr" },
      { name: "Extra Post", price: "1,350 Birr" },
      { name: "Carousel (max 6 slides)", price: "850 Birr" },
      { name: "Extra Fast Delivery (<12h)", price: "700 Birr" },
    ],
  },
  {
    id: "essentials",
    packageLabel: "Package 3",
    name: "Essentials Plan",
    price: "7,500",
    period: "Birr / month",
    cta: "Book Essentials",
    features: [
      "Up to 6 posts per month",
      "72-hour turnaround",
      "2 revision rounds per design",
      "Instagram & Telegram support",
      "Static posts only",
      "Basic creative support",
    ],
    addOns: [
      { name: "Logo Design", price: "4,000 Birr" },
      { name: "Brand Identity Kit", price: "7,000 Birr" },
      { name: "YouTube Thumbnail", price: "500 Birr" },
      { name: "Extra Post", price: "1,500 Birr" },
      { name: "Carousel (max 4 slides)", price: "2,000 Birr" },
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
          { y: 48, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.95,
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

    void runReveal();

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="section-shell">
      <div className="content-shell space-y-14">
        <div
          data-price-reveal
          className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.48fr)] lg:items-end"
        >
          <div className="space-y-5">
            <div className="section-label-row">
              <span className="accent-square accent-square--tiny" aria-hidden />
              <span className="section-label">Retainer Packages</span>
            </div>

            <h2 className="display-title max-w-[9ch]">
              Pricing
              <span className="accent-square" aria-hidden />
            </h2>
          </div>

          <p className="body-copy max-w-[34ch] lg:justify-self-end">
            Choose the level of support that matches your brand pace, content
            volume, and approval flow. Every package is built to keep the work
            consistent month after month.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {packages.map((pkg) => {
            const isOpen = openAddOns[pkg.id];

            return (
              <article
                key={pkg.id}
                data-price-reveal
                className={`group flex h-full flex-col justify-between rounded-[18px] border p-8 transition-transform duration-500 hover:-translate-y-2 xl:min-h-[640px] ${
                  pkg.featured
                    ? "border-[#E8503A] bg-[linear-gradient(180deg,rgba(255,68,37,0.08),rgba(10,10,10,1)_18%)] shadow-[0_0_0_1px_rgba(255,68,37,0.16),0_30px_80px_rgba(255,68,37,0.08)]"
                    : "border-white/10 bg-[#0A0A0A]"
                }`}
              >
                <div className="space-y-10">
                  <div className="space-y-5">
                    {pkg.featured ? (
                      <span className="inline-flex rounded-full border border-[#E8503A]/30 bg-[#E8503A]/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff7f69]">
                        Most Requested
                      </span>
                    ) : null}

                    <div className="space-y-3">
                      <p className="section-label text-white/45">{pkg.packageLabel}</p>
                      <h3 className="text-[30px] font-bold tracking-[-0.04em] text-white">
                        {pkg.name}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                      <span className="text-[60px] font-black leading-none tracking-[-0.06em] text-white">
                        {pkg.price}
                      </span>
                      <span className="pb-2 text-base text-white/42">
                        {pkg.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3.5">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-[15px] leading-[1.8] text-white/68"
                      >
                        <span className="pt-1 text-sm font-bold text-[#E8503A]">
                          +
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
