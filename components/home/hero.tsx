"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { RotateCcw, Truck } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { cn } from "@/lib/utils";
import type { HeroData } from "./types";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Layout of the packshot composition, in % of the square stage. */
const LAYERS = [
  { left: 15, top: 13, size: 58, z: 20, depth: 1, drift: { x: -6, y: -16, rotate: -4, scale: 0.94 }, tilt: -4, pad: "p-[13%]" },
  { left: 60, top: -3, size: 41, z: 10, depth: 1.9, drift: { x: 26, y: -38, rotate: 14, scale: 1.02 }, tilt: 6, pad: "p-[15%]" },
  { left: 60, top: 57, size: 39, z: 30, depth: 1.35, drift: { x: 20, y: 16, rotate: 9, scale: 1 }, tilt: 5, pad: "p-[16%]" },
  { left: -3, top: 61, size: 40, z: 30, depth: 1.6, drift: { x: -24, y: 12, rotate: -12, scale: 1 }, tilt: -7, pad: "p-[14%]" },
] as const;

export function HomeHero({ data }: { data: HeroData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Pointer parallax (mouse only), smoothed with springs
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 70, damping: 18, mass: 0.6 });
  const py = useSpring(my, { stiffness: 70, damping: 18, mass: 0.6 });

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  }
  function onPointerLeave() {
    mx.set(0);
    my.set(0);
  }

  // Scroll: the stage drifts apart and the coin grows as the hero leaves
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const coinScale = useTransform(progress, [0, 1], [1, 1.45]);
  const coinRotate = useTransform(progress, [0, 1], [0, 40]);
  const coinY = useTransform(progress, [0, 1], ["0%", "22%"]);
  const textY = useTransform(progress, [0, 1], [0, -90]);
  const textOpacity = useTransform(progress, [0, 0.7], [1, 0.2]);

  const rating = data.rating.toFixed(1);

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate overflow-clip bg-cream pt-[var(--header-h)]"
    >
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(70%_60%_at_30%_40%,black,transparent)]"
      />

      <div className="container-x grid min-h-[calc(100svh-var(--header-h))] items-center gap-x-8 gap-y-14 pb-20 pt-8 lg:grid-cols-12 lg:pb-24 lg:pt-4">
        {/* Copy */}
        <motion.div style={reduce ? undefined : { y: textY, opacity: textOpacity }} className="relative z-10 lg:col-span-7">
          <Enter delay={0.05}>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper/80 py-1.5 pl-1.5 pr-4 shadow-soft backdrop-blur">
              <span className="grid size-7 place-items-center rounded-full bg-cream">
                <Image src="/brand/mark.png" alt="" width={278} height={278} className="size-5" />
              </span>
              <span className="eyebrow text-ink">Home of Great Value Bundles</span>
            </span>
          </Enter>

          <SplitHeading
            as="h1"
            immediate
            delay={0.15}
            stagger={0.07}
            text="Everyday essentials, *bundled* for less."
            className="type-display mt-7 text-[clamp(3rem,7.4vw,6.75rem)] text-ink"
            accentClassName="text-ink-soft"
          />

          <Enter delay={0.55}>
            <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
              Flavoured Nice Smile toothpaste and XHC haircare, packed into multi-packs that cost less per tube, bottle and bar. Sold by
              PoundMart, dispatched by Amazon.
            </p>
          </Enter>

          <Enter delay={0.68}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Magnetic className="w-full sm:w-auto">
                <AmazonButton href={data.storeHref} placement="home-hero" size="xl" className="w-full sm:w-auto">
                  Shop the Amazon store
                </AmazonButton>
              </Magnetic>
              <ButtonLink href="/collections/bundles" variant="outline" size="xl" className="w-full sm:w-auto">
                Explore bundles
              </ButtonLink>
            </div>
          </Enter>

          <Enter delay={0.8}>
            <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink">
              <li className="flex items-center gap-2.5">
                <Stars rating={data.rating} size={16} />
                <span>
                  <strong className="font-semibold tabular-nums">{rating}</strong>
                  <span className="text-ink-soft"> average from {data.ratingCount.toLocaleString("en-GB")} Amazon ratings</span>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Truck aria-hidden className="size-4 text-ink-soft" />
                Dispatched by Amazon
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw aria-hidden className="size-4 text-ink-soft" />
                30-day returns
              </li>
            </ul>
            <p className="mt-4 text-xs text-ink-soft">{data.priceNote}</p>
          </Enter>
        </motion.div>

        {/* Composition */}
        <div className="relative mx-auto w-full max-w-[34rem] lg:col-span-5 lg:max-w-none">
          <div className="@container relative aspect-square w-full">
            {/* The pound coin */}
            <motion.div
              aria-hidden
              style={reduce ? undefined : { scale: coinScale, rotate: coinRotate, y: coinY }}
              className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[122%] -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
                className="@container relative size-full rounded-full bg-sun shadow-[inset_0_-40px_80px_rgb(230_184_0/0.55),0_40px_80px_-40px_rgb(230_184_0/0.7)]"
              >
                <span className="absolute inset-[4.5%] rounded-full border-[3px] border-sun-deep/35" />
                <span className="absolute inset-[9%] rounded-full border border-dashed border-sun-deep/40" />
                <span className="absolute inset-0 grid place-items-center font-display text-[length:62cqw] font-bold leading-none text-sun-deep/25">
                  £
                </span>
              </motion.div>
            </motion.div>

            {data.packshots.map((p, i) => {
              const layer = LAYERS[i % LAYERS.length];
              return (
                <Packshot
                  key={p.slug}
                  index={i}
                  layer={layer}
                  progress={progress}
                  px={px}
                  py={py}
                  reduce={!!reduce}
                  href={`/shop/${p.slug}`}
                  name={p.name}
                  image={p.image}
                  accentSoft={p.accentSoft}
                  preload={i === 0}
                />
              );
            })}

            {/* Rotating badge */}
            <Floating depth={2.3} px={px} py={py} reduce={!!reduce} className="left-[-4%] top-[-5%] z-40 w-[29%]">
              <motion.div
                initial={reduce ? false : { scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.9 }}
                className="relative aspect-square rounded-full bg-paper shadow-lift"
              >
                <svg viewBox="0 0 200 200" aria-hidden className="absolute inset-0 size-full animate-spin-slow">
                  <defs>
                    <path id="hero-badge-ring" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
                  </defs>
                  <text className="fill-ink font-sans text-[15px] font-semibold uppercase">
                    <textPath href="#hero-badge-ring" textLength="470" lengthAdjust="spacing">
                      Home of great value bundles ✦ Sold by PoundMart ✦
                    </textPath>
                  </text>
                </svg>
                <Image
                  src="/brand/mark.png"
                  alt=""
                  width={278}
                  height={278}
                  className="absolute left-1/2 top-1/2 w-[44%] -translate-x-1/2 -translate-y-1/2"
                />
              </motion.div>
            </Floating>

            {/* Price sticker */}
            {data.sticker.perUnit && (
              <Floating depth={2.8} px={px} py={py} reduce={!!reduce} className="left-[55%] top-[43%] z-40 w-[25%]">
                <motion.div
                  initial={reduce ? false : { scale: 0, rotate: 30 }}
                  animate={{ scale: 1, rotate: -9 }}
                  transition={{ type: "spring", stiffness: 140, damping: 12, delay: 1.1 }}
                  className="@container grid aspect-square place-items-center rounded-full bg-ink text-center text-cream shadow-lift"
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[length:11cqw] font-semibold uppercase tracking-wider text-sun">Just</span>
                    <span className="font-display text-[length:27cqw] font-bold tabular-nums tracking-tight">{data.sticker.perUnit}</span>
                    <span className="accent-serif mt-[2cqw] text-[length:13cqw]">a tube</span>
                    <span className="sr-only">in the Nice Smile {data.sticker.units} pack</span>
                  </span>
                </motion.div>
              </Floating>
            )}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
      >
        <span className="eyebrow text-[10px] text-ink-soft">Scroll to unbox</span>
        <span className="relative h-10 w-px overflow-hidden bg-ink/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-ink"
            animate={reduce ? undefined : { y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, ease: EASE, repeat: Infinity }}
          />
        </span>
      </motion.div>
    </section>
  );
}

