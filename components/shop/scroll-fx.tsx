"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mirrors the site header's hide-on-scroll logic so sticky UI can sit
 * directly under the header when it is showing and slide up when it hides.
 */
export function useHeaderHidden() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y > 240 && y > prev + 4) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });
  return hidden;
}

/**
 * Zooms its content out (and drifts it vertically) as it scrolls through the
 * viewport. Put inside an overflow-hidden frame. The resting scale stays a
 * little above 1 so the drift never exposes the frame's edge.
 */
export function ScrollScale({
  children,
  className,
  from = 1.22,
  rest = 1.08,
  drift = 3,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  rest?: number;
  /** Vertical travel in % of the element's height, each way. Keep below (rest - 1) / 2 * 100. */
  drift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const scale = useTransform(p, [0, 0.6], [from, rest]);
  const y = useTransform(p, [0, 1], [`-${drift}%`, `${drift}%`]);
  return (
    <motion.div ref={ref} className={cn("h-full w-full will-change-transform", className)} style={reduce ? undefined : { scale, y }}>
      {children}
    </motion.div>
  );
}

/** Opens a rounded clip window as the element scrolls into view. */
export function ClipReveal({ children, className, inset = 14 }: { children: ReactNode; className?: string; inset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 35%"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const clip = useTransform(p, [0, 1], [`inset(${inset}% ${inset}% ${inset}% ${inset}% round 3rem)`, "inset(0% 0% 0% 0% round 2.75rem)"]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { clipPath: clip }}>
      {children}
    </motion.div>
  );
}

/** A value bar that fills to `value` (0 to 1) as it scrolls into view. */
export function ScrollBar({
  value,
  className,
  barClassName,
  label,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  /** Accessible description, e.g. "£2.08 a tube". The bar itself is decorative. */
  label?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 98%", "start 60%"] });
  const p = useSpring(scrollYProgress, { stiffness: 160, damping: 32, mass: 0.4 });
  const scaleX = useTransform(p, [0, 1], [0, 1]);
  const pct = `${Math.max(3, Math.min(100, value * 100))}%`;
  return (
    <span ref={ref} className={cn("relative block h-2.5 w-full overflow-hidden rounded-full", className)} aria-hidden={label ? undefined : true}>
      {label && <span className="sr-only">{label}</span>}
      <motion.span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 block origin-left rounded-full", barClassName)}
        style={reduce ? { width: pct } : { width: pct, scaleX }}
      />
    </span>
  );
}

/** Scroll-linked progress line for timelines. Renders a track plus a fill that grows as the section scrolls. */
export function ScrollLine({ className, fillClassName }: { className?: string; fillClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <div ref={ref} aria-hidden className={cn("absolute w-0.75 overflow-hidden rounded-full bg-ink/10", className)}>
      <motion.div className={cn("absolute inset-0 origin-top rounded-full bg-sun", fillClassName)} style={reduce ? undefined : { scaleY }} />
    </div>
  );
}
