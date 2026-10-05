"use client";

import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmazonButton } from "@/components/ui/amazon-link";
import { cn, formatPrice } from "@/lib/utils";
import type { BundleMathsData, BundleStep } from "./types";

const EASE = [0.16, 1, 0.3, 1] as const;
/** Share of the pinned scroll spent stepping; the rest holds on the final (best value) step. */
const STEP_SPAN = 0.66;

export function BundleMaths({ data }: { data: BundleMathsData }) {
  return (
    <section aria-label="The bundle maths" className="relative bg-paper">
      <PinnedStory data={data} />
      <StackedStory data={data} />
    </section>
  );
}

function Heading({ className }: { className?: string }) {
  return (
    <div className={className}>
      <span className="eyebrow inline-flex items-center gap-2 text-ink-soft">
        <span aria-hidden className="size-1.5 rounded-full bg-sun-deep" />
        The bundle maths
      </span>
      <SplitHeading
        text="Bigger box. *Smaller* price per tube."
        className="type-display mt-4 max-w-[15ch] text-[clamp(2.4rem,3.9vw,4rem)] text-ink"
        accentClassName="text-ink-soft"
      />
    </div>
  );
}

function FinalCta({ data, placement }: { data: BundleMathsData; placement: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Magnetic>
          <AmazonButton href={data.finalHref} asin={data.finalAsin} placement={placement} size="lg">
            Get the {data.finalLabel} on Amazon
          </AmazonButton>
        </Magnetic>
        <Link
          href={`/shop/${data.finalSlug}`}
          className="group inline-flex items-center gap-1.5 rounded-full py-2 text-sm font-semibold text-ink"
        >
          <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-sun-deep after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">
            What&apos;s in the box
          </span>
          <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
      <p className="text-xs text-ink-muted">{data.priceNote}</p>
    </div>
  );
}

/* ---------------- Desktop: pinned, scroll-driven ---------------- */

