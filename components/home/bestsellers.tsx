import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { ProductCard } from "@/components/product/product-card";
import { AmazonLink } from "@/components/ui/amazon-link";
import type { Product } from "@/lib/products";
import { HorizontalPin } from "./horizontal-pin";

/** The most-rated in-stock products as a sideways shelf (pinned on desktop). */
export function Bestsellers({ items, storeHref, priceNote }: { items: Product[]; storeHref: string; priceNote: string }) {
  const header = (
    <div className="container-x flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Reveal y={12}>
          <span className="eyebrow inline-flex items-center gap-2 text-ink-soft">
            <span aria-hidden className="size-1.5 rounded-full bg-sun-deep" />
            Bestsellers
          </span>
        </Reveal>
        <SplitHeading
          text="Amazon *favourites*, ranked."
          className="type-display mt-4 max-w-[16ch] text-[clamp(2.4rem,4.6vw,4.4rem)] text-ink"
          accentClassName="text-ink-soft"
        />
      </div>
      <Reveal delay={0.15} className="flex flex-col gap-4 lg:items-end lg:text-right">
        <p className="max-w-[40ch] text-ink-muted">Ranked by how many Amazon ratings each product has. {priceNote}</p>
        <Link
          href="/shop"
          className="group inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition-[background-color,translate] duration-300 hover:-translate-y-0.5 hover:bg-ink-deep"
        >
          View all products
          <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </div>
  );

  return (
    <section className="relative bg-paper">
      <HorizontalPin header={header} label="Bestselling products">
        {items.map((p, i) => (
          <li key={p.slug} className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-[320px] lg:w-[clamp(270px,33vh,330px)] lg:max-w-none">
            <ProductCard product={p} placement="home-bestsellers" priority={false} className="h-full" />
            <span className="sr-only">Number {i + 1} by Amazon ratings</span>
          </li>
        ))}
        <li className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-[320px] lg:w-[clamp(270px,33vh,330px)] lg:max-w-none">
          <AmazonLink
            href={storeHref}
            placement="home-bestsellers-end"
            className="group relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-4xl bg-ink p-7 text-cream transition-[translate,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-lift"
          >
            <span
              aria-hidden
              className="absolute -right-16 -top-16 size-56 rounded-full bg-sun/15 transition-transform duration-700 group-hover:scale-150"
            />
            <span className="eyebrow relative text-sun">The full range</span>
            <span className="relative">
              <span className="type-display block text-[clamp(2.2rem,3vw,3rem)]">
                Every bundle, <span className="accent-serif text-sun">one store.</span>
              </span>
              <span className="mt-4 block text-cream/80">Browse the whole PoundMart range in our official Amazon store.</span>
            </span>
            <span className="relative inline-flex w-fit items-center gap-2 rounded-full bg-sun px-5 py-3 text-sm font-bold text-ink-deep transition-[gap] duration-300 group-hover:gap-3">
              Visit the store
              <ArrowUpRight aria-hidden className="size-4" />
              <span className="sr-only"> (opens Amazon in a new tab)</span>
            </span>
          </AmazonLink>
        </li>
      </HorizontalPin>
    </section>
  );
}
