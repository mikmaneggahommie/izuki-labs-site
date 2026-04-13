"use client";

import { motion } from "framer-motion";

interface SpinningCircleProps {
  text?: string;
  size?: number;
}

export default function SpinningCircle({ text = "GET IN TOUCH • GET IN TOUCH • ", size = 200 }: SpinningCircleProps) {
  return (
    <div 
      className="relative flex items-center justify-center p-4" 
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "linear",
        }}
      >
        <defs>
          <path
            id="circlePath"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text className="text-[10px] font-bold uppercase tracking-[0.2em] fill-white mix-blend-difference">
          <textPath xlinkHref="#circlePath">
            {text}
          </textPath>
        </text>
      </motion.svg>
      
      {/* Center Dot or Asset (Optional) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
      </div>
    </div>
  );
}
