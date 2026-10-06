import Image from "next/image";
import {
  BadgeCheck,
  Candy,
  Check,
  Droplets,
  Flower2,
  Leaf,
  PackageCheck,
  Plane,
  Plus,
  Recycle,
  ShieldCheck,
  Smile,
  Sparkle,
  Sparkles,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Price } from "@/components/product/price";
import { AmazonButton, AmazonLink } from "@/components/ui/amazon-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { RatingSummary } from "@/components/ui/stars";
import { HorizontalScroller } from "@/components/shop/horizontal-scroller";
import { ClipReveal, ScrollScale } from "@/components/shop/scroll-fx";
import type { Media, StoryRow } from "@/components/shop/product-media";
import { productFeatures } from "@/components/shop/shop-data";
import { pricePerUnit, type Product } from "@/lib/products";
import { amazon } from "@/lib/site";
import { cn } from "@/lib/utils";

/* ---------- Why you'll love it ---------- */

const ICON_RULES: [RegExp, LucideIcon][] = [
  [/rinse/i, Waves],
  [/whiten|bright/i, Sparkles],
  [/fluoride|enamel|cavit/i, ShieldCheck],
  [/vegan|cruelty|plant/i, Leaf],
  [/plastic|eco|waste|sustainab/i, Recycle],
  [/travel|gym|compact|carry/i, Plane],
  [/kid|family|adult|ages/i, Smile],
  [/hydrat|moist|oil|nourish/i, Droplets],
  [/shine|smooth|soft|silky/i, Sparkle],
  [/cleans|refresh|revitalis/i, Wind],
  [/flavour|taste|candy|gummy|grape|melon/i, Candy],
  [/fragranc|scent|tropical/i, Flower2],
  [/poundmart|packag|exclusive|bundle|pack|trusted|includes/i, PackageCheck],
];

function iconFor(text: string): LucideIcon {
  return ICON_RULES.find(([re]) => re.test(text))?.[1] ?? BadgeCheck;
}

