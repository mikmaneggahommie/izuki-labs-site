"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS_TOP = ["I", "Z", "U", "K", "I"];
const LETTERS_BOT = ["L", "A", "B", "S"];
const TOTAL_DURATION = 2800; // ms before curtain opens

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"letters" | "hold" | "exit">("letters");
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Lock scroll during loading
    document.body.style.overflow = "hidden";

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / TOTAL_DURATION) * 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(progressInterval);
    }, 16);

    const holdTimer = setTimeout(() => setPhase("hold"), 1600);
    const exitTimer = setTimeout(() => {
      setPhase("exit");
      document.body.style.overflow = "";
    }, TOTAL_DURATION);
    const doneTimer = setTimeout(() => setDone(true), TOTAL_DURATION + 800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <>
          {/* Left curtain */}
          <motion.div
            key="curtain-left"
            className="fixed inset-y-0 left-0 z-[9999] bg-black"
            style={{ width: "50%" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          {/* Right curtain */}
          <motion.div
            key="curtain-right"
            className="fixed inset-y-0 right-0 z-[9999] bg-black"
            style={{ width: "50%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          {/* Content layer */}
          <motion.div
            key="loading-content"
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* IZUKI */}
            <div className="flex items-center gap-0 overflow-hidden">
              {LETTERS_TOP.map((letter, i) => (
                <motion.span
                  key={`top-${i}`}
                  className="inline-block text-[clamp(48px,12vw,120px)] font-black uppercase leading-none tracking-[-0.04em] text-white"
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* LABS + red dot */}
            <div className="flex items-end gap-0 overflow-hidden -mt-2">
              {LETTERS_BOT.map((letter, i) => (
                <motion.span
                  key={`bot-${i}`}
                  className="inline-block text-[clamp(48px,12vw,120px)] font-black uppercase leading-none tracking-[-0.04em] text-white"
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.4 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {letter}
                </motion.span>
              ))}
              {/* Red square dot */}
              <motion.span
                className="inline-block w-[clamp(10px,2.5vw,24px)] h-[clamp(10px,2.5vw,24px)] bg-[#E50000] mb-[0.15em] ml-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </div>

            {/* Tagline */}
            <motion.p
              className="mt-6 text-[11px] font-medium uppercase tracking-[0.25em] text-white/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Design Systems · Addis Ababa
            </motion.p>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
              <motion.div
                className="h-full bg-[#E50000]"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
          </motion.div>
        </>
      ) : (
        <>
          {/* Split curtains on exit */}
          <motion.div
            key="curtain-left-exit"
            className="fixed inset-y-0 left-0 z-[9999] bg-black"
            style={{ width: "50%" }}
            initial={{ x: "0%" }}
            animate={{ x: "-100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            key="curtain-right-exit"
            className="fixed inset-y-0 right-0 z-[9999] bg-black"
            style={{ width: "50%" }}
            initial={{ x: "0%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
