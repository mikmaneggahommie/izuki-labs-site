"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────
   VERTICAL CUT REVEAL — text reveals WORD-BY-WORD
   to prevent mid-word line breaks
   ───────────────────────────────────────────── */

export function VerticalCutReveal({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.06,
}: {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  const words = useMemo(() => children.split(" "), [children]);

  return (
    <span ref={ref} className={`inline ${className}`} aria-label={children}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom mr-[0.25em]"
          style={{ lineHeight: "inherit" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={isInView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: delay + i * staggerDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
            aria-hidden
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────
   LETTER SWAP HOVER — letters swap vertically
   on mouse hover with smooth sliding
   ───────────────────────────────────────────── */

export function LetterSwapHover({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const letters = useMemo(() => children.split(""), [children]);

  return (
    <span
      className={`inline-flex cursor-pointer overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={children}
    >
      {letters.map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          className="relative inline-block overflow-hidden"
          style={{ height: "1.1em", lineHeight: "1.1em" }}
        >
          <motion.span
            className="inline-block"
            animate={{ y: isHovered ? "-100%" : "0%" }}
            transition={{
              duration: 0.35,
              delay: i * 0.02,
              ease: [0.16, 1, 0.3, 1],
            }}
            aria-hidden
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
          <motion.span
            className="absolute left-0 top-full inline-block"
            animate={{ y: isHovered ? "-100%" : "0%" }}
            transition={{
              duration: 0.35,
              delay: i * 0.02,
              ease: [0.16, 1, 0.3, 1],
            }}
            aria-hidden
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────
   TYPEWRITER — types out text letter by letter
   ───────────────────────────────────────────── */

export function TypewriterText({
  text,
  className = "",
  speed = 60,
  delay = 0,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5% 0px" });
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Separate the text into body + final char (the dot)
  const textBody = text.endsWith(".") ? text.slice(0, -1) : text;
  const hasDot = text.endsWith(".");

  useEffect(() => {
    if (!isInView) return;

    let i = 0;
    const delayTimer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayedText(textBody.slice(0, i));
        if (i >= textBody.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [isInView, textBody, speed, delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {displayedText}
      {isTyping && (
        <motion.span
          className="inline-block w-[3px] h-[0.75em] bg-[#E50000] ml-[2px] align-baseline"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
      )}
      {!isTyping && hasDot && (
        <motion.span
          className="inline-block text-[#E50000] font-black"
          animate={{ opacity: [1, 0.2] }}
          transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
        >
          .
        </motion.span>
      )}
    </span>
  );
}

/* ─────────────────────────────────────────────
   SCROLL REVEAL WRAPPER
   ───────────────────────────────────────────── */

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 40,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-8% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ y, opacity: 0, filter: "blur(8px)" }}
      animate={isInView ? { y: 0, opacity: 1, filter: "blur(0px)" } : { y, opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   PARALLAX WRAPPER
   ───────────────────────────────────────────── */

export function ParallaxWrap({
  children,
  className = "",
  speed = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const delta = (elementCenter - viewportCenter) * speed;
      setOffset(delta);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      <div style={{ transform: `translateY(${offset}px)`, willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAGGER CHILDREN
   ───────────────────────────────────────────── */

export function StaggerChildren({
  children,
  className = "",
  stagger = 0.08,
  y = 30,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-8% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { y, opacity: 0, filter: "blur(6px)" },
            visible: {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
