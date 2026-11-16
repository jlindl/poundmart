"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Counts up to `to` once scrolled into view.
 * The server-rendered HTML shows the real number (for search engines, link previews
 * and anyone without JavaScript); the browser resets it to `from` and animates when seen.
 */
export function CountUp({
  to,
  from = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className,
}: {
  to: number;
  from?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (reduce) return;
    if (!inView) {
      const frame = requestAnimationFrame(() => setValue(from));
      return () => cancelAnimationFrame(frame);
    }
    const controls = animate(from, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: setValue });
    return () => controls.stop();
  }, [inView, from, to, duration, reduce]);

  const shown = reduce ? to : value;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
