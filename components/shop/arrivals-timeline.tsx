import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { AmazonButton } from "@/components/ui/amazon-link";
import { RatingSummary } from "@/components/ui/stars";
import { Price } from "@/components/product/price";
import { ScrollLine } from "@/components/shop/scroll-fx";
import { productFeatures } from "@/components/shop/shop-data";
import type { Product } from "@/lib/products";
import { amazon } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * "Just landed" timeline, newest first, with a progress line that fills as
 * you scroll. Order comes from the listings (newest ASIN first); no dates are
 * shown because the snapshot doesn't include launch dates.
 */
export function ArrivalsTimeline({ items }: { items: Product[] }) {
  if (items.length === 0) return null;
  return (
    <div className="relative">
      <ScrollLine className="bottom-6 left-[1.1rem] top-6 -translate-x-1/2 lg:left-1/2" />
      <ol className="flex flex-col gap-14 lg:gap-6">
        {items.map((p, i) => {
          const left = i % 2 === 0;
          const feature = productFeatures(p)[0];
          const v = p.primary;
          return (
            <li key={p.slug} className="relative grid pl-12 lg:grid-cols-2 lg:gap-24 lg:pl-0">
              {/* Node */}
              <span
                aria-hidden
                className="absolute left-[1.1rem] top-8 z-[1] grid size-5 -translate-x-1/2 place-items-center rounded-full bg-sun ring-8 ring-paper lg:left-1/2"
              >
                <span className="size-2 rounded-full bg-ink" />
              </span>

              <div className={cn(left ? "lg:col-start-1" : "lg:col-start-2")}>
                <Reveal x={left ? -40 : 40} y={20}>
                  <p className="mb-3 flex items-center gap-2">
                    <span className="eyebrow text-ink-soft">Drop {String(items.length - i).padStart(2, "0")}</span>
                    {i === 0 && (
                      <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cream">Newest</span>
                    )}
                  </p>
                  <article
                    className="group relative overflow-hidden rounded-4xl border border-line bg-cream shadow-soft transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-lift"
                    style={{ ["--accent-soft" as string]: p.accentSoft }}
                  >
                    <div className="grid sm:grid-cols-[13rem_1fr]">
                      <div className="relative aspect-[4/3] bg-[var(--accent-soft)] sm:aspect-auto sm:min-h-full">
                        <div
                          aria-hidden
                          className="absolute left-1/2 top-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 transition-transform duration-700 group-hover:scale-110"
                        />
                        <Image
                          src={v.image}
                          alt={p.name}
                          fill
                          sizes="(min-width: 640px) 208px, 90vw"
                          className="product-cutout object-contain p-[12%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-3 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col gap-3 p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="eyebrow text-[10px] text-ink-muted">{p.brand === "XHC" ? "XHC Xpert Haircare" : p.brand}</span>
                          {v.rating !== null && v.reviewCount > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                              <RatingSummary rating={v.rating} count={v.reviewCount} className="text-xs" />
                              <span className="text-[11px] text-ink-muted">on Amazon</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink">
                          <Link href={`/shop/${p.slug}`} className="after:absolute after:inset-0 after:rounded-4xl focus-visible:outline-none">
                            {p.name}
                          </Link>
                        </h3>
                        <p className="accent-serif text-xl leading-snug text-ink-soft">{p.tagline}</p>
                        {feature && (
                          <p className="text-sm leading-relaxed text-ink-muted">
                            <span className="font-semibold text-ink">{feature.title}.</span> {feature.text}
                          </p>
                        )}
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                          <Price product={p} size="sm" />
                          <div className="relative z-[2] flex items-center gap-2">
                            <AmazonButton
                              href={amazon.product(v.asin)}
                              placement="collection-new-arrivals-timeline"
                              asin={v.asin}
                              size="sm"
                              showBag={false}
                            >
                              Buy on Amazon
                            </AmazonButton>
                            <span
                              aria-hidden
                              className="grid size-9 place-items-center rounded-full border border-line text-ink transition-all duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-cream"
                            >
                              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
