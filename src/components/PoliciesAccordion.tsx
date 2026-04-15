"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ScrollReveal } from "@/components/FancyText";

const policies = [
  {
    title: "Revision Policy",
    content:
      "What counts as a revision: Minor text changes, color adjustments, and layout tweaks. IMPORTANT: New concepts, major direction changes, or a completely different visual route are treated as 'New Requests' or 'Major Redesigns'.",
  },
  {
    title: "Workflow Policy",
    content:
      "I work sequentially using a queue-based system to ensure quality. New requests enter the queue and are handled one-by-one. Max 2 active tasks at a time. Turnaround time applies per task, not per batch.",
  },
  {
    title: "Fair Use Policy",
    content:
      "'Unlimited' support is defined as total volume over time. It does NOT mean unlimited simultaneous work or instant bulk delivery. This ensures a sustainable workload and consistent high quality across all clients.",
  },
  {
    title: "Turnaround Times",
    content:
      "Standard turnaround: Remote Designer (24–48h per task), Growth Plan (48h per task), Essentials Plan (72h per task). Rush options (under 12 or 24 hours) are available as add-ons.",
  },
];

export default function PoliciesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-shell">
      <div className="content-shell">
        <ScrollReveal>
          <div className="mb-14 space-y-6">
            <div className="section-label-row">
              <span className="accent-square accent-square--tiny" aria-hidden />
              <span className="section-label">Terms &amp; Policies</span>
            </div>

            <h2 className="display-title">How It Works</h2>
          </div>
        </ScrollReveal>

        <div className="w-full border-t border-white/15">
          {policies.map((policy, index) => {
            const isOpen = openIndex === index;

            return (
              <ScrollReveal key={policy.title} delay={index * 0.06}>
                <div className="border-b border-white/15">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                  >
                    <span className="text-xl font-semibold tracking-[-0.03em] text-white transition-all duration-300 group-hover:translate-x-2 group-hover:text-[var(--accent)]">
                      {policy.title}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-none text-white/45 transition-transform duration-300 ${
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
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="max-w-4xl pb-7 pr-10 text-[15px] leading-[1.7] text-white/58">
                          {policy.content}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
