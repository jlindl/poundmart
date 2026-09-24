"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useId, useRef } from "react";
import type { CollageTile } from "@/components/blog/types";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Editorial photo stack for blog heroes. Tiles rise in on load, then drift
 * upward at different speeds as the page scrolls, with an optional sticker
 * that spins with the scroll. Decorative framing, so the tiles keep real alt text.
 */
export function HeroCollage({
  tiles,
  sticker,
  className,
}: {
  tiles: CollageTile[];
  sticker?: { text: string; className?: string };
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pathId = `sticker-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.35", "end start"] });
  const spin = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {tiles.map((tile, i) => (
        <Tile key={tile.src + i} tile={tile} index={i} progress={scrollYProgress} reduce={Boolean(reduce)} />
      ))}
      {sticker && (
        <motion.div
          aria-hidden
          initial={reduce ? false : { opacity: 0, scale: 0.4, rotate: -40 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.7 }}
          className={cn("absolute z-20 size-28 sm:size-32", sticker.className)}
        >
          <motion.div style={reduce ? undefined : { rotate: spin }} className="relative size-full">
            <div className="absolute inset-0 rounded-full bg-sun shadow-glow" />
            <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-spin-slow text-ink-deep">
              <defs>
                <path id={pathId} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
              </defs>
              <text className="fill-current font-sans text-[10.5px] font-bold uppercase tracking-[0.2em]">
                <textPath href={`#${pathId}`}>{sticker.text}</textPath>
              </text>
            </svg>
            <Image src="/brand/mark.png" alt="" width={278} height={278} className="absolute left-1/2 top-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function Tile({ tile, index, progress, reduce }: { tile: CollageTile; index: number; progress: MotionValue<number>; reduce: boolean }) {
  const travel = tile.speed ?? 80;
  const baseRotate = tile.rotate ?? 0;
  const y = useTransform(progress, [0, 1], [0, -travel]);
  const rotate = useTransform(progress, [0, 1], [baseRotate, baseRotate * -0.6]);
  const contain = tile.fit === "contain";

  return (
    <motion.div className={cn("absolute", tile.className)} style={reduce ? { rotate: baseRotate } : { y, rotate }}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 60, scale: 0.9, clipPath: "inset(18% 12% 18% 12% round 2rem)" }}
        animate={{ opacity: 1, y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0% round 2rem)" }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.2 + index * 0.14 }}
        className="relative size-full overflow-hidden rounded-4xl shadow-lift ring-1 ring-ink/5"
        style={{ background: contain ? (tile.tint ?? "#FFFFFF") : "var(--color-sand)" }}
      >
        {contain && <div aria-hidden className="absolute left-1/2 top-1/2 size-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />}
        <Image
          src={tile.src}
          alt={tile.alt}
          fill
          sizes={tile.sizes}
          priority={tile.priority}
          className={cn(contain ? "product-cutout object-contain p-[9%]" : "object-cover")}
          style={tile.objectPosition ? { objectPosition: tile.objectPosition } : undefined}
        />
      </motion.div>
    </motion.div>
  );
}
