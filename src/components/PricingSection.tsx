"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

interface AddOn {
  name: string;
  price: string;
}

interface Package {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  features: string[];
  addOns: AddOn[];
  featured: boolean;
  cta: string;
}

const packages: Package[] = [
  {
    id: "basic",
    name: "Essentials",
    subtitle: "Package 3",
    price: "7,500",
    period: "Birr / month",
    featured: false,
    cta: "Get Started",
    features: [
      "Up to 6 social media posts per month",
      "2 revision rounds per design",
      "72-hour turnaround per post",
      "Instagram & Telegram only",
      "Static posts only",
    ],
    addOns: [
      { name: "Extra post (per piece)", price: "1,500 Birr" },
      { name: "Stories / Reels cover", price: "500 Birr" },
      { name: "Carousel (max 4 slides, max 2/mo)", price: "2,000 Birr" },
      { name: "Extra revision", price: "100 Birr" },
      { name: "Major redesign", price: "350 Birr" },
      { name: "Rush delivery (under 24 hrs)", price: "350 Birr" },
      { name: "Source files", price: "150 Birr/file" },
      { name: "Logo Design", price: "4,000 Birr" },
      { name: "YouTube Thumbnail", price: "500 Birr" },
      { name: "Brand Identity Kit", price: "7,000 Birr" },
      { name: "Extra Fast Delivery (under 12 hrs)", price: "900 Birr" },
    ],
  },
  {
    id: "remote",
    name: "Remote Designer",
    subtitle: "Package 1 — Best Value",
    price: "20,000",
    period: "Birr / month",
    featured: true,
    cta: "Contact Me",
    features: [
      "Unlimited social media posts (fair use)",
      "Unlimited revisions",
      "24–48 hour priority turnaround",
      "All platforms: IG, FB, TikTok, LinkedIn, Telegram",
      "Stories & Reels covers included",
      "Up to 10 carousels/month (6 slides each)",
      "Monthly content calendar collaboration",
      "Source files included (PSD, AI, etc.)",
    ],
    addOns: [
      { name: "Logo Design", price: "2,500 Birr" },
      { name: "YouTube Thumbnail", price: "300 Birr" },
      { name: "Brand Identity Kit", price: "4,500 Birr" },
      { name: "Extra Fast Delivery (under 12 hrs)", price: "500 Birr" },
    ],
  },
  {
    id: "starter",
    name: "Growth Plan",
    subtitle: "Package 2",
    price: "12,000",
    period: "Birr / month",
    featured: false,
    cta: "Get Started",
    features: [
      "Up to 12 social media posts per month",
      "3 revision rounds per design",
      "48-hour turnaround per post",
      "Instagram & Telegram only",
      "No stories or carousels included",
    ],
    addOns: [
      { name: "Extra post (per piece)", price: "1,350 Birr" },
      { name: "Stories / Reels cover", price: "350 Birr" },
      { name: "Carousel (max 6 slides)", price: "850 Birr" },
      { name: "Extra revision", price: "50 Birr" },
      { name: "Major redesign", price: "250 Birr" },
      { name: "Rush delivery (under 24 hrs)", price: "250 Birr" },
      { name: "Source files", price: "50 Birr/file" },
      { name: "Logo Design", price: "3,500 Birr" },
      { name: "YouTube Thumbnail", price: "400 Birr" },
      { name: "Brand Identity Kit", price: "6,000 Birr" },
      { name: "Extra Fast Delivery (under 12 hrs)", price: "700 Birr" },
    ],
  },
];

export default function PricingSection() {
  const [openAddOns, setOpenAddOns] = useState<Record<string, boolean>>({});
  const sectionRef = useRef<HTMLDivElement>(null);

  const toggleAddOns = (id: string) => {
    setOpenAddOns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const loadGSAP = async () => {
      try {
        const gsap = (await import("gsap")).default;
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        const cards = sectionRef.current?.querySelectorAll(".pricing-card");
        if (!cards) return;

        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
              delay: i * 0.15,
            }
          );
        });
      } catch (e) {
        console.warn("GSAP not available:", e);
      }
    };

    loadGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="section-light py-24 md:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="mb-20">
          <p className="text-label text-[#1A1A1A]/40 mb-4">
            Fixed Monthly Retainer
          </p>
          <h2 className="font-display text-section text-[#1A1A1A]">
            Pricing<span className="accent-square" />
          </h2>
          <p className="text-sm text-[#1A1A1A]/50 mt-4 max-w-lg leading-relaxed">
            Choose a package that fits your brand. All packages include
            dedicated design support with predictable monthly costs.
          </p>
        </div>

        {/* Pricing Cards — order: Basic, Remote Designer (center), Starter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`pricing-card ${pkg.featured ? "featured" : ""}`}
            >
              {/* Badge */}
              {pkg.featured && (
                <div className="mb-6">
                  <span
                    className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full"
                    style={{
                      background: "#FF3F11",
                      color: "#fff",
                    }}
                  >
                    Best Value
                  </span>
                </div>
              )}

              {/* Name & Price */}
              <p
                className={`text-label mb-2 ${pkg.featured ? "text-white/40" : "text-[#1A1A1A]/40"}`}
              >
                {pkg.subtitle}
              </p>
              <h3
                className={`font-display text-2xl font-bold tracking-tight mb-4 ${pkg.featured ? "text-white" : "text-[#1A1A1A]"}`}
              >
                {pkg.name}
              </h3>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-display text-5xl font-extrabold tracking-tight">
                  {pkg.price}
                </span>
                <span
                  className={`text-sm ${pkg.featured ? "text-white/40" : "text-[#1A1A1A]/40"}`}
                >
                  {pkg.period}
                </span>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.featured ? "text-[#FF3F11]" : "text-[#1A1A1A]/30"}`}
                    />
                    <span
                      className={`text-sm ${pkg.featured ? "text-white/70" : "text-[#1A1A1A]/60"}`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="#contact"
                className={`block w-full text-center py-4 rounded-lg font-display font-bold text-sm uppercase tracking-widest transition-all duration-300 mb-6 ${
                  pkg.featured
                    ? "bg-[#FF3F11] text-white hover:bg-[#e63600]"
                    : "bg-[#1A1A1A] text-white hover:bg-[#333]"
                }`}
              >
                {pkg.cta}
              </a>

              {/* Collapsible Add-Ons */}
              <div
                className={`border-t ${pkg.featured ? "border-white/10" : "border-[#1A1A1A]/10"}`}
              >
                <button
                  onClick={() => toggleAddOns(pkg.id)}
                  className={`accordion-trigger ${
                    pkg.featured
                      ? "text-white/60 border-white/10"
                      : "text-[#1A1A1A]/60 border-[#1A1A1A]/10"
                  }`}
                  style={{ borderBottom: "none", paddingBottom: 0 }}
                >
                  <span className="text-sm font-medium">
                    Premium Add-Ons{" "}
                    {pkg.featured && (
                      <span className="text-xs opacity-50">(Discounted)</span>
                    )}
                  </span>
                  <motion.div
                    animate={{ rotate: openAddOns[pkg.id] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openAddOns[pkg.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-2">
                        {pkg.addOns.map((addOn) => (
                          <div
                            key={addOn.name}
                            className={`flex justify-between items-center py-2 text-xs ${
                              pkg.featured
                                ? "text-white/50"
                                : "text-[#1A1A1A]/50"
                            }`}
                          >
                            <span>{addOn.name}</span>
                            <span className="font-medium opacity-80">
                              {addOn.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
