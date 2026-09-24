"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmazonButton, AmazonLink } from "@/components/ui/amazon-link";
import { RatingSummary } from "@/components/ui/stars";
import { useProductVariant } from "@/components/shop/variant-context";
import { cn, formatPrice } from "@/lib/utils";

export type BuyVariant = {
  asin: string;
  label: string;
  units: number;
  price: number | null;
  listPrice: number | null;
  rating: number | null;
  reviewCount: number;
  inStock: boolean;
  image: string;
  href: string;
  reviewsHref: string;
};

export type BuyProduct = {
  slug: string;
  name: string;
  brandLabel: string;
  tagline: string;
  unitNoun: string;
  unitSize: string;
  flavourLabel: string;
  flavours: { name: string; colour: string }[];
  variants: BuyVariant[];
  storeHref: string;
  collection: { title: string; href: string };
};

const EASE = [0.16, 1, 0.3, 1] as const;

function perUnit(v: BuyVariant) {
  return v.price !== null ? v.price / v.units : null;
}

/** The sticky buy box: option picker, live price, and the Amazon button. */
export function BuyBox({ product, checkedNote, children }: { product: BuyProduct; checkedNote: string; children?: ReactNode }) {
  const { index, select, setCtaEl } = useProductVariant();
  const reduce = useReducedMotion();
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const v = product.variants[index] ?? product.variants[0];
  const unit = perUnit(v);
  const multi = product.variants.length > 1;
  const cheapest = Math.min(...product.variants.filter((x) => x.inStock).map((x) => perUnit(x) ?? Infinity));

  function onOptionKey(e: KeyboardEvent<HTMLDivElement>) {
    const last = product.variants.length - 1;
    let next = index;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    select(next);
    optionRefs.current[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow flex flex-wrap items-center gap-2 text-ink-soft">
          <span>{product.brandLabel}</span>
          <span aria-hidden className="text-ink/25">
            /
          </span>
          <Link
            href={product.collection.href}
            className="underline decoration-sun decoration-2 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            {product.collection.title}
          </Link>
        </p>
        <SplitHeading
          as="h1"
          immediate
          delay={0.15}
          stagger={0.035}
          text={product.name}
          className="mt-3 font-display text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.035em] text-ink"
        />
        <p className="accent-serif mt-3 text-2xl leading-snug text-ink-soft sm:text-[1.7rem]">{product.tagline}</p>
      </div>

      {/* Rating */}
      <div className="min-h-6">
        {v.rating !== null && v.reviewCount > 0 ? (
          <AmazonLink
            href={v.reviewsHref}
            placement="pdp-reviews"
            asin={v.asin}
            className="group inline-flex flex-wrap items-center gap-2 rounded-full text-ink transition-colors hover:text-ink-soft"
          >
            <RatingSummary rating={v.rating} count={v.reviewCount} />
            <span className="inline-flex items-center gap-0.5 text-sm font-semibold underline decoration-line decoration-2 underline-offset-4 transition-colors group-hover:decoration-sun">
              Read the Amazon reviews
              <ArrowUpRight
                aria-hidden
                className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
            <span className="sr-only"> (opens Amazon in a new tab)</span>
          </AmazonLink>
        ) : (
          <p className="text-sm text-ink-muted">No Amazon ratings on this option yet.</p>
        )}
      </div>

      {/* Price */}
      <div className="rounded-4xl border border-line bg-paper p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div aria-live="polite" aria-atomic="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={v.asin}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
              >
                {v.inStock && v.price !== null ? (
                  <>
                    <span className="font-display text-[2.6rem] font-bold leading-none tracking-tight tabular-nums text-ink">
                      {formatPrice(v.price)}
                    </span>
                    {v.listPrice && (
                      <span className="text-base text-ink-muted line-through tabular-nums">
                        <span className="sr-only">Was </span>
                        {formatPrice(v.listPrice)}
                      </span>
                    )}
                    {unit !== null && v.units > 1 && (
                      <span className="rounded-full bg-sun-soft px-2.5 py-1 text-sm font-semibold tabular-nums text-ink">
                        {formatPrice(unit)} a {product.unitNoun}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-display text-2xl font-bold text-ink-muted">Check availability on Amazon</span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              v.inStock ? "bg-mint/15 text-[#146b5a]" : "bg-ink/5 text-ink-muted",
            )}
          >
            <span aria-hidden className={cn("size-1.5 rounded-full", v.inStock ? "bg-mint" : "bg-ink-muted")} />
            {v.inStock ? "Available on Amazon" : "Currently unavailable"}
          </span>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          {v.units} × {product.unitSize}
          {multi && <> · {v.label}</>}
        </p>

        {/* Options */}
        {multi && (
          <div className="mt-5">
            <p id="option-label" className="mb-2.5 text-sm font-semibold text-ink">
              Choose an option
            </p>
            <div role="radiogroup" aria-labelledby="option-label" onKeyDown={onOptionKey} className="grid gap-2 sm:grid-cols-2">
              {product.variants.map((opt, i) => {
                const active = i === index;
                const u = perUnit(opt);
                const best = opt.inStock && u !== null && u === cheapest && product.variants.filter((x) => x.inStock).length > 1 && opt.units > 1;
                return (
                  <button
                    key={opt.asin}
                    ref={(el) => {
                      optionRefs.current[i] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    tabIndex={active ? 0 : -1}
                    onClick={() => select(i)}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-2.5 pr-3 text-left transition-[border-color,background-color,transform] duration-300 active:scale-[0.98]",
                      active ? "border-ink bg-sun-pale" : "border-line bg-paper hover:border-ink/40",
                    )}
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-cream">
                      <Image src={opt.image} alt="" fill sizes="48px" className="product-cutout object-contain p-1" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-tight text-ink">{opt.label}</span>
                      <span className="mt-0.5 block text-xs tabular-nums text-ink-muted">
                        {opt.inStock && opt.price !== null ? (
                          <>
                            {formatPrice(opt.price)}
                            {u !== null && opt.units > 1 && (
                              <>
                                {" "}
                                · {formatPrice(u)} a {product.unitNoun}
                              </>
                            )}
                          </>
                        ) : (
                          "Unavailable"
                        )}
                      </span>
                    </span>
                    {best && (
                      <span className="absolute -top-2 right-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sun">
                        Best value
                      </span>
                    )}
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                        active ? "border-ink bg-ink text-sun" : "border-line text-transparent",
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Flavours */}
        {product.flavours.length > 0 && (
          <div className="mt-5">
            <p className="mb-2.5 text-sm font-semibold text-ink">{product.flavourLabel}</p>
            <ul className="flex flex-wrap gap-2">
              {product.flavours.map((f) => (
                <li
                  key={f.name}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-3 py-1.5 text-sm font-medium text-ink"
                >
                  <span aria-hidden className="size-2.5 rounded-full ring-2 ring-white" style={{ background: f.colour }} />
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div ref={setCtaEl} className="mt-6 flex flex-col gap-3">
          <Magnetic strength={0.2} className="block w-full">
            <AmazonButton href={v.href} placement="pdp-buy-box" asin={v.asin} size="xl" variant={v.inStock ? "sun" : "outline"} className="w-full">
              {v.inStock ? "Buy on Amazon" : "View on Amazon"}
            </AmazonButton>
          </Magnetic>
          <AmazonLink
            href={product.storeHref}
            placement="pdp-store-link"
            className="group inline-flex items-center justify-center gap-1 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-sun after:transition-transform after:duration-300 group-hover:after:origin-left group-hover:after:scale-x-100">
              Or browse the PoundMart store on Amazon
            </span>
            <ArrowUpRight
              aria-hidden
              className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
            <span className="sr-only"> (opens in a new tab)</span>
          </AmazonLink>
        </div>
      </div>

      {children}

      <p className="text-xs leading-relaxed text-ink-muted">{checkedNote}</p>
    </div>
  );
}

/** Mobile-only bar that slides up once the main Buy button has scrolled away. */
export function MobileBuyBar({ product, hideWhenVisibleId }: { product: BuyProduct; hideWhenVisibleId?: string }) {
  const { index, ctaEl } = useProductVariant();
  const [pastCta, setPastCta] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const reduce = useReducedMotion();
  const v = product.variants[index] ?? product.variants[0];

  useEffect(() => {
    if (!ctaEl) return;
    const io = new IntersectionObserver(([entry]) => setPastCta(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(ctaEl);
    return () => io.disconnect();
  }, [ctaEl]);

  useEffect(() => {
    const el = hideWhenVisibleId ? document.getElementById(hideWhenVisibleId) : null;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setAtEnd(entry.isIntersecting), { rootMargin: "0px 0px -20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hideWhenVisibleId]);

  const show = pastCta && !atEnd;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: "110%" }}
          animate={reduce ? { opacity: 1 } : { y: "0%" }}
          exit={reduce ? { opacity: 0 } : { y: "110%" }}
          transition={{ duration: 0.45, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_32px_-16px_rgb(4_64_108/0.35)] backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-cream">
              <Image src={v.image} alt="" fill sizes="48px" className="product-cutout object-contain p-1" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
              <p className="truncate text-sm tabular-nums text-ink-muted">
                {v.inStock && v.price !== null ? (
                  <>
                    <span className="font-bold text-ink">{formatPrice(v.price)}</span>
                    {v.units > 1 && perUnit(v) !== null && (
                      <>
                        {" "}
                        · {formatPrice(perUnit(v) as number)} a {product.unitNoun}
                      </>
                    )}
                  </>
                ) : (
                  "Check availability"
                )}
              </p>
            </div>
            <AmazonButton
              href={v.href}
              placement="pdp-sticky-bar"
              asin={v.asin}
              size="md"
              showBag={false}
              variant={v.inStock ? "sun" : "outline"}
              className="shrink-0 px-4"
            >
              {v.inStock ? "Buy on Amazon" : "View on Amazon"}
            </AmazonButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
