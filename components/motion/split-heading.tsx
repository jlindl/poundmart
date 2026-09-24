"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn, parseAccent } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  /** Wrap words in *asterisks* to set them in the italic serif accent. */
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  accentClassName?: string;
  delay?: number;
  stagger?: number;
  /** Animate on mount (hero) instead of when scrolled into view. */
  immediate?: boolean;
};

/**
 * Headline that rises in word by word from behind a mask.
 * The heading element observes the viewport (the words start clipped, so they
 * can't observe themselves). Screen readers get the plain sentence.
 */
export function SplitHeading({ text, as = "h2", className, accentClassName, delay = 0, stagger = 0.06, immediate = false }: Props) {
  const reduce = useReducedMotion();
  const segments = parseAccent(text);
  const plain = segments.map((s) => s.text).join("");
  const words = segments.flatMap((seg) =>
    seg.text
      .split(/(\s+)/)
      .filter((w) => w.length > 0)
      .map((w) => ({ word: w, accent: seg.accent, space: /^\s+$/.test(w) })),
  );

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } };
  const word: Variants = {
    hidden: reduce ? { opacity: 0 } : { y: "110%", rotate: 4, opacity: 0 },
    show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1, ease: EASE } },
  };

  const Tag = motion[as];
  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.4 } };

  return (
    <Tag className={cn(className)} aria-label={plain} initial="hidden" variants={container} {...trigger}>
      {words.map((w, i) =>
        w.space ? (
          <span key={i}> </span>
        ) : (
          <span key={i} aria-hidden className="mb-[-0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              variants={word}
              className={cn("inline-block will-change-transform", w.accent && cn("accent-serif pr-[0.06em]", accentClassName))}
            >
              {w.word}
            </motion.span>
          </span>
        ),
      )}
    </Tag>
  );
}
