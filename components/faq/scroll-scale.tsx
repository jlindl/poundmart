"use client";

import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Grows a card from inset and rounded to full size as it scrolls into view:
 * a scroll-linked scale + clip reveal for closing CTAs.
 */
export function ScrollScale({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 25%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const inset = useTransform(scrollYProgress, [0, 1], [6, 0]);
  const clipPath = useMotionTemplate`inset(0% ${inset}% 0% ${inset}% round 2.75rem)`;
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);

  return (
    <motion.div ref={ref} style={reduce ? undefined : { scale, clipPath, y }} className={cn("origin-bottom", className)}>
      {children}
    </motion.div>
  );
}
