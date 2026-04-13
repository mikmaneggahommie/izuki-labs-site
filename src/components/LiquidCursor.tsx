"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function LiquidCursor() {
  const [hovered, setHovered] = useState(false);
  const [hoverText, setHoverText] = useState("");

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring configuration for 'Liquid' inertia
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Check for 'interactive' hover targets (elements with data-cursor attribute)
      const target = e.target as HTMLElement;
      const cursorText = target.dataset.cursor;
      if (cursorText) {
        setHovered(true);
        setHoverText(cursorText);
      } else if (target.closest("[data-cursor]")) {
        const closestTarget = target.closest("[data-cursor]") as HTMLElement;
        setHovered(true);
        setHoverText(closestTarget.dataset.cursor || "");
      } else {
        setHovered(false);
        setHoverText("");
      }
    };

    window.addEventListener("mousemove", moveMouse);
    return () => window.removeEventListener("mousemove", moveMouse);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <motion.div
        style={{
          translateX: cursorX,
          translateY: cursorY,
        }}
        animate={{
          scale: hovered ? 1 : 0.4,
          width: hovered ? 120 : 40,
          height: hovered ? 120 : 40,
        }}
        className="flex items-center justify-center rounded-full bg-white transition-colors mix-blend-difference"
      >
        {hovered && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-bold uppercase tracking-widest text-black"
          >
            {hoverText}
          </motion.span>
        )}
      </motion.div>
      
      {/* Outer Glow / Liquid Effect Layer */}
      <motion.div
        style={{
          translateX: cursorX,
          translateY: cursorY,
        }}
        animate={{
          scale: hovered ? 1.2 : 0.8,
          opacity: hovered ? 0.2 : 0.1,
        }}
        className="absolute -inset-10 flex items-center justify-center pointer-events-none"
      >
        <div className="w-40 h-40 rounded-full bg-white blur-3xl" />
      </motion.div>
    </div>
  );
}
