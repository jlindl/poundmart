import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stars } from "@/components/ui/stars";
import { ArrivalsTimeline } from "@/components/shop/arrivals-timeline";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { BundleSavings } from "@/components/shop/bundle-savings";
import { CollectionRail } from "@/components/shop/collection-rail";
import { CtaBand } from "@/components/shop/cta-band";
import { FlavourGuide } from "@/components/shop/flavour-guide";
import { GRID_CLASS } from "@/components/shop/filters";
import { HairFinder } from "@/components/shop/hair-finder";
import { ImageMosaic } from "@/components/shop/image-mosaic";
import { PackshotStage } from "@/components/shop/packshot-stage";
import { imageSize } from "@/components/shop/product-media";
import { RelatedPosts } from "@/components/shop/related-posts";
import {
  absoluteUrl,
  arrivals,
  breadcrumbJsonLd,
  flavourTiles,
  getCollectionArt,
  hairFinderPicks,
  inStockFirst,
  itemListJsonLd,
  ratingsCount,
  savingsRows,
  weightedRating,
  type Crumb,
} from "@/components/shop/shop-data";
import { featuredPosts, getAllPosts, postsInCategory, type Post } from "@/lib/blog";
import { collections, getCollection, isInStock, productsIn, type Collection } from "@/lib/products";
import { amazon, site } from "@/lib/site";
import { formatDate, seoTitle } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const c = getCollection(slug);
  if (!c) return {};
  const size = imageSize(c.image) ?? { width: 1000, height: 1000 };
  const url = `/collections/${c.slug}`;
  return {
    title: seoTitle(c.seoTitle),
    description: c.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${c.seoTitle} | ${site.name}`,
      description: c.seoDescription,
      images: [{ url: c.image, width: size.width, height: size.height, alt: `${c.title} from PoundMart` }],
    },
    twitter: { card: "summary_large_image", title: `${c.seoTitle} | ${site.name}`, description: c.seoDescription, images: [c.image] },
  };
}

function shopLink(c: Collection) {
  if (c.slug === "toothpaste" || c.slug === "haircare") return `/shop?category=${c.slug}#range`;
  if (c.slug === "bundles") return "/shop?bundles=1#range";
  return "/shop#range";
}