function PinnedStory({ data }: { data: BundleMathsData }) {
  const { steps } = data;
  const n = steps.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const seg = STEP_SPAN / Math.max(1, n - 1);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(n - 1, Math.max(0, Math.floor((v + seg * 0.5) / seg)));
    setActive((prev) => (prev === next ? prev : next));
  });

  const railRaw = useTransform(scrollYProgress, [0, STEP_SPAN], [0, 1]);
  const rail = useSpring(railRaw, { stiffness: 140, damping: 30 });

  // Giant price counts down between steps
  const price = useMotionValue(steps[0].perUnit);
  const priceText = useTransform(price, (v) => formatPrice(v));
  useEffect(() => {
    const target = steps[active].perUnit;
    if (reduce) {
      price.set(target);
      return;
    }
    const controls = animate(price, target, { duration: 0.9, ease: EASE });
    return () => controls.stop();
  }, [active, steps, price, reduce]);

  const maxPer = Math.max(...steps.map((s) => s.perUnit));
  const step = steps[active];

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    const target = top + Math.min(1, i * seg + seg * 0.15) * range;
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div ref={trackRef} className="relative hidden h-[400vh] [@media(min-width:1024px)_and_(min-height:740px)]:block">
      <div className="sticky top-0 h-[100svh] overflow-clip">
        <div
          aria-hidden
          className="dot-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]"
        />
        <div className="container-x relative grid h-full grid-cols-12 items-center gap-10 pb-8 pt-[calc(var(--header-h)*0.6)]">
          {/* Left: story + steps */}
          <div className="col-span-5 flex flex-col">
            <Heading />
            <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-ink-muted">
              Same 60g Nice Smile tube, four ways to buy it. Keep scrolling and watch the price of each tube drop.
            </p>

            <div className="relative mt-9">
              <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-[2px] rounded-full bg-ink/10" />
              <motion.span
                aria-hidden
                style={{ scaleY: reduce ? active / Math.max(1, n - 1) : rail }}
                className="absolute bottom-6 left-[19px] top-6 w-[2px] origin-top rounded-full bg-sun-deep"
              />
              <ol className="relative flex flex-col gap-1.5">
                {steps.map((s, i) => {
                  const reached = i <= active;
                  const current = i === active;
                  return (
                    <li key={s.id} className="relative">
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        aria-current={current ? "step" : undefined}
                        className={cn(
                          "group flex w-full cursor-pointer items-center gap-4 rounded-3xl py-2.5 pl-0 pr-4 text-left transition-colors duration-300",
                          current ? "bg-sun-pale" : "hover:bg-sun-pale/60",
                        )}
                      >
                        <span
                          className={cn(
                            "relative z-[1] grid size-10 shrink-0 place-items-center rounded-full border-2 text-xs font-bold tabular-nums transition-all duration-500",
                            reached ? "border-sun-deep bg-sun text-ink-deep" : "border-ink/15 bg-paper text-ink-muted",
                            current && "scale-110 shadow-glow",
                          )}
                        >
                          {s.units}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className={cn("font-display text-lg font-bold tracking-tight", current ? "text-ink" : "text-ink-soft")}>
                              {s.label}
                              <span className="sr-only">: {s.title}</span>
                            </span>
                            <span className="text-sm tabular-nums text-ink-soft">
                              {s.price} ·{" "}
                              <strong className={cn("font-semibold", current ? "text-ink" : "text-ink-soft")}>{s.perUnitLabel}</strong> a
                              tube
                            </span>
                          </span>
                          <span className="truncate text-sm text-ink-soft transition-colors group-hover:text-ink">{s.note}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-8">
              <FinalCta data={data} placement="home-bundle-maths" />
            </div>
          </div>

          {/* Right: the stage */}
          <div aria-hidden className="relative col-span-7 h-[min(74svh,680px)]">
            <motion.div
              className="absolute right-[2%] top-0 aspect-square h-[84%] rounded-full"
              animate={{ backgroundColor: step.accentSoft }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <div className="absolute inset-[8%] rounded-full bg-white/70" />
              {steps.map((s, i) => (
                <motion.div
                  key={s.id}
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    opacity: i === active ? 1 : 0,
                    scale: i === active ? 1 : i < active ? 0.78 : 1.12,
                    rotate: i === active ? 0 : i < active ? -10 : 8,
                    filter: i === active ? "blur(0px)" : "blur(8px)",
                  }}
                  transition={reduce ? { duration: 0 } : { duration: 0.8, ease: EASE }}
                >
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 38vw, 1px"
                    className="product-cutout object-contain p-[15%]"
                  />
                </motion.div>
              ))}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={step.id}
                  initial={{ opacity: 0, y: -12, rotate: -12 }}
                  animate={{ opacity: 1, y: 0, rotate: 6 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="absolute right-[6%] top-[8%] rounded-full bg-ink px-4 py-2 font-display text-lg font-bold text-cream shadow-lift"
                >
                  {step.units} × 60g
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* Giant per-tube price */}
            <div className="absolute bottom-0 left-0 z-10">
              <span className="eyebrow text-ink-soft">Price per tube</span>
              <div className="flex items-end gap-4">
                <motion.span className="type-display text-[clamp(5rem,10.5vw,10.5rem)] tabular-nums text-ink">{priceText}</motion.span>
                <span className="accent-serif mb-[0.35em] text-[clamp(1.6rem,2.4vw,2.4rem)] text-ink-soft">a tube</span>
              </div>
              <div className="mt-3 flex h-9 items-center gap-3">
                <span className="text-sm text-ink-muted">
                  {step.price} for {step.units === 1 ? "one tube" : `${step.units} tubes`}
                </span>
                <AnimatePresence mode="popLayout" initial={false}>
                  {step.saving > 0 && (
                    <motion.span
                      key={step.id}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ type: "spring", stiffness: 320, damping: 20 }}
                      className="rounded-full bg-sun px-3 py-1.5 text-sm font-bold text-ink-deep shadow-glow"
                    >
                      {step.saving}% less per tube than a single
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Per-tube bars */}
            <div className="absolute bottom-2 right-[2%] flex h-40 items-end gap-3">
              {steps.map((s, i) => (
                <div key={s.id} className="flex h-full flex-col items-center justify-end gap-2">
                  <motion.span
                    className={cn("w-9 origin-bottom rounded-t-xl", i === active ? "bg-sun" : "bg-ink/10")}
                    style={{ height: `${Math.max(8, (s.perUnit / maxPer) * 100)}%` }}
                    initial={false}
                    animate={{ scaleY: i <= active ? 1 : 0.15 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE }}
                  />
                  <span className={cn("text-xs font-bold tabular-nums", i === active ? "text-ink" : "text-ink-muted")}>{s.units}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Mobile & tablet: stacked, no pinning ---------------- */

function StackedStory({ data }: { data: BundleMathsData }) {
  const { steps } = data;
  const maxPer = Math.max(...steps.map((s) => s.perUnit));
  return (
    <div className="container-x py-24 sm:py-28 [@media(min-width:1024px)_and_(min-height:740px)]:hidden">
      <Heading />
      <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-ink-muted">
        Same 60g Nice Smile tube, four ways to buy it. The bigger the bundle, the less each tube costs.
      </p>
      <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {steps.map((s, i) => (
          <Reveal as="li" key={s.id} delay={i * 0.06}>
            <StepCard step={s} maxPer={maxPer} best={i === steps.length - 1} />
          </Reveal>
        ))}
      </ol>
      <div className="mt-10">
        <FinalCta data={data} placement="home-bundle-maths-mobile" />
      </div>
    </div>
  );
}

function StepCard({ step, maxPer, best }: { step: BundleStep; maxPer: number; best: boolean }) {
  return (
    <article
      className={cn(
        "relative flex h-full items-center gap-4 overflow-hidden rounded-4xl border p-4 sm:p-5",
        best ? "border-sun-deep bg-sun-pale" : "border-line bg-cream",
      )}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-3xl sm:size-28" style={{ background: step.accentSoft }}>
        <Image src={step.image} alt="" fill sizes="112px" className="product-cutout object-contain p-2.5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">{step.label}</h3>
          {best && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream">Best value</span>
          )}
        </div>
        <p className="truncate text-sm text-ink-soft">{step.note}</p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-bold tabular-nums tracking-tight text-ink">{step.perUnitLabel}</span>
          <span className="accent-serif text-lg text-ink-soft">a tube</span>
        </p>
        <p className="text-xs text-ink-soft">
          {step.price} for {step.units === 1 ? "one tube" : `${step.units} tubes`}
          {step.saving > 0 && <span className="font-semibold text-ink"> · {step.saving}% less per tube</span>}
        </p>
        <span aria-hidden className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
          <span
            className={cn("block h-full rounded-full", best ? "bg-sun-deep" : "bg-ink-soft")}
            style={{ width: `${(step.perUnit / maxPer) * 100}%` }}
          />
        </span>
      </div>
    </article>
  );
}
