"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useId, useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StageItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
  cutout: boolean;
};

const EASE = [0.16, 1, 0.3, 1] as const;
const MotionImage = motion.create(Image);

/** Where each supporting image sits around the hero packshot. */
const SLOTS = [
  { className: "left-[-4%] top-[4%] w-[36%] -rotate-[7deg] sm:left-[-2%]", depth: 1.6, scroll: -120 },
  { className: "right-[-5%] top-[10%] w-[31%] rotate-[6deg] sm:right-[-3%]", depth: 1.1, scroll: -60 },
  { className: "bottom-[0%] right-[2%] w-[38%] -rotate-[3deg]", depth: 2, scroll: -170 },
];

const STICKER_SLOTS = ["left-[2%] bottom-[20%] -rotate-[5deg]", "right-[0%] top-[46%] rotate-[4deg]", "left-[26%] top-[-1%] rotate-[-2deg]"];

function Layer({
  children,
  className,
  depth,
  scrollShift,
  px,
  py,
  progress,
  reduce,
}: {
  children: ReactNode;
  className?: string;
  depth: number;
  scrollShift: number;
  px: MotionValue<number>;
  py: MotionValue<number>;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const mx = useTransform(px, (v) => v * depth * 22);
  const my = useTransform(py, (v) => v * depth * 22);
  const sy = useTransform(progress, [0, 1], [0, scrollShift]);
  const y = useTransform([my, sy], ([a, b]: number[]) => a + b);
  return (
    <motion.div className={cn("absolute", className)} style={reduce ? undefined : { x: mx, y }}>
      {children}
    </motion.div>
  );
}

/**
 * Layered hero composition: a hero packshot on a tinted disc with supporting
 * photos and fact stickers that drift at different depths with the cursor and
 * the scroll. Used by the shop and collection heroes.
 */
export function PackshotStage({
  hero,
  supporting,
  stickers = [],
  soft,
  accent,
  ringText = "Home of Great Value Bundles",
  className,
}: {
  hero: StageItem;
  supporting: StageItem[];
  stickers?: string[];
  soft: string;
  accent: string;
  ringText?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ringId = `ring-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.4 });
  const px = useSpring(useMotionValue(0), { stiffness: 90, damping: 20 });
  const py = useSpring(useMotionValue(0), { stiffness: 90, damping: 20 });
  const discScale = useTransform(progress, [0, 1], [1, 1.14]);
  const heroY = useTransform(progress, [0, 1], [0, 70]);
  const heroRotate = useTransform(progress, [0, 1], [0, -6]);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  const ring = `${ringText} ✦ ${ringText} ✦ `;

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("relative mx-auto aspect-square w-full max-w-[600px] select-none", className)}
    >
      {/* Disc */}
      <motion.div aria-hidden className="absolute inset-[9%]" style={reduce ? undefined : { scale: discScale }}>
        <motion.div
          className="size-full rounded-full"
          style={{ background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${soft} 58%, ${soft} 100%)` }}
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      </motion.div>
      <div aria-hidden className="absolute inset-[9%] rounded-full border-2 border-dashed opacity-40" style={{ borderColor: accent }} />

      {/* Rotating ring text */}
      <div aria-hidden className="absolute inset-[1%] animate-spin-slow">
        <svg viewBox="0 0 200 200" className="size-full">
          <defs>
            <path id={ringId} d="M100,100 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
          </defs>
          <text className="fill-ink font-display text-[8.4px] font-bold uppercase tracking-[0.32em]">
            <textPath href={`#${ringId}`}>{ring}</textPath>
          </text>
        </svg>
      </div>

      {/* Floor shadow */}
      <div aria-hidden className="absolute bottom-[13%] left-1/2 h-[6%] w-[44%] -translate-x-1/2 rounded-[50%] bg-ink/15 blur-xl" />

      {/* Hero packshot. Motion is applied to the <img> itself: a transformed wrapper would isolate
          the multiply blend and the packshot's white background would show over the disc. */}
      <div className="absolute inset-[16%]">
        <MotionImage
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes="(min-width: 1024px) 34vw, 70vw"
          className={cn("object-contain", hero.cutout && "product-cutout")}
          style={reduce ? undefined : { y: heroY, rotate: heroRotate }}
          initial={reduce ? false : { scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
        />
      </div>

      {/* Supporting photos */}
      {supporting.slice(0, SLOTS.length).map((item, i) => {
        const slot = SLOTS[i];
        return (
          <Layer
            key={item.src}
            className={slot.className}
            depth={slot.depth}
            scrollShift={slot.scroll}
            px={px}
            py={py}
            progress={progress}
            reduce={reduce}
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.7, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.35 + i * 0.12 }}
              className={cn(
                "relative aspect-square overflow-hidden rounded-[1.4rem] border-4 border-paper shadow-lift sm:rounded-[1.8rem]",
                item.cutout ? "bg-paper" : "bg-sand",
              )}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 14vw, 32vw"
                className={item.cutout ? "product-cutout object-contain p-[10%]" : "object-cover"}
              />
            </motion.div>
          </Layer>
        );
      })}

      {/* Fact stickers */}
      {stickers.slice(0, STICKER_SLOTS.length).map((s, i) => (
        <Layer
          key={s}
          className={cn(STICKER_SLOTS[i], "z-10")}
          depth={2.4 - i * 0.4}
          scrollShift={-90 - i * 30}
          px={px}
          py={py}
          progress={progress}
          reduce={reduce}
        >
          <motion.span
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.8 + i * 0.12 }}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-lift sm:px-4 sm:py-2 sm:text-xs",
              i === 0 ? "bg-ink text-cream" : i === 1 ? "bg-sun text-ink-deep" : "bg-paper text-ink",
            )}
          >
            <span aria-hidden className={cn("size-1.5 rounded-full", i === 0 ? "bg-sun" : "bg-ink")} />
            {s}
          </motion.span>
        </Layer>
      ))}

      {/* Brand mark sticker */}
      <motion.div
        aria-hidden
        className="absolute bottom-[4%] left-[8%] z-10 grid size-[18%] place-items-center rounded-full bg-paper shadow-lift"
        initial={reduce ? false : { scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: 0.95 }}
      >
        <Image src="/brand/mark.png" alt="" width={278} height={278} className="w-[70%] animate-float" />
      </motion.div>
    </div>
  );
}
