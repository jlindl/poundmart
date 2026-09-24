"use client";

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { TickerItem } from "./types";

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/**
 * Two rows of every flavour and scent, drifting in opposite directions.
 * Scrolling speeds them up, flips their direction and skews them with the scroll velocity.
 */
export function FlavourTicker({ flavours, scents }: { flavours: TickerItem[]; scents: TickerItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "120px 0px" });
  const reduce = useReducedMotion();

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const skew = useTransform(smooth, [-2500, 0, 2500], [7, 0, -7]);

  return (
    <section ref={ref} aria-labelledby="flavour-ticker-title" className="grain relative overflow-clip bg-ink py-14 text-cream md:py-20">
      <Reveal y={16} className="container-x relative z-[2] mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 md:mb-10">
        <h2 id="flavour-ticker-title" className="eyebrow text-sun">
          {flavours.length} toothpaste flavours · {scents.length} haircare scents
        </h2>
        <p className="text-sm text-cream/75">Fruity, sweet and fresh. Pick a favourite, then bundle it.</p>
      </Reveal>

      <p className="sr-only">
        Toothpaste flavours: {flavours.map((f) => f.name).join(", ")}. Haircare scents: {scents.map((s) => s.name).join(", ")}.
      </p>

      <div aria-hidden className="relative z-[2] flex flex-col gap-3 md:gap-5">
        <motion.div style={reduce ? undefined : { skewX: skew }}>
          <VelocityRow items={flavours} baseVelocity={-2.2} factor={factor} active={inView && !reduce} variant="display" />
        </motion.div>
        <div className="container-x">
          <div className="h-px bg-cream/15" />
        </div>
        <motion.div style={reduce ? undefined : { skewX: skew }}>
          <VelocityRow items={scents} baseVelocity={1.8} factor={factor} active={inView && !reduce} variant="serif" />
        </motion.div>
      </div>
    </section>
  );
}

function VelocityRow({
  items,
  baseVelocity,
  factor,
  active,
  variant,
}: {
  items: TickerItem[];
  baseVelocity: number;
  factor: MotionValue<number>;
  active: boolean;
  variant: "display" | "serif";
}) {
  const baseX = useMotionValue(0);
  const direction = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (!active) return;
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    moveBy += direction.current * moveBy * f;
    baseX.set(baseX.get() + moveBy);
  });

  // Enough copies that half the track is always wider than the widest screen.
  const copy = items.length < 8 ? [...items, ...items] : items;

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div className="flex w-max shrink-0" style={{ x }}>
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {copy.map((item, i) => (
              <span
                key={`${half}-${i}`}
                className={cn(
                  "flex items-center gap-[0.35em] px-[0.45em] leading-[1.05]",
                  variant === "display"
                    ? "type-display text-[clamp(2.4rem,6.4vw,5.75rem)] text-cream"
                    : "accent-serif text-[clamp(2.2rem,5.8vw,5.25rem)] text-sun",
                )}
              >
                <span
                  className="inline-block size-[0.34em] shrink-0 rounded-full ring-2 ring-cream/20"
                  style={{ background: item.color }}
                />
                {item.name}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
