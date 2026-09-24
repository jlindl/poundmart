"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { X } from "lucide-react";

function StruckWord({ word, progress, index, count, still }: { word: string; progress: MotionValue<number>; index: number; count: number; still: boolean }) {
  const span = 0.7 / count;
  const start = 0.2 + index * span;
  const scaleX = useTransform(progress, [start, start + span], [0, 1]);
  return (
    <span className="relative inline-block">
      {word}
      <motion.span
        aria-hidden
        style={{ scaleX: still ? 1 : scaleX }}
        className="absolute -inset-x-[3%] top-[50%] h-[0.11em] origin-left -rotate-2 rounded-full bg-sun shadow-glow"
      />
    </span>
  );
}

function StrikeRow({ word, note, index }: { word: string; note: string; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const still = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 40%"] });
  const opacity = useTransform(scrollYProgress, [0.55, 1], [1, 0.38]);
  const x = useTransform(scrollYProgress, [0, 1], [index % 2 ? -40 : 40, 0]);
  const parts = word.split(" ");

  return (
    <li ref={ref} className="grid gap-6 border-b border-cream/10 py-10 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-14">
      <motion.p style={still ? undefined : { opacity, x }} className="lg:col-span-8">
        <span className="sr-only">We will never sell </span>
        <span className="type-display flex flex-wrap gap-x-[0.28em] text-[clamp(2.9rem,9.5vw,8.5rem)] text-cream">
          {parts.map((p, i) => (
            <StruckWord key={p} word={p} progress={scrollYProgress} index={i} count={parts.length} still={still} />
          ))}
        </span>
      </motion.p>
      <div className="flex items-start gap-4 lg:col-span-4">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-cream/10 text-sun">
          <X className="size-5" strokeWidth={2.5} />
        </span>
        <p className="max-w-[36ch] text-lg leading-relaxed text-cream/75">{note}</p>
      </div>
    </li>
  );
}

/** Bold typographic "never" statements, struck through in brand yellow as you scroll. */
export function NeverSell({ items }: { items: { word: string; note: string }[] }) {
  return (
    <ul className="border-t border-cream/10">
      {items.map((item, i) => (
        <StrikeRow key={item.word} word={item.word} note={item.note} index={i} />
      ))}
    </ul>
  );
}
