import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { AmazonLink } from "@/components/ui/amazon-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { ScrollBar } from "@/components/shop/scroll-fx";
import { niceSmileValueRows, savingsRows, shortName } from "@/components/shop/shop-data";
import { amazon, site } from "@/lib/site";
import { cn, formatDate, formatPrice } from "@/lib/utils";

/**
 * "Do the maths" table: every in-stock Nice Smile option ranked by what one
 * 60g tube costs. All numbers come from the Amazon snapshot.
 */
export function ValueTable() {
  const rows = niceSmileValueRows();
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.perUnit));
  const headline = savingsRows()[0];

  return (
    <section className="grain relative overflow-clip bg-ink py-24 text-cream lg:py-36">
      <div aria-hidden className="absolute -right-40 top-10 size-[36rem] rounded-full bg-ink-soft/40 blur-3xl" />
      <div aria-hidden className="absolute -left-32 bottom-0 size-[28rem] rounded-full bg-sun/10 blur-3xl" />
      <div className="container-x relative z-[2] grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <SectionHeading
              eyebrow="Do the maths"
              title="The more you bundle, the *less* you pay per tube."
              tone="light"
              intro="Every Nice Smile option side by side, ranked by what a single 60g tube actually costs you."
            />
            {headline && (
              <Reveal delay={0.2} className="mt-10">
                <div className="relative overflow-hidden rounded-4xl border border-cream/10 bg-ink-deep/60 p-6 sm:p-8">
                  <div className="flex items-end gap-4 pr-20 sm:pr-24">
                    <p className="type-display text-[clamp(4rem,9vw,7rem)] leading-none text-sun">
                      <CountUp to={headline.percent} suffix="%" />
                    </p>
                    <p className="pb-2 font-display text-xl font-bold leading-tight">
                      less per
                      <br />
                      <span className="accent-serif text-2xl text-sun">{headline.unitNoun}</span>
                    </p>
                  </div>
                  <p className="mt-4 max-w-sm text-cream/75">
                    The {headline.big.name} works out at <strong className="font-semibold text-cream">{formatPrice(headline.big.perUnit)}</strong> a
                    tube, against <strong className="font-semibold text-cream">{formatPrice(headline.small.perUnit)}</strong> for our cheapest single
                    tube.
                  </p>
                  <div aria-hidden className="absolute -right-6 -top-6 size-28 rotate-12 rounded-full bg-cream shadow-lift sm:size-32">
                    <Image src={headline.big.image} alt="" fill sizes="128px" className="product-cutout object-contain p-5" />
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <Reveal y={24}>
            <div className="overflow-hidden rounded-4xl border border-cream/10 bg-ink-deep/50 backdrop-blur-sm">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Price per 60g tube for every Nice Smile option on Amazon, cheapest per tube first. Prices checked{" "}
                  {formatDate(site.catalogCheckedAt)}.
                </caption>
                <thead>
                  <tr className="border-b border-cream/10 text-xs uppercase tracking-[0.14em] text-cream/70">
                    <th scope="col" className="px-4 py-4 font-semibold sm:px-6">
                      Option
                    </th>
                    <th scope="col" className="hidden px-3 py-4 text-right font-semibold sm:table-cell">
                      Tubes
                    </th>
                    <th scope="col" className="hidden px-3 py-4 text-right font-semibold sm:table-cell">
                      Price
                    </th>
                    <th scope="col" className="w-[42%] px-4 py-4 font-semibold sm:w-[34%] sm:px-6">
                      Per tube <span className="normal-case tracking-normal text-cream/70">(lower is better)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const best = i === 0;
                    const label = r.product.variants.length > 1 ? r.variant.label : `${r.variant.units} × 60g`;
                    return (
                      <tr
                        key={r.variant.asin}
                        className={cn(
                          "group border-b border-cream/[0.07] transition-colors duration-300 last:border-0 hover:bg-cream/[0.06]",
                          best && "bg-sun/[0.07]",
                        )}
                      >
                        <th scope="row" className="px-4 py-4 text-left font-normal sm:px-6">
                          <div className="flex items-center gap-3">
                            <span className="relative hidden size-11 shrink-0 overflow-hidden rounded-xl bg-cream sm:block">
                              <Image src={r.variant.image} alt="" fill sizes="44px" className="product-cutout object-contain p-1" />
                            </span>
                            <span className="min-w-0">
                              <Link
                                href={`/shop/${r.product.slug}`}
                                className="relative font-display text-[0.95rem] font-semibold leading-snug text-cream after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-sun after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100 sm:text-base"
                              >
                                {shortName(r.product)}
                              </Link>
                              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-cream/70">
                                {label}
                                <span className="sm:hidden">· {formatPrice(r.variant.price as number)}</span>
                                {best && (
                                  <span className="rounded-full bg-sun px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-deep">
                                    Best value
                                  </span>
                                )}
                              </span>
                            </span>
                          </div>
                        </th>
                        <td className="hidden px-3 py-4 text-right tabular-nums text-cream/80 sm:table-cell">{r.variant.units}</td>
                        <td className="hidden px-3 py-4 text-right tabular-nums text-cream/80 sm:table-cell">
                          {formatPrice(r.variant.price as number)}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <span className={cn("font-display text-lg font-bold tabular-nums", best ? "text-sun" : "text-cream")}>
                                {formatPrice(r.perUnit)}
                              </span>
                              <ScrollBar
                                value={r.perUnit / max}
                                className="mt-1.5 h-1.5 bg-cream/10"
                                barClassName={best ? "bg-sun" : "bg-cream/50 group-hover:bg-cream/80 transition-colors duration-300"}
                              />
                            </div>
                            <AmazonLink
                              href={amazon.product(r.variant.asin)}
                              placement="shop-value-table"
                              asin={r.variant.asin}
                              aria-label={`Buy ${r.product.name}, ${r.variant.label}, on Amazon (opens in a new tab)`}
                              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-cream/15 text-cream transition-all duration-300 hover:-translate-y-0.5 hover:border-sun hover:bg-sun hover:text-ink-deep"
                            >
                              <ArrowUpRight aria-hidden className="size-4" />
                            </AmazonLink>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
          <p className="mt-5 px-2 text-sm text-cream/70">
            Prices checked {formatDate(site.catalogCheckedAt)}; Amazon shows the live price. Per-tube figures are the pack price divided by the number
            of 60g tubes.
          </p>
        </div>
      </div>
    </section>
  );
}
