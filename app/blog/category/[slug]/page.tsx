import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductCard } from "@/components/product/product-card";
import { PostCard } from "@/components/blog/post-card";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/blog/breadcrumbs";
import { CategoryPills } from "@/components/blog/category-pills";
import { HeroCollage } from "@/components/blog/hero-collage";
import { ScrollClipReveal } from "@/components/blog/scroll-effects";
import { ArchiveList } from "@/components/blog/archive-list";
import { BacklinkBand } from "@/components/blog/backlink-band";
import { PRICE_NOTE } from "@/components/blog/article-parts";
import { getCategoryArt } from "@/components/blog/category-art";
import { productsForCategory } from "@/components/blog/blog-utils";
import { blogCategories, getCategory, postsInCategory } from "@/lib/blog";
import { amazon, site } from "@/lib/site";
import { cn, formatDate } from "@/lib/utils";

/** Guides shown as cards before the rest drop into the compact archive list. */
const GRID_LIMIT = 12;

export const dynamicParams = false;

export function generateStaticParams() {
  return blogCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/category/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = getCategory(slug);
  if (!category) return { title: "Category not found", robots: { index: false } };
  const art = getCategoryArt(slug);
  const title = `${category.name} Guides and Tips`;
  const description = `${category.description} Practical guides from the PoundMart blog.`;
  const path = `/blog/category/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: path, types: { "application/rss+xml": "/blog/rss.xml" } },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.name,
      locale: site.locale,
      title: `${title} | ${site.name}`,
      description,
      images: [{ url: art.cover.src, alt: art.cover.alt }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description, images: [art.cover.src] },
  };
}

export default async function BlogCategoryPage(props: PageProps<"/blog/category/[slug]">) {
  const { slug } = await props.params;
  const category = getCategory(slug);
  if (!category) notFound();

  const art = getCategoryArt(slug);
  const posts = postsInCategory(slug);
  const [lead, ...rest] = posts;
  const gridPosts = rest.slice(0, GRID_LIMIT);
  const olderPosts = rest.slice(GRID_LIMIT).map((p) => ({
    slug: p.slug,
    title: p.title,
    dateLabel: formatDate(p.date, { day: "numeric", month: "short", year: "numeric" }),
    readMinutes: p.readMinutes,
  }));
  const picks = productsForCategory(slug, 4);
  const others = blogCategories.filter((c) => c.slug !== slug);
  const pills = blogCategories.map((c) => ({
    label: c.name,
    href: `/blog/category/${c.slug}`,
    accent: c.accent,
    count: postsInCategory(c.slug).length,
    active: c.slug === slug,
  }));
  const trail = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: category.name, href: `/blog/category/${slug}` },
  ];
  const lowerName = category.name.toLowerCase();

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${category.name} guides`,
            description: category.description,
            url: `${site.url}/blog/category/${slug}`,
            inLanguage: "en-GB",
            isPartOf: { "@id": `${site.url}/blog#blog` },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: posts.length,
              itemListElement: posts.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${site.url}/blog/${p.slug}`,
                name: p.title,
              })),
            },
          },
          breadcrumbJsonLd(trail),
        ]}
      />

      {/* Hero, tinted with the category colour */}
      <section
        className="relative overflow-hidden pb-20 pt-[calc(var(--header-h)_+_2.5rem)] sm:pb-28 lg:pt-[calc(var(--header-h)_+_3.5rem)]"
        style={{ background: `color-mix(in oklab, ${category.accent} 15%, var(--color-cream))` }}
      >
        <div aria-hidden className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_15%_20%,black,transparent_65%)]" />
        <div aria-hidden className="absolute -right-40 -top-32 size-[40rem] rounded-full opacity-40 blur-3xl" style={{ background: category.accent }} />
        <div aria-hidden className="absolute -bottom-40 -left-20 size-[26rem] rounded-full bg-white/60 blur-3xl" />

        <div className="container-x relative grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal y={10}>
              <Breadcrumbs items={trail} />
            </Reveal>
            <Reveal y={12} delay={0.05}>
              <p className="eyebrow mt-8 inline-flex items-center gap-2 text-ink-soft">
                <span aria-hidden className="size-2 rounded-full ring-2 ring-white" style={{ background: category.accent }} />
                {category.name} guides
                <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] tracking-normal text-cream">
                  {posts.length} {posts.length === 1 ? "guide" : "guides"}
                </span>
              </p>
            </Reveal>
            <SplitHeading
              as="h1"
              immediate
              text={art.headline}
              delay={0.1}
              className="type-display mt-6 max-w-[13ch] text-[clamp(3rem,7.6vw,6.75rem)] text-ink"
              accentClassName="text-ink-soft"
            />
            <Reveal delay={0.35} y={16}>
              <p className="mt-7 max-w-[54ch] text-lg leading-relaxed text-ink/85">{category.description}</p>
            </Reveal>
            <Reveal delay={0.45} y={16}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Magnetic>
                  <AmazonButton href={amazon.store(art.amazonPage)} placement="blog-category-hero" size="lg">
                    {art.amazonLabel}
                  </AmazonButton>
                </Magnetic>
                <ButtonLink href={art.shopHref} variant="outline" size="lg">
                  {art.shopLabel}
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.55} y={16}>
              <CategoryPills id="blog-category-pills" pills={pills} className="mt-10" label="Other blog categories" />
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <HeroCollage tiles={art.collage} className="mx-auto aspect-[5/6] w-full max-w-[32rem]" />
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="container-x">
          {lead ? (
            <>
              <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeading
                  eyebrow={`Latest in ${category.name}`}
                  title="Fresh from *this* shelf."
                  intro={art.intro}
                />
                <Reveal delay={0.2} y={12}>
                  <ButtonLink href="/blog" variant="outline" size="md">
                    All guides
                  </ButtonLink>
                </Reveal>
              </div>
              <ScrollClipReveal>
                <PostCard post={lead} variant="feature" />
              </ScrollClipReveal>
              {gridPosts.length > 0 && (
                <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-7">
                  {gridPosts.map((p) => (
                    <RevealItem key={p.slug} className="grid">
                      <PostCard post={p} className="h-full" />
                    </RevealItem>
                  ))}
                </RevealGroup>
              )}
              {olderPosts.length > 0 && (
                <div className="mt-16">
                  <h2 className="eyebrow mb-5 flex items-center gap-2 text-ink-soft">
                    <span aria-hidden className="size-1.5 rounded-full bg-sun-deep" />
                    Older {lowerName} guides
                  </h2>
                  <ArchiveList items={olderPosts} accent={category.accent} />
                </div>
              )}
            </>
          ) : (
            <div className="relative overflow-hidden rounded-5xl border border-dashed border-ink/20 bg-paper px-6 py-20 text-center">
              <div aria-hidden className="dot-grid absolute inset-0 opacity-40" />
              <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
                <Image src="/brand/mark.png" alt="" width={278} height={278} className="size-20 animate-float" />
                <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Fresh {lowerName} guides are on their way.</h2>
                <p className="text-lg text-ink-muted">In the meantime, the rest of the blog is well stocked.</p>
                <ButtonLink href="/blog" variant="ink" size="lg">
                  Read the latest guides
                </ButtonLink>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products */}
      {picks.length > 0 && (
        <section className="grain relative overflow-hidden bg-ink py-24 text-cream sm:py-32">
          <div aria-hidden className="absolute -left-32 top-0 size-[30rem] rounded-full blur-3xl" style={{ background: `${category.accent}33` }} />
          <div className="container-x relative z-[2]">
            <div className="mb-12 flex flex-col gap-8 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                tone="light"
                eyebrow="Shop the shelf"
                title="Put the advice *to work*."
                intro={<>Our best value picks for {lowerName}. Ratings are from Amazon. {PRICE_NOTE}</>}
              />
              <Reveal delay={0.2} y={12}>
                <ButtonLink href={art.shopHref} variant="light" size="lg" className="focus-visible:outline-sun">
                  {art.shopLabel}
                </ButtonLink>
              </Reveal>
            </div>
            <RevealGroup className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {picks.map((p) => (
                <RevealItem key={p.slug} className="h-full">
                  <ProductCard product={p} placement="blog-category-products" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* Other shelves */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading eyebrow="Keep browsing" title="Try another *shelf*." className="mb-12 sm:mb-16" />
          <RevealGroup className="grid gap-6 md:grid-cols-3">
            {others.map((c) => {
              const a = getCategoryArt(c.slug);
              const count = postsInCategory(c.slug).length;
              const contain = a.cover.fit === "contain";
              return (
                <RevealItem key={c.slug} className="grid">
                  <Link
                    href={`/blog/category/${c.slug}`}
                    className="group relative flex cursor-pointer flex-col overflow-hidden rounded-4xl border border-line bg-cream shadow-soft transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-lift"
                  >
                    <span className="relative block aspect-[16/10] overflow-hidden" style={{ background: a.cover.tint ?? `${c.accent}22` }}>
                      {contain && <span aria-hidden className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />}
                      <Image
                        src={a.cover.src}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 30vw, 92vw"
                        className={cn(
                          "transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover:scale-[1.06]",
                          contain ? "product-cutout object-contain p-[8%]" : "object-cover",
                        )}
                        style={a.cover.objectPosition ? { objectPosition: a.cover.objectPosition } : undefined}
                      />
                    </span>
                    <span className="flex flex-1 flex-col gap-2 p-6">
                      <span className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 font-display text-xl font-bold text-ink">
                          <span aria-hidden className="size-2.5 rounded-full" style={{ background: c.accent }} />
                          {c.name}
                        </span>
                        <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-bold tabular-nums text-ink-soft">
                          {count} {count === 1 ? "guide" : "guides"}
                        </span>
                      </span>
                      <span className="text-sm leading-relaxed text-ink-soft">{a.teaser}</span>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-ink">
                        <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-sun after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">
                          Explore {c.name}
                        </span>
                        <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      <BacklinkBand
        eyebrow="From reading to restocking"
        title="Stock up for *less*."
        text="Ready to put these guides to work? Explore PoundMart for our full range of great value bundles, browse the shop, or head straight to Amazon to stock up."
        placement="blog-category-end"
        amazonHref={amazon.store(art.amazonPage)}
        amazonLabel={art.amazonLabel}
      />
    </>
  );
}
