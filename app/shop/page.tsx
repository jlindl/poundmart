import type { Metadata } from "next";
import { Suspense } from "react";
import { CountUp } from "@/components/motion/count-up";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { CollectionRail } from "@/components/shop/collection-rail";
import { CtaBand } from "@/components/shop/cta-band";
import { PackshotStage } from "@/components/shop/packshot-stage";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { ShopGridFallback } from "@/components/shop/shop-grid-fallback";
import { ValueTable } from "@/components/shop/value-table";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  flavourCount,
  inStockFirst,
  itemListJsonLd,
  ratingsCount,
  toShopItem,
  type Crumb,
} from "@/components/shop/shop-data";
import { isInStock, products } from "@/lib/products";
import { amazon, site } from "@/lib/site";
import { formatDate, seoTitle } from "@/lib/utils";

const title = "Shop Toothpaste & Haircare Bundles";
const description =
  "Browse every PoundMart bundle: Nice Smile flavoured toothpaste and XHC haircare multi-packs. Compare the price per tube, then buy on Amazon.";

export const metadata: Metadata = {
  title: seoTitle(title),
  description,
  alternates: { canonical: "/shop" },
  openGraph: {
    type: "website",
    url: "/shop",
    title: `${title} | ${site.name}`,
    description,
    images: [{ url: "/products/B0HBXLVW4S/g1.jpg", width: 666, height: 1000, alt: "Nice Smile 12 Pack Toothpaste Bundle" }],
  },
  twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description, images: ["/products/B0HBXLVW4S/g1.jpg"] },
};

const crumbs: Crumb[] = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
];

export default function ShopPage() {
  const items = products.map(toShopItem);
  const cards = Object.fromEntries(products.map((p) => [p.slug, <ProductCard key={p.slug} product={p} placement="shop-grid" />]));
  const inStock = products.filter(isInStock).length;

  const stats = [
    { value: inStock, label: "bundles and essentials in stock" },
    { value: flavourCount(), label: "flavours and scents to choose from" },
    { value: ratingsCount(), label: "Amazon ratings across our listings" },
  ];

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url: absoluteUrl("/shop"),
            isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
            mainEntity: itemListJsonLd(inStockFirst(products), "PoundMart products"),
          },
          breadcrumbJsonLd(crumbs),
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-cream pb-20 pt-[calc(var(--header-h)+2rem)] lg:pb-28">
        <div aria-hidden className="dot-grid absolute inset-0 [mask-image:radial-gradient(70%_60%_at_70%_30%,black,transparent)]" />
        <div aria-hidden className="absolute -right-40 -top-40 size-[40rem] rounded-full bg-sun/25 blur-3xl" />
        <div className="container-x relative">
          <Reveal y={10}>
            <Breadcrumbs items={crumbs} />
          </Reveal>
          <div className="mt-8 grid items-center gap-14 lg:mt-10 grid-cols-1 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Reveal y={12}>
                <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper/70 px-3.5 py-1.5 text-ink-soft backdrop-blur">
                  <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-sun-deep" />
                  The whole range, in one place
                </span>
              </Reveal>
              <SplitHeading
                as="h1"
                immediate
                delay={0.1}
                text="Shop the *whole* bundle bin."
                className="type-display mt-6 max-w-[11ch] text-[clamp(3.3rem,9vw,8.75rem)] text-ink"
                accentClassName="text-ink-soft"
              />
              <Reveal delay={0.45} y={16}>
                <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-ink-muted sm:text-xl">
                  Flavoured Nice Smile toothpaste and XHC haircare, packed into multi-packs that cost less per tube, bottle and bar. Compare
                  everything here, then check out on Amazon.
                </p>
              </Reveal>
              <Reveal delay={0.55} y={16}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Magnetic>
                    <AmazonButton href={amazon.store("shopAll")} placement="shop-hero" size="xl" className="max-sm:h-14 max-sm:gap-2 max-sm:px-6 max-sm:text-base">
                      Shop the Amazon store
                    </AmazonButton>
                  </Magnetic>
                  <ButtonLink href="#range" variant="outline" size="xl" className="max-sm:h-14 max-sm:gap-2 max-sm:px-6 max-sm:text-base">
                    Compare the range
                  </ButtonLink>
                </div>
              </Reveal>

              <Reveal delay={0.7} y={16}>
                <dl className="mt-12 grid max-w-2xl grid-cols-3 divide-x divide-ink/10 border-y border-ink/10">
                  {stats.map((s) => (
                    <div key={s.label} className="flex flex-col-reverse gap-1 px-3 py-5 first:pl-0 sm:px-6">
                      <dt className="text-xs leading-snug text-ink-muted sm:text-sm">{s.label}</dt>
                      <dd className="type-display text-[clamp(2rem,5vw,3.5rem)] leading-none text-ink">
                        <CountUp to={s.value} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <PackshotStage
                hero={{
                  src: "/products/B0HBXLVW4S/g1.jpg",
                  alt: "Nice Smile 12 Pack: twelve tubes of flavoured toothpaste",
                  width: 666,
                  height: 1000,
                  cutout: true,
                }}
                supporting={[
                  { src: "/products/B0G3BS11B8/g1.jpg", alt: "XHC No Rinse Conditioner 3 Pack", width: 1000, height: 918, cutout: true },
                  {
                    src: "/products/B0GBMH1N54/a8.png",
                    alt: "Woman with glossy curls beside XHC Argan Oil conditioner",
                    width: 900,
                    height: 900,
                    cutout: false,
                  },
                  {
                    src: "/products/B0H9YX3DG3/g1.jpg",
                    alt: "XHC 2-in-1 shampoo and conditioner bars, 6 pack",
                    width: 1000,
                    height: 711,
                    cutout: true,
                  },
                ]}
                stickers={["Sold by PoundMart", "Dispatched by Amazon", "Genuine brands"]}
                soft="#FFF3B8"
                accent="#E6B800"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section aria-label="Collections" className="border-y border-line bg-paper py-14 lg:py-16">
        <div className="container-x">
          <Reveal y={12}>
            <p className="eyebrow mb-6 flex items-center gap-2 text-ink-soft">
              <span aria-hidden className="size-1.5 rounded-full bg-sun-deep" />
              Jump to a collection
            </p>
          </Reveal>
          <CollectionRail />
        </div>
      </section>

      {/* Filterable grid */}
      <section id="range" className="scroll-mt-24 bg-cream py-20 lg:py-28">
        <div className="container-x">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:mb-12 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Every product"
              title="Every bundle, *side by side*."
              intro="Filter by category, product type or bundles only, and sort by what matters to you. Ratings are Amazon customer ratings."
            />
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted lg:text-right">
              Prices checked {formatDate(site.catalogCheckedAt)}; Amazon shows the live price.
            </p>
          </div>
          <Suspense fallback={<ShopGridFallback items={items} cards={cards} />}>
            <ShopBrowser items={items} cards={cards} />
          </Suspense>
        </div>
      </section>

      <ValueTable />

      <CtaBand
        eyebrow="The PoundMart store"
        title="Found your *favourite*? It's one tap away."
        body="Everything on this page is waiting in the PoundMart store on Amazon. Genuine brands, packaged and quality-checked by PoundMart, dispatched by Amazon."
        primary={{ href: amazon.store(), placement: "shop-closing", label: "Visit the store" }}
        secondary={{ href: "/collections/bundles", label: "See the value bundles" }}
      />
    </>
  );
}
