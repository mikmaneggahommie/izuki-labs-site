"use client";

import { motion } from "framer-motion";

interface DoubleWordTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function DoubleWordText({ text, className = "", delay = 0 }: DoubleWordTextProps) {
  const words = text.split(" ");

  return (
    <div className={`flex flex-wrap gap-x-[0.35em] gap-y-0 ${className}`}>
      {words.map((word, i) => {
        return (
          <motion.span
            key={`${word}-${i}`}
            initial={{ opacity: 0, y: 5 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: delay + (i * 0.015),
              ease: [0.16, 1, 0.3, 1] 
            }}
            viewport={{ once: true }}
            className="relative inline-flex flex-col leading-[0.95]"
          >
            <span className="relative z-10">{word}{word}</span>
          </motion.span>
        );
      })}
    </div>
  );
}
