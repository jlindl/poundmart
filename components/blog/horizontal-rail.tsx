"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pinned horizontal scroll for large screens: the section sticks while vertical
 * scrolling slides the track sideways. Below 1024px it is an ordinary vertical
 * stack; with reduced motion on desktop it becomes a native horizontal scroller.
 * Keyboard focus moving into an off-screen panel scrolls the page to reveal it.
 */
export function HorizontalRail({
  children,
  className,
  trackClassName,
  progressClassName,
}: {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  progressClassName?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [distance, setDistance] = useState(0);
  const travel = useMotionValue(0);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const d = wide.matches && !reduce ? Math.max(0, Math.round(track.scrollWidth - viewport.clientWidth)) : 0;
      travel.set(d);
      setDistance(d);
    };
    // ResizeObserver reports once on observe, which covers the first measurement.
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(viewport);
    wide.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      wide.removeEventListener("change", measure);
    };
  }, [reduce, travel]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const eased = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 });
  const x = useTransform(() => -eased.get() * travel.get());
  const pinned = distance > 0;

  function revealFocused(e: FocusEvent<HTMLDivElement>) {
    const section = sectionRef.current;
    if (!pinned || !section) return;
    const panel = (e.target as HTMLElement).closest<HTMLElement>("[data-rail-panel]");
    if (!panel) return;
    const p = Math.min(1, Math.max(0, (panel.offsetLeft - 48) / distance));
    const top = section.getBoundingClientRect().top + window.scrollY + p * distance;
    if (lenis) lenis.scrollTo(top, { immediate: true });
    else window.scrollTo({ top });
  }

  return (
    <div
      ref={sectionRef}
      className={cn("relative", className, pinned && "lg:py-0")}
      style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div
        ref={viewportRef}
        className={cn(
          "relative",
          pinned ? "sticky top-0 flex h-screen flex-col justify-center overflow-clip" : "lg:overflow-x-auto lg:pb-4",
        )}
      >
        <motion.div
          ref={trackRef}
          onFocus={revealFocused}
          style={pinned ? { x } : undefined}
          className={cn("relative flex flex-col gap-6 lg:w-max lg:flex-row lg:items-stretch lg:gap-8", trackClassName)}
        >
          {children}
        </motion.div>
        {pinned && (
          <div aria-hidden className={cn("container-x absolute inset-x-0 bottom-8", progressClassName)}>
            <div className="h-[3px] overflow-hidden rounded-full bg-cream/15">
              <motion.div className="h-full origin-left rounded-full bg-sun" style={{ scaleX: scrollYProgress }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
