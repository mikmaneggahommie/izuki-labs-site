"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const policies = [
  {
    title: "Revision Policy",
    content:
      "Minor text edits, color shifts, and layout refinements count as revisions. New concepts, major direction changes, or a completely different visual route are treated as new requests.",
  },
  {
    title: "Workflow Policy",
    content:
      "Requests are handled sequentially for quality control. Turnaround times apply per request, not per batch, and large post-approval changes are added back into the request queue.",
  },
  {
    title: "Fair Use Policy",
    content:
      "Unlimited support is structured around sustainable, high-quality output. It covers ongoing volume over time, not unlimited simultaneous work or instant bulk delivery.",
  },
  {
    title: "Turnaround Times",
    content:
      "Remote Designer requests are typically delivered in 24 to 48 hours, Growth Plan requests in 48 hours, and Essentials requests in 72 hours. Rush delivery is available as an add-on.",
  },
];

export default function PoliciesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-shell">
      <div className="content-shell">
        <div className="mb-12 space-y-5">
          <div className="section-label-row">
            <span className="accent-square accent-square--tiny" aria-hidden />
            <span className="section-label">Terms &amp; Policies</span>
          </div>

          <h2 className="display-title max-w-[10ch]">
            HOW IT WORKS
            <span className="accent-square" aria-hidden />
          </h2>
        </div>

        <div className="w-full border-t border-white/15">
          {policies.map((policy, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={policy.title} className="border-b border-white/15">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                >
                  <span className="text-xl font-semibold tracking-[-0.03em] text-white transition-all duration-300 group-hover:translate-x-2 group-hover:text-[#E8503A]">
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
