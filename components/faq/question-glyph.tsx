"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A giant italic question mark that tips over and drifts as the hero scrolls
 * away, with a small sun "answer" dot that bounces back up. Decorative.
 */
export function QuestionGlyph({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [8, 34]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const dotY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -60, 20]);
  const dotScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.25, 0.9]);

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none relative select-none", className)}>
      <motion.span
        style={reduce ? { rotate: 8 } : { rotate, y }}
        className="accent-serif block origin-bottom text-[clamp(16rem,36vw,34rem)] leading-[0.8] text-sun"
      >
        ?
      </motion.span>
      <span className="absolute bottom-[6%] left-[74%] block animate-float">
        <motion.span
          style={reduce ? undefined : { y: dotY, scale: dotScale }}
          className="block size-[clamp(2.5rem,6vw,5rem)] rounded-full bg-ink shadow-lift"
        />
      </span>
    </div>
  );
}
