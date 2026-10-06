import Link from "next/link";
import { ArrowRight, BookOpen, Home, ShoppingBasket } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ProductCard } from "@/components/product/product-card";
import { LostBundle } from "@/components/about/lost-bundle";
import { amazon, site } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { getProduct, isInStock, products, type Product } from "@/lib/products";

const PICKS = ["nice-smile-12-pack-toothpaste-bundle", "nice-smile-3-pack-berry-gummy-candy", "xhc-shampoo-conditioner-bars"];

function suggestions(): Product[] {
  const picked = PICKS.map(getProduct).filter((p): p is Product => Boolean(p && isInStock(p)));
  const extras = products.filter((p) => p.isBundle && isInStock(p) && !picked.includes(p));
  return [...picked, ...extras].slice(0, 3);
}

const routes = [
  { href: "/", label: "Back to home", text: "Start again from the front door", icon: Home },
  { href: "/shop", label: "Shop the bundles", text: "Every PoundMart multi-pack", icon: ShoppingBasket },
  { href: "/blog", label: "Read the blog", text: "Guides, routines and savings", icon: BookOpen },
];

export default function NotFound() {
  const picks = suggestions();

  return (
    <>
      <section aria-label="Page not found" className="relative overflow-x-clip bg-cream pt-[var(--header-h)]">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="container-x relative grid items-center gap-12 pb-20 pt-10 sm:pt-14 grid-cols-1 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-16">
          <div className="lg:col-span-7">
            <Reveal y={12}>
              <span className="eyebrow inline-flex items-center gap-2 text-ink-soft">
                <span aria-hidden className="size-1.5 rounded-full bg-watermelon" />
                Error 404
              </span>
            </Reveal>
            <SplitHeading
              as="h1"
              immediate
              delay={0.1}
              text="This bundle's gone *walkabout*."
              className="type-display mt-6 max-w-[16ch] text-[clamp(2.8rem,6vw,6rem)] text-ink"
              accentClassName="text-ink-soft"
            />
            <Reveal y={20} delay={0.4}>
              <p className="mt-7 max-w-[44ch] text-lg leading-relaxed text-ink-muted sm:text-xl">
                The page you&apos;re after has wandered off, but the bundles haven&apos;t. Pick a path below, or head straight to our
                Amazon store.
              </p>
            </Reveal>
            <Reveal y={20} delay={0.5} className="mt-8">
              <AmazonButton href={amazon.store()} placement="not-found">
                Shop the Amazon store
              </AmazonButton>
            </Reveal>
            <RevealGroup as="ul" delay={0.55} className="mt-10 grid gap-3 sm:grid-cols-3">
              {routes.map(({ href, label, text, icon: Icon }) => (
                <RevealItem as="li" key={href}>
                  <Link
                    href={href}
                    className="group flex h-full flex-col gap-3 rounded-3xl border border-line bg-paper p-4 transition-[transform,box-shadow,border-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-ink/20 hover:shadow-lift"
                  >
                    <span className="flex items-center justify-between">
                      <span className="grid size-10 place-items-center rounded-2xl bg-ink text-sun transition-transform duration-500 ease-spring group-hover:-rotate-12">
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <ArrowRight aria-hidden className="size-4 text-ink transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <span>
                      <span className="block font-display font-bold text-ink">{label}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-ink-muted">{text}</span>
                    </span>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <div className="lg:col-span-5">
            <LostBundle />
            <p className="mt-2 text-center text-sm text-ink-muted">Psst: those runaway tubes are draggable.</p>
          </div>
        </div>
      </section>

      {picks.length > 0 && (
        <section aria-labelledby="not-found-picks" className="bg-paper py-20 sm:py-28">
          <div className="container-x">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-ink-soft">While you&apos;re here</p>
                <h2 id="not-found-picks" className="type-display mt-3 text-[clamp(2.2rem,4.6vw,3.8rem)] text-ink">
                  Bundles worth <span className="accent-serif text-ink-soft">finding</span>.
                </h2>
              </div>
              <Link href="/shop" className="group inline-flex items-center gap-2 font-semibold text-ink">
                <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-sun-deep after:transition-transform after:duration-300 group-hover:after:origin-left group-hover:after:scale-x-100">
                  See every bundle
                </span>
                <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map((p) => (
                <RevealItem key={p.slug} className="h-full">
                  <ProductCard product={p} placement="not-found-suggestion" />
                </RevealItem>
              ))}
            </RevealGroup>
            <p className="mt-8 text-xs text-ink-muted">
              Star ratings are Amazon customer ratings. Prices checked {formatDate(site.catalogCheckedAt)}; Amazon shows the live price.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
