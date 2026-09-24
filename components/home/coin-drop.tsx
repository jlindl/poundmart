"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

/** Gravity in, tiny settle out. */
const fall = (t: number) => t * t;
const settle = (t: number) => 1 - (1 - t) * (1 - t);

/** Landing spots (in % of the stage) and the scroll window each coin falls in. */
const COINS = [
  { x: 38, y: 34, rotate: -14, from: 0.08, to: 0.3 },
  { x: 53, y: 33, rotate: 10, from: 0.16, to: 0.38 },
  { x: 68, y: 35, rotate: -6, from: 0.24, to: 0.46 },
  { x: 81, y: 36, rotate: 18, from: 0.32, to: 0.54 },
  { x: 60, y: 24, rotate: -20, from: 0.42, to: 0.64 },
];

/** Brand-style cart that fills with pound coins as you scroll towards it. */
export function CoinDrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const wobble = useTransform(progress, [0.28, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74], [0, -3, 2, -2.5, 1.5, -1, 0]);
  const roll = useTransform(progress, [0, 1], [-40, 0]);

  return (
    <div ref={ref} aria-hidden className="relative mx-auto aspect-[5/4] w-full max-w-[34rem]">
      <motion.div className="absolute inset-0 origin-bottom" style={reduce ? undefined : { rotate: wobble, x: roll }}>
        {/* Back of the cart */}
        <svg viewBox="0 0 500 400" className="absolute inset-0 size-full overflow-visible">
          <path
            d="M22 62 H88 L112 112"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M112 112 H474 L436 272 H152 Z"
            fill="rgb(4 64 108 / 0.08)"
            stroke="var(--color-ink)"
            strokeWidth="22"
            strokeLinejoin="round"
          />
          <path
            d="M152 272 L138 318 H430"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="190" cy="360" r="26" fill="var(--color-ink)" />
          <circle cx="190" cy="360" r="9" fill="var(--color-sun)" />
          <circle cx="390" cy="360" r="26" fill="var(--color-ink)" />
          <circle cx="390" cy="360" r="9" fill="var(--color-sun)" />
        </svg>

        {/* Coins */}
        {COINS.map((c, i) => (
          <Coin key={i} coin={c} progress={progress} reduce={!!reduce} />
        ))}

        {/* Front of the basket, drawn over the coins */}
        <svg viewBox="0 0 500 400" className="absolute inset-0 size-full overflow-visible">
          <path
            d="M124 150 H465 L436 272 H152 Z"
            fill="var(--color-ink)"
            stroke="var(--color-ink)"
            strokeWidth="22"
            strokeLinejoin="round"
          />
          <path d="M150 196 H448" stroke="var(--color-sun)" strokeOpacity="0.9" strokeWidth="8" strokeLinecap="round" />
          <path d="M162 236 H440" stroke="var(--color-sun)" strokeOpacity="0.9" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
}

function Coin({ coin, progress, reduce }: { coin: (typeof COINS)[number]; progress: MotionValue<number>; reduce: boolean }) {
  const mid = coin.to - 0.05;
  const y = useTransform(progress, [coin.from, mid, coin.to], ["-420%", "18%", "0%"], { ease: [fall, settle] });
  const rotate = useTransform(progress, [coin.from, coin.to], [coin.rotate - 220, coin.rotate]);
  const opacity = useTransform(progress, [coin.from, coin.from + 0.03], [0, 1]);

  return (
    <div className="absolute w-[17%]" style={{ left: `${coin.x}%`, top: `${coin.y}%`, translate: "-50% -50%" }}>
      <motion.div
        style={reduce ? { rotate: coin.rotate } : { y, rotate, opacity }}
        className="@container grid aspect-square place-items-center rounded-full border-[3px] border-ink bg-[#FFE04A] shadow-[inset_0_-6px_0_rgb(230_184_0/0.9),0_10px_20px_-8px_rgb(1_25_44/0.5)]"
      >
        <span className="absolute inset-[12%] rounded-full border-2 border-ink/25" />
        <span className="font-display text-[length:52cqw] font-bold leading-none text-ink">£</span>
      </motion.div>
    </div>
  );
}