/** Mount-time entrance for hero copy (the hero is above the fold, so no in-view trigger). */
function Enter({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Absolutely positioned layer that follows the cursor by `depth`. */
function Floating({
  children,
  depth,
  px,
  py,
  reduce,
  className,
}: {
  children: ReactNode;
  depth: number;
  px: MotionValue<number>;
  py: MotionValue<number>;
  reduce: boolean;
  className?: string;
}) {
  const x = useTransform(px, (v) => v * depth * 34);
  const y = useTransform(py, (v) => v * depth * 34);
  return (
    <motion.div style={reduce ? undefined : { x, y }} className={cn("absolute", className)}>
      {children}
    </motion.div>
  );
}

function Packshot({
  index,
  layer,
  progress,
  px,
  py,
  reduce,
  href,
  name,
  image,
  accentSoft,
  preload,
}: {
  index: number;
  layer: (typeof LAYERS)[number];
  progress: MotionValue<number>;
  px: MotionValue<number>;
  py: MotionValue<number>;
  reduce: boolean;
  href: string;
  name: string;
  image: string;
  accentSoft: string;
  preload: boolean;
}) {
  const sx = useTransform(progress, [0, 1], ["0%", `${layer.drift.x}%`]);
  const sy = useTransform(progress, [0, 1], ["0%", `${layer.drift.y}%`]);
  const sr = useTransform(progress, [0, 1], [0, layer.drift.rotate]);
  const ss = useTransform(progress, [0, 1], [1, layer.drift.scale]);
  const px2 = useTransform(px, (v) => v * layer.depth * 34);
  const py2 = useTransform(py, (v) => v * layer.depth * 34);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${layer.left}%`,
        top: `${layer.top}%`,
        width: `${layer.size}%`,
        zIndex: layer.z,
        ...(reduce ? {} : { x: sx, y: sy, rotate: sr, scale: ss }),
      }}
    >
      <motion.div style={reduce ? undefined : { x: px2, y: py2 }}>
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.55, rotate: layer.tilt * 3 }}
          animate={{ opacity: 1, scale: 1, rotate: layer.tilt }}
          transition={{ type: "spring", stiffness: 110, damping: 15, delay: 0.35 + index * 0.12 }}
        >
          <div className="animate-float" style={{ animationDelay: `${index * -1.4}s`, animationDuration: `${6 + index}s` }}>
            <Link
              href={href}
              aria-label={`${name}: view product`}
              className="group relative block aspect-square cursor-pointer rounded-full shadow-lift transition-transform duration-500 ease-[var(--ease-spring)] hover:scale-[1.06] focus-visible:scale-[1.06]"
              style={{ background: accentSoft }}
            >
              <span aria-hidden className="absolute inset-[9%] rounded-full bg-white/75" />
              <Image
                src={image}
                alt=""
                fill
                preload={preload}
                loading={preload ? undefined : "eager"}
                sizes="(min-width: 1024px) 22vw, 55vw"
                className={cn(
                  "product-cutout object-contain transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-3 group-hover:scale-[1.06]",
                  layer.pad,
                )}
              />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
