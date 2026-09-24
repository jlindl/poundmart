"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

function TapeRow({ items, tone, copies = 4 }: { items: readonly string[]; tone: "sun" | "ink"; copies?: number }) {
  return (
    <>
      {Array.from({ length: copies }, (_, c) => (
        <ul key={c} aria-hidden={c > 0 || undefined} className="flex shrink-0 items-center">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-6 px-6 font-display text-[clamp(1.35rem,3.4vw,2.6rem)] font-bold tracking-[-0.03em] whitespace-nowrap"
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-[1.1em] place-items-center rounded-full text-[0.55em]",
                  tone === "sun" ? "bg-ink text-sun" : "bg-sun text-ink-deep",
                )}
              >
                £
              </span>
              {item}
            </li>
          ))}
        </ul>
      ))}
    </>
  );
}

/**
 * Two crossing tapes of verified brand facts. Scrolling drives them in
 * opposite directions, so the page feels like it's moving through them.
 */
export function FactTapes({ top, bottom, label }: { top: readonly string[]; bottom: readonly string[]; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-22%", "0%"]);

  return (
    <section ref={ref} aria-label={label} className="relative overflow-hidden bg-paper py-20 sm:py-28">
      <div className="-mx-[10vw] -rotate-3 bg-sun py-4 text-ink-deep shadow-lift sm:py-6">
        <motion.div style={reduce ? undefined : { x: x1 }} className="flex w-max">
          <TapeRow items={top} tone="sun" />
        </motion.div>
      </div>
      <div className="relative z-1 -mx-[10vw] -mt-3 rotate-2 bg-ink py-4 text-cream shadow-lift sm:-mt-5 sm:py-6">
        <motion.div style={reduce ? undefined : { x: x2 }} className="flex w-max">
          <TapeRow items={bottom} tone="ink" />
        </motion.div>
      </div>
    </section>
  );
}
