"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@react-three/drei";

const MIN_DURATION = 2400;
const MAX_DURATION = 7000; // Hard fallback to prevent infinite loading

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"animate" | "exit">("animate");
  const [done, setDone] = useState(false);
  
  const { active, progress } = useProgress();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [forceExit, setForceExit] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const minTimer = setTimeout(() => setMinTimeElapsed(true), MIN_DURATION);
    const maxTimer = setTimeout(() => setForceExit(true), MAX_DURATION);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      document.body.style.overflow = "";
    };
  }, []);

  // Track if Three.js has started loading textures
  useEffect(() => {
    if (active || progress > 0) {
      setHasStartedLoading(true);
    }
  }, [active, progress]);

  useEffect(() => {
    if (phase === "exit") return;

    // We consider it "ready" if it has started loading and now finished,
    // OR if it hasn't reported starting but minimum time has passed (cache hit)
    const isReady = hasStartedLoading 
      ? (!active || progress === 100)
      : true; 

    // Exit when minimum time has passed AND assets are ready, OR if max timeout hits
    if (forceExit || (minTimeElapsed && isReady)) {
      setPhase("exit");
      document.body.style.overflow = "";
      setTimeout(() => setDone(true), 800);
    }
  }, [minTimeElapsed, forceExit, isReady, hasStartedLoading, active, progress, phase]);

  if (done) return null;

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <>
          <motion.div
            key="curtain-left"
            className="fixed inset-y-0 left-0 z-[9999] bg-black"
            style={{ width: "50%" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            key="curtain-right"
            className="fixed inset-y-0 right-0 z-[9999] bg-black"
            style={{ width: "50%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            key="loading-content"
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black"
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
