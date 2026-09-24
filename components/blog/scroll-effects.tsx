"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-linked "window opening" reveal: the content starts inset and slightly
 * shrunk, and opens to full size as it travels into view. The final clip sits
 * outside the box so hover lifts and shadows are never cut off.
 */
export function ScrollClipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.35"] });
  const p = useSpring(scrollYProgress, { stiffness: 160, damping: 32, mass: 0.4 });
  const inset = useTransform(p, [0, 1], [12, -6]);
  const sides = useTransform(p, [0, 1], [9, -3]);
  const radius = useTransform(p, [0, 1], [56, 32]);
  const clipPath = useTransform(() => `inset(${inset.get()}% ${sides.get()}% ${inset.get()}% ${sides.get()}% round ${radius.get()}px)`);
  const scale = useTransform(p, [0, 1], [0.92, 1]);
  const y = useTransform(p, [0, 1], [60, 0]);

  return (
    <motion.div ref={ref} className={cn("will-change-transform", className)} style={reduce ? undefined : { clipPath, scale, y }}>
      {children}
    </motion.div>
  );
}

/**
 * Hero image frame with a subtle parallax: the frame grows to full width as
 * you begin to scroll while the picture inside drifts and settles.
 */
export function CoverParallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const frame = useTransform(scrollYProgress, [0.1, 0.45], [0.95, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.16, 1.08]);
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={reduce ? undefined : { scale: frame }}
    >
      <motion.div className="absolute inset-0 will-change-transform" style={reduce ? undefined : { scale, y }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Scroll-linked spin for decorative marks and stickers. */
export function ScrollSpin({ children, className, turns = 0.5 }: { children: ReactNode; className?: string; turns?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360 * turns]);
  return (
    <motion.div ref={ref} aria-hidden className={className} style={reduce ? undefined : { rotate }}>
      {children}
    </motion.div>
  );
}
