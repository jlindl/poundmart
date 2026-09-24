"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Pixels travelled across the element's pass through the viewport. Negative moves up faster. */
  offset?: number;
  rotate?: number;
  scaleFrom?: number;
  smooth?: boolean;
};

/** Moves its children at a different speed to the page as it scrolls past. */
export function Parallax({ children, className, offset = 80, rotate = 0, scaleFrom = 1, smooth = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const p = smooth ? progress : scrollYProgress;
  const y = useTransform(p, [0, 1], [offset, -offset]);
  const r = useTransform(p, [0, 1], [-rotate, rotate]);
  const s = useTransform(p, [0, 0.5, 1], [scaleFrom, 1, 1]);

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y, rotate: r, scale: s }}>
      {children}
    </motion.div>
  );
}
