"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-linked exit for hero copy: as the hero scrolls away it drifts down,
 * softens and shrinks a touch, handing the stage to the next section.
 */
export function HeroScrollFx({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.1]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <motion.div ref={ref} style={reduce ? undefined : { y, opacity, scale }} className={cn("origin-top-left", className)}>
      {children}
    </motion.div>
  );
}
