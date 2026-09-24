"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pinned horizontal scroll: while the section is on screen, scrolling down
 * glides the track sideways. With reduced motion it becomes a plain,
 * swipeable row.
 */
export function HorizontalScroller({
  children,
  className,
  label = "Scrollable gallery",
}: {
  children: ReactNode;
  className?: string;
  /** Accessible name for the swipeable fallback row. */
  label?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduce) return;
    const measure = () => setDistance(Math.max(0, track.offsetWidth - document.documentElement.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 150, damping: 32, mass: 0.35 });
  const x = useTransform(progress, (v) => -v * distance);
  const bar = useTransform(progress, [0, 1], [0.04, 1]);

  if (reduce) {
    return (
      <div ref={sectionRef} tabIndex={0} role="region" aria-label={label} className={cn("overflow-x-auto py-20", className)}>
        <div className="flex w-max items-center gap-6 px-[5vw]">{children}</div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className={cn("relative", className)} style={distance ? { height: `calc(100svh + ${distance}px)` } : undefined}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-[calc(var(--header-h)*0.5)]">
        <motion.div ref={trackRef} style={{ x }} className="flex w-max items-center gap-5 px-[5vw] will-change-transform sm:gap-7">
          {children}
        </motion.div>
        <div aria-hidden className="mx-[5vw] mt-10 h-1 overflow-hidden rounded-full bg-cream/10">
          <motion.div className="h-full origin-left rounded-full bg-sun" style={{ scaleX: bar }} />
        </div>
      </div>
    </div>
  );
}
