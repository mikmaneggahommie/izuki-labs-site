"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface PolicyItem {
  title: string;
  content: string[];
}

const policies: PolicyItem[] = [
  {
    title: "Revision Policy",
    content: [
      "What counts as a revision: Text changes, color adjustments, minor layout tweaks.",
      "What is NOT a revision: New concept, new design direction, major visual change.",
      "These are considered new requests or major redesigns and may incur additional charges.",
      "Once a design is approved, further changes may be billed separately.",
    ],
  },
  {
    title: "Workflow Policy",
    content: [
      "Requests are handled one at a time (max 2 active tasks).",
      "Turnaround time applies per task, not per batch.",
      "New requests enter a queue system and are completed sequentially.",
      "Large changes after approval = new request.",
      "Repeated direction changes may be treated as scope change.",
    ],
  },
  {
    title: "Fair Use Policy",
    content: [
      '"Unlimited" applies to total volume over time.',
      '"Unlimited" does NOT mean unlimited simultaneous work or instant bulk delivery.',
      "The service ensures sustainable workload, consistent quality, and fair usage across all clients.",
      "All packages are designed to maintain premium quality output at every stage.",
    ],
  },
  {
    title: "Turnaround Times",
    content: [
      "Remote Designer (20K): 24–48 hours per request.",
      "Growth Plan (12K): 48 hours per post.",
      "Essentials (7.5K): 72 hours per post.",
      "Rush delivery options available as add-ons for each package.",
    ],
  },
];

export default function PoliciesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="section-light py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="text-label text-[#1A1A1A]/40 mb-4">Terms & Policies</p>
          <h2 className="font-display text-section text-[#1A1A1A]">
            How it works<span className="accent-square" />
          </h2>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl">
          {policies.map((policy, i) => (
            <div
              key={policy.title}
              className="border-b border-[#1A1A1A]/10"
            >
              <button
                onClick={() => toggle(i)}
                className="accordion-trigger"
                style={{
                  borderBottom: "none",
                  color: "#1A1A1A",
                }}
              >
                <span className="font-display text-lg md:text-xl font-bold tracking-tight">
                  {policy.title}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-[#1A1A1A]/40" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 space-y-3">
                      {policy.content.map((line, j) => (
                        <p
                          key={j}
                          className="text-sm text-[#1A1A1A]/50 leading-relaxed pl-4 border-l-2 border-[#1A1A1A]/10"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
