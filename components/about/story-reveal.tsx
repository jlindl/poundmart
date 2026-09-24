"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { cn, parseAccent } from "@/lib/utils";

export type StorySegment = { text: string } | { image: string; tint: string };

type Token = { kind: "word"; text: string; accent: boolean } | { kind: "pill"; image: string; tint: string };

function tokenise(segments: StorySegment[]): Token[] {
  return segments.flatMap((seg): Token[] => {
    if ("image" in seg) return [{ kind: "pill", image: seg.image, tint: seg.tint }];
    return parseAccent(seg.text).flatMap((part) =>
      part.text
        .split(/\s+/)
        .filter(Boolean)
        .map((w): Token => ({ kind: "word", text: w, accent: part.accent })),
    );
  });
}

type TokenProps = { progress: MotionValue<number>; range: [number, number]; still: boolean };

function Word({ progress, range, still, accent, children }: TokenProps & { accent: boolean; children: string }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={still ? undefined : { opacity }} className={cn(accent && "accent-serif pr-[0.05em] text-ink-soft")}>
      {children}
    </motion.span>
  );
}

function Pill({ progress, range, still, image, tint }: TokenProps & { image: string; tint: string }) {
  const scale = useTransform(progress, range, [0.3, 1]);
  const rotate = useTransform(progress, range, [-14, 0]);
  return (
    <motion.span
      aria-hidden
      style={still ? { backgroundColor: tint } : { scale, rotate, backgroundColor: tint }}
      className="relative mx-[0.1em] inline-block h-[0.82em] w-[1.9em] overflow-hidden rounded-full align-[-0.06em] shadow-soft"
    >
      <Image src={image} alt="" fill sizes="120px" className="product-cutout object-contain p-[0.06em]" />
    </motion.span>
  );
}

/**
 * A big editorial paragraph whose words light up one by one as you scroll,
 * with product "pills" that pop into place inline.
 */
export function StoryReveal({ segments, className }: { segments: StorySegment[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const still = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const tokens = tokenise(segments);
  const n = tokens.length;

  return (
    <p ref={ref} className={className}>
      {tokens.map((t, i) => {
        const start = i / n;
        const range: [number, number] = [start, Math.min(1, start + 3 / n)];
        return (
          <span key={i}>
            {t.kind === "word" ? (
              <Word progress={scrollYProgress} range={range} still={still} accent={t.accent}>
                {t.text}
              </Word>
            ) : (
              <Pill progress={scrollYProgress} range={range} still={still} image={t.image} tint={t.tint} />
            )}{" "}
          </span>
        );
      })}
    </p>
  );
}
