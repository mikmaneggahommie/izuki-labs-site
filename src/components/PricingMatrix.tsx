"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Essential",
    price: "$149",
    description: "Perfect for brands starting their social journey.",
    features: ["15 High-End Graphics", "3 Video Reels / Montages", "Basic Branding", "Daily Engagement"],
    cta: "Start Basic",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$299",
    description: "Our flagship package for maximum growth.",
    features: ["30 High-End Graphics", "10 Video Reels / Montages", "Full Brand Identity", "Strategic Growth", "Priority Support"],
    cta: "Scale Now",
    highlight: true,
  },
  {
    name: "Custom / Enterprise",
    price: "Custom",
    description: "Tailored solutions for large-scale operations.",
    features: ["Unlimited Content", "Full Production Team", "Dedicated Manager", "Omni-channel Support"],
    cta: "Contact Us",
    highlight: false,
  },
];

export default function PricingMatrix() {
  return (
    <section className="py-24 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Pricing Matrix
          </h2>
          <p className="text-muted-foreground font-mono uppercase text-sm tracking-widest">
            Select your tier • Grow your brand
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative flex flex-col p-8 rounded-3xl liquid-glass border-white/5",
                tier.highlight && "md:-translate-y-4 border-accent/20 ring-1 ring-accent/20"
              )}
            >
              {tier.highlight && (
                <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Best Value
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold uppercase mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-muted-foreground font-mono">/mo</span>}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-0.5" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                data-cursor="CLICK"
                className={cn(
                  "w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                  tier.highlight 
                    ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                    : "bg-white/5 hover:bg-white/10 text-white"
                )}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
