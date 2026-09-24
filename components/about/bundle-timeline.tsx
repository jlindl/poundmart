"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export type TimelineStep = {
  title: string;
  text: string;
  chips: string[];
  /** A `fill` image (Image or SmartImage) for the step's photo card. */
  media: ReactNode;
  /** Optional sticker overlaid on the photo card. */
  aside?: ReactNode;
};

/** One S-bend of the route: out to one side, back through the node at the centre, out to the other, home to centre. */
function segmentPath(w: number, h: number, dir: 1 | -1) {
  const cx = w / 2;
  const s = Math.min(w * 0.36, 58) * dir;
  const q = h / 4;
  return [
    `M${cx} 0`,
    `C${cx} ${q * 0.55}, ${cx + s} ${q * 0.45}, ${cx + s} ${q}`,
    `C${cx + s} ${q * 1.55}, ${cx} ${q * 1.45}, ${cx} ${q * 2}`,
    `C${cx} ${q * 2.55}, ${cx - s} ${q * 2.45}, ${cx - s} ${q * 3}`,
    `C${cx - s} ${q * 3.55}, ${cx} ${q * 3.45}, ${cx} ${h}`,
  ].join(" ");
}

function StepRow({ step, index, total }: { step: TimelineStep; index: number; total: number }) {
  const rowRef = useRef<HTMLLIElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const still = Boolean(useReducedMotion());
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) => (prev && prev.w === width && prev.h === height ? prev : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: rowRef, offset: ["start 72%", "end 72%"] });
  const fill = useTransform(scrollYProgress, [0.42, 0.52], [0, 1]);
  const ring = useTransform(scrollYProgress, [0.45, 0.6], [0.6, 1.5]);
  const ringOpacity = useTransform(scrollYProgress, [0.45, 0.52, 0.66], [0, 0.9, 0]);
  const mediaScale = useTransform(scrollYProgress, [0, 0.55], [1.18, 1]);
  const inset = useTransform(scrollYProgress, [0, 0.45], [14, 0]);
  const clipPath = useMotionTemplate`inset(${inset}% ${inset}% ${inset}% ${inset}% round 32px)`;

  const flip = index % 2 === 1;
  const dir: 1 | -1 = flip ? -1 : 1;
  const num = String(index + 1).padStart(2, "0");

  return (
    <li
      ref={rowRef}
      className="grid grid-cols-[44px_1fr] gap-x-5 py-10 sm:gap-x-8 lg:grid-cols-[1fr_160px_1fr] lg:gap-x-6 lg:py-20"
    >
      {/* Route + node */}
      <div ref={railRef} aria-hidden className="relative col-start-1 row-span-2 row-start-1 lg:col-start-2 lg:row-span-1">
        {size && (
          <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} className="absolute inset-0 overflow-visible" fill="none">
            <path
              d={segmentPath(size.w, size.h, dir)}
              stroke="var(--color-ink)"
              strokeOpacity={0.16}
              strokeWidth={2}
              strokeDasharray="2 9"
              strokeLinecap="round"
            />
            <motion.path
              d={segmentPath(size.w, size.h, dir)}
              stroke="var(--color-sun-deep)"
              strokeWidth={4}
              strokeLinecap="round"
              style={{ pathLength: still ? 1 : scrollYProgress }}
            />
          </svg>
        )}
        <div className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-ink/10 bg-paper shadow-soft lg:size-16">
          <motion.span style={still ? undefined : { scale: ring, opacity: ringOpacity }} className="absolute -inset-2 rounded-full border-2 border-sun" />
          <motion.span style={still ? undefined : { scale: fill }} className="absolute inset-1 rounded-full bg-sun" />
          <span className="relative font-display text-sm font-bold text-ink lg:text-lg">{num}</span>
        </div>
      </div>

      {/* Photo */}
      <div className={cn("col-start-2 row-start-1", flip ? "lg:col-start-3" : "lg:col-start-1")}>
        <motion.div
          style={still ? undefined : { clipPath }}
          className="relative aspect-[4/3] overflow-hidden rounded-4xl bg-sand shadow-soft"
        >
          <motion.div style={still ? undefined : { scale: mediaScale }} className="absolute inset-0">
            {step.media}
          </motion.div>
          {step.aside && <div className="absolute bottom-3 left-3 z-2 sm:bottom-5 sm:left-5">{step.aside}</div>}
        </motion.div>
      </div>

      {/* Copy */}
      <div
        className={cn(
          "col-start-2 row-start-2 flex flex-col justify-center pt-7 lg:row-start-1 lg:pt-0",
          flip ? "lg:col-start-1 lg:items-end lg:text-right" : "lg:col-start-3",
        )}
      >
        <Reveal y={24} amount={0.5} className={cn("flex max-w-[30rem] flex-col gap-4", flip && "lg:items-end")}>
          <span className="eyebrow text-ink-soft">
            Step {num} <span className="text-ink-muted">of {String(total).padStart(2, "0")}</span>
          </span>
          <h3 className="type-display text-[clamp(2rem,3.6vw,3.25rem)] text-ink">{step.title}</h3>
          <p className="text-lg leading-relaxed text-ink-muted">{step.text}</p>
          <ul className={cn("flex flex-wrap gap-2 pt-1", flip && "lg:justify-end")}>
            {step.chips.map((c) => (
              <li key={c} className="rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-xs font-semibold text-ink">
                {c}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </li>
  );
}

/**
 * "How a bundle comes together": a winding route that draws itself as you
 * scroll, lighting each step's marker as the line reaches it.
 */
export function BundleTimeline({ steps, finale }: { steps: TimelineStep[]; finale: string }) {
  return (
    <div>
      <ol className="flex flex-col">
        {steps.map((step, i) => (
          <StepRow key={step.title} step={step} index={i} total={steps.length} />
        ))}
      </ol>
      <div className="grid grid-cols-[44px_1fr] gap-x-5 sm:gap-x-8 lg:grid-cols-[1fr_160px_1fr] lg:gap-x-6">
        <Reveal
          y={16}
          className="col-span-2 flex justify-start lg:col-span-1 lg:col-start-2 lg:justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-display text-sm font-bold whitespace-nowrap text-cream shadow-lift">
            <span aria-hidden className="size-2 rounded-full bg-sun" />
            {finale}
          </span>
        </Reveal>
      </div>
    </div>
  );
}