function collectionPosts(category: string): Post[] {
  const base = category === "latest" ? getAllPosts() : postsInCategory(category);
  const picked = base.slice(0, 3);
  if (picked.length < 3) {
    for (const p of featuredPosts(8)) {
      if (picked.length >= 3) break;
      if (!picked.some((x) => x.slug === p.slug)) picked.push(p);
    }
  }
  return picked;
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const c = getCollection(slug);
  if (!c) notFound();
  const art = getCollectionArt(c);
  const list = inStockFirst(productsIn(c));
  const live = list.filter(isInStock);
  const avg = weightedRating(live);
  const ratings = ratingsCount(live);

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: c.title, href: `/collections/${c.slug}` },
  ];

  const posts = collectionPosts(art.blogCategory);
  const hl = { ["--hl" as string]: `color-mix(in srgb, ${c.accent} 55%, transparent)` } as CSSProperties;

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: c.seoTitle,
            headline: c.title,
            description: c.seoDescription,
            url: absoluteUrl(`/collections/${c.slug}`),
            image: absoluteUrl(c.image),
            isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
            mainEntity: itemListJsonLd(list, `${c.title} from ${site.name}`),
          },
          breadcrumbJsonLd(crumbs),
        ]}
      />

      {/* Hero */}
      <section
        className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+2rem)] lg:pb-24"
        style={{ ...hl, background: `linear-gradient(180deg, ${art.soft} 0%, ${art.soft} 45%, var(--color-cream) 100%)` }}
      >
        <div aria-hidden className="dot-grid absolute inset-0 [mask-image:radial-gradient(60%_55%_at_25%_35%,black,transparent)]" />
        <div aria-hidden className="absolute -right-32 top-24 size-[34rem] rounded-full opacity-30 blur-3xl" style={{ background: c.accent }} />
        <div className="container-x relative">
          <Reveal y={10}>
            <Breadcrumbs items={crumbs} />
          </Reveal>
          <div className="mt-8 grid items-center gap-12 lg:mt-10 grid-cols-1 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Reveal y={12}>
                <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-paper/80 px-3.5 py-1.5 text-ink shadow-soft backdrop-blur">
                  <span aria-hidden className="size-2 rounded-full" style={{ background: c.accent }} />
                  {c.eyebrow}
                </span>
              </Reveal>
              <SplitHeading
                as="h1"
                immediate
                delay={0.1}
                text={c.headline}
                className="type-display mt-6 max-w-[13ch] text-[clamp(3rem,7.4vw,7.25rem)] text-ink"
                accentClassName="bg-[linear-gradient(transparent_58%,var(--hl)_58%,var(--hl)_92%,transparent_92%)] px-[0.06em] text-ink"
              />
              <Reveal delay={0.4} y={16}>
                <p className="mt-7 max-w-[54ch] text-lg leading-relaxed text-ink-muted sm:text-xl">{c.description}</p>
              </Reveal>
              <Reveal delay={0.5} y={16}>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
                  <span className="font-semibold text-ink">
                    {live.length} {live.length === 1 ? "product" : "products"} in stock
                  </span>
                  {avg !== null && ratings > 0 && (
                    <span className="inline-flex items-center gap-2">
                      <Stars rating={Math.round(avg * 10) / 10} size={15} />
                      <span>
                        <span className="font-semibold text-ink">{avg.toFixed(1)}</span> average from {ratings.toLocaleString("en-GB")} Amazon ratings
                      </span>
                    </span>
                  )}
                </div>
              </Reveal>
              <Reveal delay={0.6} y={16}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Magnetic>
                    <AmazonButton href={amazon.store(c.amazonPage)} placement={`collection-${c.slug}-hero`} size="xl" className="max-sm:h-14 max-sm:gap-2 max-sm:px-6 max-sm:text-base">
                      <span className="sm:hidden">Shop on Amazon</span>
                      <span className="hidden sm:inline">Shop {c.title.toLowerCase()} on Amazon</span>
                    </AmazonButton>
                  </Magnetic>
                  <ButtonLink href="#range" variant="outline" size="xl" className="max-sm:h-14 max-sm:gap-2 max-sm:px-6 max-sm:text-base">
                    See the range
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-5">
              <PackshotStage hero={art.hero} supporting={art.supporting} stickers={art.stickers} soft="#FFFFFF" accent={c.accent} />
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="border-y border-ink/10 bg-ink py-5 text-cream">
        <Marquee duration={34}>
          {art.ticker.map((w) => (
            <span key={w} className="flex items-center gap-8 px-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {w}
              <span aria-hidden style={{ color: c.slug === "haircare" ? "#FCD000" : c.accent }} className="text-xl">
                ✦
              </span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* The range */}
      <section id="range" className="scroll-mt-24 bg-cream py-24 lg:py-32">
        <div className="container-x">
          <div className="mb-12 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
            <SectionHeading eyebrow={art.gridEyebrow} title={art.gridTitle} intro={art.gridIntro} />
            <Reveal delay={0.2} y={12} className="flex flex-col gap-3 lg:items-end">
              <ButtonLink href={shopLink(c)} variant="ghost" size="md" className="border border-line bg-paper">
                Filter and compare in the shop
              </ButtonLink>
              <p className="text-sm text-ink-muted lg:text-right">Star ratings are Amazon customer ratings. Prices checked {formatDate(site.catalogCheckedAt)}; Amazon shows the live price.</p>
            </Reveal>
          </div>
          <RevealGroup as="ul" className={GRID_CLASS} stagger={0.07}>
            {list.map((p) => (
              <RevealItem as="li" key={p.slug} className="h-full">
                <ProductCard product={p} placement={`collection-${c.slug}-grid`} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Collection-specific editorial */}
      {c.slug === "toothpaste" && (
        <section className="overflow-x-clip bg-paper py-24 lg:py-36">
          <div className="container-x">
            <SectionHeading
              eyebrow="The flavour guide"
              title="Six flavours. *Zero* boring brushing."
              intro="Hover or tap a flavour to meet it, then jump straight to the packs it comes in."
              className="mb-12 lg:mb-16"
            />
            <FlavourGuide tiles={flavourTiles()} />
          </div>
        </section>
      )}

      {c.slug === "haircare" && (
        <section className="grain relative overflow-hidden bg-ink py-24 text-cream lg:py-36">
          <div aria-hidden className="absolute -left-40 top-0 size-[36rem] rounded-full bg-argan/30 blur-3xl" />
          <div className="container-x relative z-[2]">
            <SectionHeading
              eyebrow="The XHC finder"
              title="Which XHC is right for *your* hair?"
              intro="Tell us what your hair needs and we'll point you to the bundle that fits, using what each Amazon listing says it's for."
              tone="light"
              className="mb-12 lg:mb-16"
            />
            <HairFinder picks={hairFinderPicks()} />
          </div>
        </section>
      )}

      {c.slug === "bundles" && (
        <section className="grain relative overflow-hidden bg-ink py-24 text-cream lg:py-36">
          <div aria-hidden className="absolute -right-40 top-10 size-[36rem] rounded-full bg-sun/15 blur-3xl" />
          <div className="container-x relative z-[2]">
            <SectionHeading
              eyebrow="Bundle maths"
              title="Same favourites, *smaller* price per unit."
              intro="Each bundle against the smaller option on Amazon, per tube, bottle or bar. The bars fill as you scroll: shorter means better value."
              tone="light"
              className="mb-12 lg:mb-16"
            />
            <BundleSavings rows={savingsRows()} />
            <p className="mt-6 text-sm text-cream/70">
              Prices checked {formatDate(site.catalogCheckedAt)}; Amazon shows the live price. Savings are the difference in price per unit between
              the two options.
            </p>
          </div>
        </section>
      )}

      {c.slug === "new-arrivals" && (
        <section className="overflow-x-clip bg-paper py-24 lg:py-36">
          <div className="container-x">
            <SectionHeading
              eyebrow="Just landed"
              title="The newest drops, *newest* first."
              intro="Our most recent listings on Amazon, starting with the latest arrival."
              className="mb-14 lg:mb-20"
            />
            <ArrivalsTimeline items={arrivals(productsIn(c))} />
          </div>
        </section>
      )}

      {/* Mood */}
      <ImageMosaic eyebrow={c.eyebrow} title={art.moodTitle} body={art.moodBody} pics={art.mosaic} className="bg-cream">
        <AmazonButton href={amazon.store(c.amazonPage)} placement={`collection-${c.slug}-mosaic`} variant="ink" size="lg">
          Browse on Amazon
        </AmazonButton>
      </ImageMosaic>

      <RelatedPosts
        posts={posts}
        title={art.blogTitle}
        intro="Straight-talking guides from the PoundMart team, written to help you choose and use."
        viewAll={
          art.blogCategory === "latest"
            ? { href: "/blog", label: "All guides" }
            : { href: `/blog/category/${art.blogCategory}`, label: "More guides" }
        }
        className="border-t border-line bg-paper"
      />

      {/* Keep browsing */}
      <section className="bg-cream pb-8 pt-24 lg:pt-32">
        <div className="container-x">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Keep browsing" title="More *bundles* this way." />
            <Reveal y={12}>
              <ButtonLink href="/shop" variant="outline" size="md">
                Shop everything
              </ButtonLink>
            </Reveal>
          </div>
          <CollectionRail exclude={c.slug} />
          <Reveal y={12} className="mt-8">
            <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              Looking for something specific?
              <Link
                href="/faq"
                className="group inline-flex items-center gap-1 font-semibold text-ink underline decoration-sun decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
              >
                Read the FAQs
                <ArrowRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand
        eyebrow={`${c.title} on Amazon`}
        title={art.ctaTitle}
        body={art.ctaBody}
        primary={{ href: amazon.store(c.amazonPage), placement: `collection-${c.slug}`, label: `Shop ${c.title.toLowerCase()}` }}
        secondary={{ href: "/shop", label: "Browse the full range" }}
        image={art.ctaImage}
        className="bg-cream"
      />
    </>
  );
}
