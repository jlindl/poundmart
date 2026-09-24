"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { AmazonButton } from "@/components/ui/amazon-link";
import { Stars } from "@/components/ui/stars";
import { cn } from "@/lib/utils";
import type { FlavourOption } from "./types";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Six Nice Smile flavours. Picking one repaints the section and swaps in its artwork. */
export function FlavourPicker({ flavours, priceNote }: { flavours: FlavourOption[]; priceNote: string }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const f = flavours[index];

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const stageY = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const blobRotate = useTransform(scrollYProgress, [0, 1], [-25, 35]);
  const blobScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 1.08]);

  function select(i: number, focus = false) {
    setIndex(i);
    if (focus) optionRefs.current[i]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const n = flavours.length;
    let next: number;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (index + 1) % n;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (index - 1 + n) % n;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = n - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    select(next, true);
  }

  const swap = reduce ? { duration: 0 } : { duration: 0.7, ease: EASE };

  return (
    <motion.section
      ref={sectionRef}
      initial={false}
      animate={{ backgroundColor: f.soft }}
      transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
      className="relative overflow-clip py-24 md:py-32 lg:py-40"
    >
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="container-x relative grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        {/* Copy + picker */}
        <div className="lg:col-span-5">
          <span className="eyebrow inline-flex items-center gap-2 text-ink">
            <motion.span aria-hidden className="size-1.5 rounded-full" animate={{ backgroundColor: f.accent }} />
            Pick your flavour
          </span>
          <SplitHeading
            text="Pick a flavour, *any* flavour."
            className="type-display mt-4 max-w-[12ch] text-[clamp(2.5rem,5vw,4.6rem)] text-ink"
            accentClassName="text-ink-soft"
          />
          <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
            Six fruity and sweet Nice Smile flavours. Every one is vegan, cruelty-free and made with fluoride.
          </p>

          <motion.div
            role="radiogroup"
            aria-label="Nice Smile flavours"
            onKeyDown={onKeyDown}
            className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          >
            {flavours.map((o, i) => {
              const selected = i === index;
              return (
                <motion.button
                  key={o.id}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className={cn(
                    "group relative flex min-h-12 cursor-pointer items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold transition-[translate,background-color,color] duration-300 ease-[var(--ease-out-expo)]",
                    selected ? "text-cream" : "bg-paper/70 text-ink hover:-translate-y-0.5 hover:bg-paper",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="flavour-pill"
                      className="absolute inset-0 rounded-2xl bg-ink shadow-lift"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span
                    aria-hidden
                    className={cn(
                      "relative size-3 shrink-0 rounded-full ring-2 transition-transform duration-300 group-hover:scale-125",
                      selected ? "ring-cream/40" : "ring-white",
                    )}
                    style={{ background: o.accent }}
                  />
                  <span className="relative leading-tight">{o.name}</span>
                </motion.button>
              );
            })}
          </motion.div>

          <p className="sr-only" aria-live="polite">
            {f.name} selected. {f.pun}
          </p>

          <div className="mt-10 lg:min-h-[21rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={f.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
              >
                <p className="accent-serif text-[clamp(2.4rem,4.4vw,3.9rem)] leading-[1.02] text-ink">{f.pun}</p>
                <p className="mt-4 max-w-[46ch] leading-relaxed text-ink-soft">{f.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink">
                  {f.rating !== null && f.reviewCount > 0 && (
                    <span className="inline-flex items-center gap-2">
                      <span className="font-semibold tabular-nums">{f.rating.toFixed(1)}</span>
                      <Stars rating={f.rating} size={14} />
                      <span className="text-ink-soft">
                        {f.reviewCount.toLocaleString("en-GB")} Amazon {f.reviewCount === 1 ? "rating" : "ratings"}
                      </span>
                    </span>
                  )}
                  {f.priceLabel && (
                    <span>
                      <strong className="font-display text-base font-bold tabular-nums">{f.priceLabel}</strong>
                      <span className="text-ink-soft"> · {f.packLabel}</span>
                    </span>
                  )}
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Magnetic>
                    <AmazonButton href={f.amazonHref} asin={f.asin} placement="home-flavour-picker" size="lg">
                      Get {f.name} on Amazon
                    </AmazonButton>
                  </Magnetic>
                  <Link
                    href={`/shop/${f.productSlug}`}
                    className="group inline-flex items-center gap-1.5 rounded-full py-2 text-sm font-semibold text-ink"
                  >
                    <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">
                      See the details
                    </span>
                    <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
            <p className="mt-6 text-xs text-ink-soft">{priceNote}</p>
          </div>
        </div>

        {/* Stage */}
        <motion.div style={reduce ? undefined : { y: stageY }} className="relative lg:col-span-7">
          <div className="relative mx-auto aspect-square w-full max-w-[40rem]">
            <motion.div
              aria-hidden
              className="absolute inset-[2%] rounded-[46%_54%_58%_42%/44%_46%_54%_56%]"
              style={reduce ? undefined : { rotate: blobRotate, scale: blobScale }}
              animate={{ backgroundColor: f.accent }}
              transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
            />
            <div aria-hidden className="absolute inset-[10%] rounded-full border-2 border-dashed border-white/50" />

            {flavours.map((o, i) => {
              const on = i === index;
              return (
                <motion.div
                  key={o.id}
                  aria-hidden={!on}
                  className="absolute inset-[11%] overflow-hidden rounded-5xl bg-paper shadow-lift"
                  initial={false}
                  animate={{
                    opacity: on ? 1 : 0,
                    scale: on ? 1 : 0.9,
                    rotate: on ? 3 : i < index ? -8 : 10,
                    zIndex: on ? 2 : 1,
                  }}
                  transition={swap}
                >
                  <Image src={o.panel} alt={on ? o.panelAlt : ""} fill sizes="(min-width: 1024px) 34vw, 80vw" className="object-cover" />
                </motion.div>
              );
            })}

            {flavours.map((o, i) => {
              const on = i === index;
              return (
                <motion.div
                  key={`${o.id}-pack`}
                  aria-hidden
                  className={cn(
                    "absolute bottom-[1%] left-[-1%] z-10 rounded-4xl bg-paper p-3 shadow-lift sm:p-4",
                    o.packWide ? "aspect-[3/4] w-[34%]" : "aspect-[1/3] w-[16%] rounded-full",
                  )}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, y: on ? 0 : 60, rotate: on ? -7 : -20 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 18, delay: on ? 0.12 : 0 }}
                >
                  <div className="relative size-full">
                    <Image src={o.pack} alt="" fill sizes="(min-width: 1024px) 14vw, 30vw" className="product-cutout object-contain" />
                  </div>
                </motion.div>
              );
            })}

            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={f.id}
                aria-hidden
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: 30 }}
                animate={{ opacity: 1, scale: 1, rotate: 8 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -20 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 16 }}
                className="absolute right-[1%] top-[4%] z-10 rounded-full bg-ink px-5 py-2.5 font-display text-base font-bold text-cream shadow-lift sm:text-lg"
              >
                {f.name}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
