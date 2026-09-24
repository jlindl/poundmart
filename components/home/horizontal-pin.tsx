"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Pin only where the whole shelf fits on screen; short laptop screens get the native shelf. */
const DESKTOP = "(min-width: 1024px) and (min-height: 740px)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  );
}

/** Aligns the first card with the page container at any width. */
const GUTTER = "max(clamp(1.25rem, 4vw, 3rem), calc((100% - 88rem) / 2 + clamp(1.25rem, 4vw, 3rem)))";

/**
 * Desktop: pins the section and converts vertical scroll into a horizontal slide.
 * Mobile/tablet (and reduced motion): a native, snap-scrolling horizontal shelf.
 */
export function HorizontalPin({ header, children, label }: { header: ReactNode; children: ReactNode; label: string }) {
  const desktop = useIsDesktop();
  const reduce = useReducedMotion();
  const pin = desktop && !reduce;

  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const distance = useMotionValue(0);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!pin) return;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;
    const ro = new ResizeObserver(() => {
      const d = Math.max(0, track.scrollWidth - viewport.clientWidth);
      distance.set(d);
      setHeight(d + window.innerHeight);
    });
    ro.observe(track);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [pin, distance]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 32, mass: 0.35 });
  const x = useTransform(() => -smooth.get() * distance.get());

  const { scrollXProgress } = useScroll({ container: viewportRef });
  const bar = pin ? scrollYProgress : scrollXProgress;

  return (
    <div ref={sectionRef} className={cn("relative", pin && "h-[300vh]")} style={pin && height ? { height } : undefined}>
      <div
        className={cn(
          pin ? "sticky top-0 flex h-[100svh] flex-col justify-center overflow-clip pt-[calc(var(--header-h)*0.5)]" : "py-24 md:py-32",
        )}
      >
        {header}
        <div
          ref={viewportRef}
          className={cn(
            "mt-10 lg:mt-12",
            pin ? "overflow-visible" : "no-scrollbar snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth pb-4",
          )}
          style={pin ? undefined : { scrollPaddingInline: GUTTER }}
        >
          <motion.ul
            ref={trackRef}
            aria-label={label}
            className="flex w-max items-stretch gap-4 sm:gap-5"
            style={{ paddingInline: GUTTER, ...(pin ? { x } : {}) }}
          >
            {children}
          </motion.ul>
        </div>
        <div className="container-x mt-8 flex items-center gap-4" aria-hidden>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
            <motion.div className="h-full origin-left rounded-full bg-ink" style={{ scaleX: bar }} />
          </div>
          <span className="eyebrow text-[10px] text-ink-muted">{pin ? "Keep scrolling" : "Swipe"}</span>
        </div>
      </div>
    </div>
  );
}