export function ProductFeatures({ product, image }: { product: Product; image?: Media }) {
  const feats = productFeatures(product);
  if (feats.length === 0) return null;
  const title = product.category === "toothpaste" ? "Small tube, *big* personality." : "Good hair days, *on repeat*.";
  return (
    <section className="overflow-x-clip bg-paper py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading eyebrow="Why you'll love it" title={title} intro="Straight from the Amazon listing, minus the waffle." />
        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-5" stagger={0.08}>
          {image && (
            <RevealItem className="group relative min-h-[22rem] overflow-hidden rounded-4xl sm:row-span-2">
              <div className="absolute inset-0" style={{ background: product.accentSoft }}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className={cn(
                    "transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105",
                    image.packshot ? "product-cutout object-contain p-[10%]" : "object-cover",
                  )}
                />
              </div>
            </RevealItem>
          )}
          {feats.map((f, i) => {
            const Icon = iconFor(`${f.title} ${f.text}`);
            return (
              <RevealItem
                key={f.title}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-4xl border border-line bg-cream p-6 transition-[transform,box-shadow,background-color] duration-500 ease-[var(--ease-out-expo)] hover:bg-paper hover:shadow-lift sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="grid size-12 place-items-center rounded-2xl text-ink transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-[8deg] group-hover:scale-110"
                    style={{ background: product.accentSoft }}
                  >
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className="font-mono text-xs tabular-nums text-ink/40">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink">{f.title}</h3>
                <p className="leading-relaxed text-ink-muted">{f.text}</p>
                <span
                  aria-hidden
                  className="absolute -bottom-14 -right-14 size-36 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-50"
                  style={{ background: product.accent }}
                />
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ---------- The story (A+ content) ---------- */

export function ProductStory({ product, rows }: { product: Product; rows: StoryRow[] }) {
  if (rows.length === 0) return null;
  const title = product.category === "toothpaste" ? "The *story* behind the tube." : "The *good stuff*, explained.";
  return (
    <section className="overflow-hidden bg-cream py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading
          eyebrow="The details"
          title={title}
          intro={`In ${product.brand === "XHC" ? "XHC's" : "Nice Smile's"} own words, from the Amazon listing.`}
        />
        <div className="mt-16 flex flex-col gap-20 lg:mt-24 lg:gap-32">
          {rows.map((r, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={r.title} className="grid items-center gap-8 grid-cols-1 lg:grid-cols-12 lg:gap-12">
                <div className={cn("lg:col-span-6 lg:row-start-1", flip ? "lg:col-start-7" : "lg:col-start-1")}>
                  <Parallax offset={36} rotate={flip ? 1.5 : -1.5}>
                    <ClipReveal className="relative aspect-square overflow-hidden rounded-[2rem] shadow-lift sm:rounded-5xl" inset={10}>
                      <ScrollScale>
                        <div className="relative h-full w-full" style={{ background: product.accentSoft }}>
                          <Image
                            src={r.image.src}
                            alt={r.image.alt}
                            fill
                            sizes="(min-width: 1024px) 46vw, 92vw"
                            className={r.image.packshot ? "product-cutout object-contain p-[10%]" : "object-cover"}
                          />
                        </div>
                      </ScrollScale>
                    </ClipReveal>
                  </Parallax>
                </div>
                <div className={cn("lg:col-span-5 lg:row-start-1", flip ? "lg:col-start-1" : "lg:col-start-8")}>
                  <Reveal y={30}>
                    <span
                      aria-hidden
                      className="type-display block text-[clamp(4rem,8vw,7rem)] leading-none text-transparent opacity-30 [-webkit-text-stroke:1.5px_var(--color-ink)]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 font-display text-[clamp(1.8rem,3.2vw,2.75rem)] font-bold leading-[1.05] tracking-tight text-ink">
                      {r.title}
                    </h3>
                    <div className="mt-5 flex flex-col gap-4">
                      {r.paragraphs.map((t) => (
                        <p key={t.slice(0, 32)} className="text-lg leading-relaxed text-ink/75">
                          {t}
                        </p>
                      ))}
                    </div>
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Lookbook (pinned horizontal scroll) ---------- */

export function ProductLookbook({ product, images }: { product: Product; images: Media[] }) {
  if (images.length < 3) return null;
  return (
    <section aria-label={`${product.name} photo lookbook`} className="grain relative bg-ink text-cream">
      <div className="relative z-[2]">
        <HorizontalScroller label={`${product.name} photos`}>
          <div className="flex w-[78vw] max-w-[26rem] shrink-0 flex-col justify-center pr-4 sm:w-[26rem]">
            <span className="eyebrow inline-flex items-center gap-2 text-sun">
              <span aria-hidden className="size-1.5 rounded-full bg-sun" />
              Lookbook
            </span>
            <SplitHeading
              text="Take a *closer* look."
              className="type-display mt-5 text-[clamp(2.6rem,5vw,4.5rem)] text-cream"
              accentClassName="text-sun"
            />
            <p className="mt-5 max-w-[34ch] text-lg leading-relaxed text-cream/70">
              Photos from the Amazon listing, big enough to read the small print.
            </p>
            <p aria-hidden className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-sun">
              Keep scrolling <span className="animate-float">→</span>
            </p>
          </div>
          {images.map((img, i) => (
            <figure
              key={img.src}
              className={cn(
                "group relative aspect-square h-[min(56svh,78vw,560px)] shrink-0 overflow-hidden rounded-[1.75rem] shadow-lift sm:rounded-4xl",
                i % 2 === 1 && "sm:translate-y-8",
                img.packshot ? "bg-cream" : "bg-ink-deep",
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 80vw"
                className={cn(
                  "transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105",
                  img.packshot ? "product-cutout object-contain p-[10%]" : "object-cover",
                )}
              />
            </figure>
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
}

/* ---------- Best for ---------- */

export function ProductBestFor({ product }: { product: Product }) {
  if (product.bestFor.length === 0) return null;
  return (
    <section className="grain relative overflow-hidden bg-sun py-20 lg:py-28">
      <div aria-hidden className="absolute -right-20 -top-24 size-96 rounded-full bg-white/30 blur-3xl" />
      <div className="container-x relative z-[2] grid items-center gap-10 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal y={12}>
            <span className="eyebrow inline-flex items-center gap-2 text-ink">
              <span aria-hidden className="size-1.5 rounded-full bg-ink" />
              Best for
            </span>
          </Reveal>
          <SplitHeading
            text={product.category === "toothpaste" ? "Made for *real* routines." : "Made for *your* wash day."}
            className="type-display mt-5 text-[clamp(2.6rem,5.6vw,4.9rem)] text-ink-deep"
            accentClassName="text-ink-soft"
          />
        </div>
        <RevealGroup as="ul" className="flex flex-wrap gap-3 lg:col-span-7" stagger={0.08}>
          {product.bestFor.map((b) => (
            <RevealItem as="li" key={b}>
              <span className="inline-flex items-center gap-3 rounded-full bg-paper px-5 py-3.5 font-display text-lg font-bold tracking-tight text-ink shadow-soft sm:px-6 sm:py-4 sm:text-2xl">
                <span className="grid size-7 place-items-center rounded-full bg-ink text-sun sm:size-8">
                  <Check aria-hidden className="size-4" />
                </span>
                {b}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ---------- Compare options ---------- */

export function VariantCompare({ product, checkedNote }: { product: Product; checkedNote: string }) {
  if (product.variants.length < 2) return null;
  const inStock = product.variants.filter((v) => v.inStock && v.price !== null);
  const best = inStock.length > 1 ? Math.min(...inStock.map((v) => pricePerUnit(v) as number)) : null;
  return (
    <section className="bg-paper py-24 lg:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Compare options"
          title="Pick your *pack*."
          intro={`Every ${product.brand === "XHC" ? "XHC" : "Nice Smile"} option for this product on Amazon, side by side, so you can see what each ${product.unitNoun} really costs.`}
        />
        <RevealGroup className={cn("mt-12 grid gap-5 md:grid-cols-2", product.variants.length > 2 && "lg:grid-cols-3")} stagger={0.1}>
          {product.variants.map((v) => {
            const unit = pricePerUnit(v);
            const isBest = best !== null && unit === best && v.units > 1;
            return (
              <RevealItem
                key={v.asin}
                as="article"
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-4xl border bg-cream shadow-soft transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-lift",
                  isBest ? "border-ink" : "border-line",
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden" style={{ background: product.accentSoft }}>
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 transition-transform duration-700 group-hover:scale-110"
                  />
                  <Image
                    src={v.image}
                    alt={`${product.name}, ${v.label}`}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                    className="product-cutout object-contain p-[10%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-2 group-hover:scale-105"
                  />
                  {isBest && (
                    <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sun">
                      Best value
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="font-display text-xl font-bold leading-tight text-ink">{v.label}</h3>
                  <p className="text-sm text-ink-muted">
                    {v.units} × {product.unitSize}
                  </p>
                  {v.rating !== null && v.reviewCount > 0 && (
                    <AmazonLink
                      href={amazon.reviews(v.asin)}
                      placement="pdp-compare-reviews"
                      asin={v.asin}
                      className="inline-flex w-fit items-center gap-1.5 rounded-full text-ink transition-opacity hover:opacity-75"
                    >
                      <RatingSummary rating={v.rating} count={v.reviewCount} />
                      <span className="text-xs font-medium text-ink-muted underline decoration-line underline-offset-4">on Amazon</span>
                      <span className="sr-only"> (opens Amazon reviews in a new tab)</span>
                    </AmazonLink>
                  )}
                  <div className="mt-auto pt-2">
                    <Price product={product} variant={v} />
                  </div>
                  <AmazonButton
                    href={amazon.product(v.asin)}
                    placement="pdp-compare"
                    asin={v.asin}
                    size="md"
                    showBag={false}
                    variant={v.inStock ? "sun" : "outline"}
                    className="mt-2 w-full"
                  >
                    {v.inStock ? "Buy on Amazon" : "View on Amazon"}
                  </AmazonButton>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
        <p className="mt-6 text-sm text-ink-muted">{checkedNote}</p>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

export function ProductFaq({ faq, product }: { faq: { q: string; a: string }[]; product: Product }) {
  if (faq.length === 0) return null;
  return (
    <section className="bg-cream py-24 lg:py-36">
      <div className="container-x grid gap-12 grid-cols-1 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <SectionHeading
              eyebrow="Good to know"
              title="Questions, *answered*."
              intro="Everything here comes from the Amazon listing and how PoundMart sells on Amazon. For anything else, the Amazon reviews and Q&A are a tap away."
            />
            <Reveal delay={0.2} y={12} className="mt-8">
              <AmazonButton
                href={amazon.reviews(product.primary.asin)}
                placement="pdp-faq-reviews"
                asin={product.primary.asin}
                variant="outline"
                size="md"
                showBag={false}
              >
                Read the Amazon reviews
              </AmazonButton>
            </Reveal>
          </div>
        </div>
        <RevealGroup className="flex flex-col gap-3 [interpolate-size:allow-keywords] lg:col-span-7" stagger={0.06}>
          {faq.map((item) => (
            <RevealItem key={item.q}>
              <details className="group/faq rounded-3xl border border-line bg-paper px-5 shadow-soft transition-[box-shadow,border-color] duration-300 open:border-ink/20 open:shadow-lift hover:border-ink/25 sm:px-7 details-content:h-0 details-content:overflow-hidden details-content:transition-[height,content-visibility] details-content:duration-500 details-content:[transition-behavior:allow-discrete] open:details-content:h-auto">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-3xl py-5 font-display text-lg font-semibold leading-snug text-ink sm:py-6 sm:text-xl [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink transition-all duration-300 group-hover/faq:border-ink group-open/faq:rotate-45 group-open/faq:border-ink group-open/faq:bg-ink group-open/faq:text-cream"
                  >
                    <Plus className="size-4" />
                  </span>
                </summary>
                <p className="pb-6 pr-10 leading-relaxed text-ink-muted">{item.a}</p>
              </details>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
