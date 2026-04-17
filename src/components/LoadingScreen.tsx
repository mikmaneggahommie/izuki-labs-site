"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@react-three/drei";

const MIN_DURATION = 2400;
const MAX_DURATION = 7000;

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"animate" | "exit">("animate");
  const [done, setDone] = useState(false);
  const [isTimeReady, setIsTimeReady] = useState(false);
  const [isForceExit, setIsForceExit] = useState(false);
  
  const { active, progress } = useProgress();
  const hasStartedLoading = useRef(false);

  // Safely mark if loading ever kicked off without triggering re-renders
  useEffect(() => {
    if (active || progress > 0) {
      hasStartedLoading.current = true;
    }
  }, [active, progress]);

  // Timer Effect
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const minTimer = setTimeout(() => setIsTimeReady(true), MIN_DURATION);
    const maxTimer = setTimeout(() => setIsForceExit(true), MAX_DURATION);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      document.body.style.overflow = "";
    };
  }, []);

  // Exit Condition Effect
  useEffect(() => {
    if (phase === "exit") return;

    const isReady = hasStartedLoading.current ? (!active || progress === 100) : true;

    if (isForceExit || (isTimeReady && isReady)) {
      // Defer the state update to avoid React's synchronous cascade warning
      const timeoutId = setTimeout(() => {
        setPhase("exit");
        document.body.style.overflow = "";
        setTimeout(() => setDone(true), 800);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isTimeReady, isForceExit, active, progress, phase]);

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
                className="relative overflow-hidden w-[20px] h-[180px] md:w-[28px] md:h-[300px]"
                animate={{ 
                  rotate: 360,
                  backgroundColor: "#FFFFFF"
                }}
                transition={{ 
                  rotate: { duration: 2.4, repeat: Infinity, ease: "linear" }
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
