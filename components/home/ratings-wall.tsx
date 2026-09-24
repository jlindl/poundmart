import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AmazonButton, AmazonLink } from "@/components/ui/amazon-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stars } from "@/components/ui/stars";

type Tile = {
  slug: string;
  name: string;
  brand: string;
  image: string;
  accentSoft: string;
  rating: number;
  count: number;
  asin: string;
  reviewsHref: string;
};

/** Amazon star ratings per product (no quotes, no invented reviews). Each tile opens that product's reviews on Amazon. */
export function RatingsWall({ tiles, average, total, storeHref }: { tiles: Tile[]; average: number; total: number; storeHref: string }) {
  return (
    <section className="relative bg-paper py-24 md:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading
          eyebrow="Rated on Amazon"
          title="Don't take *our* word for it."
          intro="Every star on this wall comes from Amazon shoppers, not from us. Tap any product to read its reviews on Amazon."
        />

        <RevealGroup
          as="ul"
          stagger={0.05}
          className="mt-14 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4"
        >
          <RevealItem as="li" className="min-[420px]:col-span-2 lg:row-span-2">
            <div className="grain relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-4xl bg-ink p-7 text-cream sm:p-9">
              <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-sun/15" />
              <span className="eyebrow relative z-[2] text-sun">Across the range</span>
              <div className="relative z-[2]">
                <p className="flex items-end gap-3">
                  <span className="type-display text-[clamp(5rem,9vw,8rem)] tabular-nums">
                    <CountUp to={average} decimals={1} />
                  </span>
                  <span className="accent-serif mb-[0.6em] text-3xl text-sun">out of 5</span>
                </p>
                <Stars rating={average} size={22} className="mt-1" />
                <p className="mt-4 max-w-[34ch] text-cream/80">
                  Average Amazon star rating, weighted across {total.toLocaleString("en-GB")} ratings on {tiles.length} products.
                </p>
              </div>
              <div className="relative z-[2] mt-8">
                <AmazonButton href={storeHref} placement="home-ratings-summary" size="md" className="focus-visible:outline-sun">
                  Shop the rated range
                </AmazonButton>
              </div>
            </div>
          </RevealItem>

          {tiles.map((t) => (
            <RevealItem as="li" key={t.slug}>
              <AmazonLink
                href={t.reviewsHref}
                placement="home-ratings"
                asin={t.asin}
                className="group relative flex h-full min-h-[190px] cursor-pointer flex-col gap-4 rounded-4xl border border-line bg-cream p-5 transition-[translate,background-color,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-ink/15 hover:bg-paper hover:shadow-lift"
              >
                <span className="flex items-start gap-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl" style={{ background: t.accentSoft }}>
                    <Image
                      src={t.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="product-cutout object-contain p-1.5 transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-110"
                    />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="eyebrow text-[10px] text-ink-soft">{t.brand}</span>
                    <span className="line-clamp-3 text-sm font-semibold leading-snug text-ink">{t.name}</span>
                  </span>
                </span>
                <span className="mt-auto flex items-end justify-between gap-3">
                  <span className="flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-3xl font-bold tabular-nums tracking-tight text-ink">{t.rating.toFixed(1)}</span>
                      <Stars rating={t.rating} size={14} />
                    </span>
                    <span className="text-xs text-ink-soft">
                      {t.count.toLocaleString("en-GB")} Amazon {t.count === 1 ? "rating" : "ratings"}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-colors duration-300 group-hover:border-sun group-hover:bg-sun"
                  >
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </span>
                <span className="sr-only"> Read reviews on Amazon (opens in a new tab)</span>
              </AmazonLink>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
