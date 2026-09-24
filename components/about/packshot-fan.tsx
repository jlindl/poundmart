"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export type FanItem = { src: string; width: number; height: number };

function FanTube({
  item,
  offset,
  amount,
  spread,
  gap,
  depth,
  still,
}: {
  item: FanItem;
  offset: number;
  amount: MotionValue<number>;
  spread: number;
  gap: number;
  depth: number;
  still: boolean;
}) {
  const rotate = useTransform(amount, (a) => offset * spread * a);
  const x = useTransform(amount, (a) => `${offset * gap * a}%`);
  return (
    <motion.div
      style={{
        rotate: still ? offset * spread : rotate,
        x: still ? `${offset * gap}%` : x,
        zIndex: depth,
        aspectRatio: `${item.width} / ${item.height}`,
      }}
      whileHover={still ? undefined : { y: -16, transition: { type: "spring", stiffness: 300, damping: 18 } }}
      className="absolute bottom-0 left-1/2 h-[88%] origin-bottom -translate-x-1/2"
    >
      <Image
        src={item.src}
        alt=""
        width={item.width}
        height={item.height}
        sizes="(min-width: 1024px) 9vw, 22vw"
        className="product-cutout h-full w-full object-contain"
      />
    </motion.div>
  );
}

/**
 * A hand of product packshots that fans open as it scrolls into view and
 * spreads a little wider on hover.
 */
export function PackshotFan({
  items,
  label,
  className,
  spread = 10,
  gap = 58,
}: {
  items: FanItem[];
  /** Accessible description of what's pictured. */
  label: string;
  className?: string;
  /** Degrees of rotation between neighbouring items at full spread. */
  spread?: number;
  /** Horizontal spacing between neighbours, as a % of one item's width. */
  gap?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const still = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 55%"] });
  const open = useTransform(scrollYProgress, [0, 1], [0.12, 1]);
  const hover = useMotionValue(1);
  const hoverSpring = useSpring(hover, { stiffness: 180, damping: 16 });
  const amount = useTransform(() => open.get() * hoverSpring.get());
  const mid = (items.length - 1) / 2;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      onPointerEnter={() => hover.set(1.3)}
      onPointerLeave={() => hover.set(1)}
      className={cn("relative", className)}
    >
      {items.map((item, i) => (
        <FanTube
          key={item.src}
          item={item}
          offset={i - mid}
          amount={amount}
          spread={spread}
          gap={gap}
          depth={items.length - Math.round(Math.abs(i - mid))}
          still={still}
        />
      ))}
    </div>
  );
}
