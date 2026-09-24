"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const tubes = [
  { src: "/products/B0FNYGR43T/g1.jpg", w: 204, h: 1000, left: "8%", top: "56%", rotate: -24, delay: 0.5 },
  { src: "/products/B0FNYH9TFC/g1.jpg", w: 203, h: 1000, left: "46%", top: "62%", rotate: 76, delay: 0.62 },
  { src: "/products/B0HBXLVW4S/g9.jpg", w: 203, h: 1000, left: "80%", top: "50%", rotate: 18, delay: 0.74 },
];

/**
 * The 404 centrepiece: "4 [cart] 4" with the PoundMart cart rolling about
 * looking for its bundle, and three runaway tubes you can drag around.
 * Purely decorative (the page heading carries the message).
 */
export function LostBundle() {
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  return (
    <div ref={stage} aria-hidden className="relative mx-auto aspect-[5/4] w-full max-w-[560px] select-none">
      {/* 4 [cart] 4 */}
      <div className="absolute inset-x-0 top-[6%] flex items-center justify-center gap-[3%]">
        {["4", null, "4"].map((d, i) =>
          d ? (
            <motion.span
              key={i}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, rotate: i === 0 ? -12 : 12 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1, ease: EASE, delay: i * 0.08 }}
              whileHover={reduce ? undefined : { rotate: i === 0 ? -8 : 8, y: -8 }}
              className="type-display cursor-default text-[clamp(7rem,20vw,13rem)] leading-none text-ink"
            >
              {d}
            </motion.span>
          ) : (
            <motion.span
              key={i}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -160, rotate: -200 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.15 }}
              className="relative grid aspect-square w-[clamp(6rem,17vw,11rem)] place-items-center rounded-full bg-sun shadow-glow"
            >
              <motion.span
                animate={reduce ? undefined : { x: [0, 10, -8, 0], rotate: [0, 8, -6, 0] }}
                transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.6, delay: 1.5 }}
                className="block w-[64%]"
              >
                <Image src="/brand/mark.png" alt="" width={278} height={278} priority className="h-auto w-full" />
              </motion.span>
            </motion.span>
          ),
        )}
      </div>

      {/* Runaway tubes: drag them about */}
      {tubes.map((t) => (
        <motion.div
          key={t.src}
          drag={!reduce}
          dragConstraints={stage}
          dragElastic={0.25}
          dragTransition={{ bounceStiffness: 320, bounceDamping: 16 }}
          whileDrag={{ scale: 1.08, cursor: "grabbing" }}
          whileHover={reduce ? undefined : { scale: 1.05 }}
          initial={reduce ? { opacity: 0, rotate: t.rotate } : { opacity: 0, y: -260, rotate: t.rotate - 60 }}
          animate={{ opacity: 1, y: 0, rotate: t.rotate }}
          transition={{ type: "spring", stiffness: 140, damping: 13, delay: t.delay }}
          className="absolute h-[34%] cursor-grab touch-none"
          style={{ left: t.left, top: t.top, aspectRatio: `${t.w} / ${t.h}` }}
        >
          <Image src={t.src} alt="" width={t.w} height={t.h} draggable={false} className="product-cutout pointer-events-none h-full w-full object-contain" />
        </motion.div>
      ))}

      <div aria-hidden className="absolute inset-x-[10%] bottom-[6%] h-3 rounded-full bg-ink/10 blur-md" />
    </div>
  );
}
