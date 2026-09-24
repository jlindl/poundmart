"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Check, Droplets, House, Leaf, Plane, Sparkles, Waves } from "lucide-react";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { RatingSummary } from "@/components/ui/stars";
import type { FinderPick } from "@/components/shop/shop-data";
import { cn, formatPrice } from "@/lib/utils";

const ICONS = { curls: Waves, moisture: Droplets, soft: Sparkles, fresh: Leaf, travel: Plane, home: House } as const;
const EASE = [0.16, 1, 0.3, 1] as const;
const MotionImage = motion.create(Image);

/** "Which XHC is right for your hair?" Pick a need, get a product from the listing data. */
export function HairFinder({ picks }: { picks: FinderPick[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const pick = picks[index];
  if (!pick) return null;
  const p = pick.product;

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const last = picks.length - 1;
    let next = index;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setIndex(next);
    refs.current[next]?.focus();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
      <div>
        <p id="hair-finder-label" className="font-display text-xl font-bold text-cream">
          What does your hair need?
        </p>
        <p className="mt-1 text-sm text-cream/70">Choose one. Use the arrow keys to move between options.</p>
        <div role="radiogroup" aria-labelledby="hair-finder-label" onKeyDown={onKey} className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
          {picks.map((opt, i) => {
            const Icon = ICONS[opt.icon];
            const active = i === index;
            return (
              <button
                key={opt.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => setIndex(i)}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-3xl border p-3.5 pr-5 text-left transition-[background-color,border-color,color,transform] duration-300 active:scale-[0.99]",
                  active ? "border-cream bg-cream text-ink" : "border-cream/15 text-cream hover:border-cream/40 hover:bg-cream/[0.06]",
                )}
              >
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-2xl transition-colors duration-300",
                    active ? "bg-sun text-ink-deep" : "bg-cream/10 text-sun group-hover:bg-cream/15",
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug">{opt.need}</span>
                  <span className={cn("block text-sm", active ? "text-ink-muted" : "text-cream/70")}>{opt.detail}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border transition-all duration-300",
                    active ? "border-ink bg-ink text-sun" : "border-cream/25 text-transparent",
                  )}
                >
                  <Check className="size-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div aria-live="polite" className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={pick.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden rounded-[2.25rem] bg-paper text-ink shadow-lift sm:rounded-5xl"
          >
            <div className="relative aspect-[16/10] overflow-hidden" style={{ background: p.accentSoft }}>
              <div aria-hidden className="absolute left-1/2 top-1/2 size-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/75" />
              <div aria-hidden className="absolute -right-10 -top-10 size-48 rounded-full opacity-40 blur-2xl" style={{ background: p.accent }} />
              {/* Animate the <img> itself so the multiply knock-out still sees the tinted stage behind it */}
              <MotionImage
                src={p.image}
                alt={p.name}
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="product-cutout object-contain p-[9%]"
                initial={reduce ? false : { scale: 0.85, rotate: -4 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              />
              <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cream sm:left-6 sm:top-6">
                Our pick
              </span>
            </div>
            <div className="flex flex-col gap-4 p-6 sm:p-8">
              <p className="eyebrow text-[10px] text-ink-muted">For {pick.need.toLowerCase()}</p>
              <h3 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{p.name}</h3>
              <blockquote className="border-l-4 border-sun pl-4">
                <p className="font-semibold text-ink">{pick.why.title}</p>
                <p className="mt-1 leading-relaxed text-ink-muted">{pick.why.text}</p>
                <footer className="mt-1 text-xs text-ink-muted">From the Amazon listing</footer>
              </blockquote>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {p.rating !== null && p.reviewCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <RatingSummary rating={p.rating} count={p.reviewCount} />
                    <span className="text-xs text-ink-muted">on Amazon</span>
                  </span>
                )}
                {p.price !== null && (
                  <span className="inline-flex flex-wrap items-baseline gap-2">
                    <span className="font-display text-2xl font-bold tabular-nums">{formatPrice(p.price)}</span>
                    {p.perUnit !== null && p.units > 1 && (
                      <span className="rounded-full bg-sun-soft px-2 py-0.5 text-xs font-semibold tabular-nums">
                        {formatPrice(p.perUnit)} a {p.unitNoun}
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <AmazonButton href={p.amazonHref} placement="collection-haircare-finder" asin={p.asin} size="md">
                  Buy on Amazon
                </AmazonButton>
                <ButtonLink href={`/shop/${p.slug}`} variant="outline" size="md">
                  View details
                </ButtonLink>
              </div>
              {pick.alsoTry && (
                <p className="border-t border-line pt-4 text-sm text-ink-muted">
                  Also worth a look:{" "}
                  <Link
                    href={`/shop/${pick.alsoTry.slug}`}
                    className="group/also inline-flex items-center gap-1 font-semibold text-ink underline decoration-sun decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    {pick.alsoTry.name}
                    <ArrowRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover/also:translate-x-0.5" />
                  </Link>
                </p>
              )}
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
