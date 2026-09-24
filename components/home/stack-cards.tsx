"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Children, useRef, type ReactNode } from "react";

/**
 * Sticky stacking cards: each card pins below the header and shrinks back
 * slightly as the next one slides over it.
 */
export function StackCards({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const cards = Children.toArray(children);
  return (
    <div ref={ref} className="relative flex flex-col gap-[14vh] lg:gap-[22vh]">
      {cards.map((card, i) => (
        <StackCard key={i} index={i} total={cards.length} progress={scrollYProgress}>
          {card}
        </StackCard>
      ))}
    </div>
  );
}

function StackCard({
  children,
  index,
  total,
  progress,
}: {
  children: ReactNode;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const target = 1 - (total - 1 - index) * 0.045;
  const scale = useTransform(progress, [index / total, 1], [1, target]);
  const dim = useTransform(progress, [index / total, 1], [0, (total - 1 - index) * 0.1]);
  return (
    <div className="sticky" style={{ top: `calc(var(--header-h) + 1.25rem + ${index * 22}px)` }}>
      <motion.div style={reduce ? undefined : { scale }} className="relative origin-top">
        {children}
        {!reduce && (
          <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 rounded-5xl bg-ink-night" />
        )}
      </motion.div>
    </div>
  );
}
