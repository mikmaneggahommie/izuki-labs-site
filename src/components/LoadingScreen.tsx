"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_DURATION = 2400;

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"animate" | "exit">("animate");
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const exitTimer = setTimeout(() => {
      setPhase("exit");
      document.body.style.overflow = "";
    }, TOTAL_DURATION);
    const doneTimer = setTimeout(() => setDone(true), TOTAL_DURATION + 800);

    return () => {
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
          <motion.div
            key="curtain-left"
            className="fixed inset-y-0 left-0 z-9999 bg-black"
            style={{ width: "50%" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            key="curtain-right"
            className="fixed inset-y-0 right-0 z-9999 bg-black"
            style={{ width: "50%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            key="loading-content"
            className="fixed inset-0 z-10000 flex items-center justify-center bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Spinner — sharp, minimal */}
            <div className="relative flex items-center justify-center">
              <motion.div
                className="relative overflow-hidden w-[24px] h-[280px] md:w-[32px] md:h-[440px]"
                animate={{ 
                  rotate: 360,
                  backgroundColor: "#FFFFFF"
                }}
                transition={{ 
                  rotate: { duration: 1.2, repeat: Infinity, ease: "linear" }
                }}
              />
            </div>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div
            key="curtain-left-exit"
            className="fixed inset-y-0 left-0 z-9999 bg-black"
            style={{ width: "50%" }}
            initial={{ x: "0%" }}
            animate={{ x: "-100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            key="curtain-right-exit"
            className="fixed inset-y-0 right-0 z-9999 bg-black"
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
