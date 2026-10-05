import Image from "next/image";
import Link from "next/link";
import { BookOpenText, Rss } from "lucide-react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { CountUp } from "@/components/motion/count-up";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { PostCard } from "@/components/blog/post-card";
import { HeroCollage } from "@/components/blog/hero-collage";
import { CategoryPills } from "@/components/blog/category-pills";
import { BlogFilterProvider, PostFilterGrid, TopicCloud } from "@/components/blog/post-filter";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { HorizontalRail } from "@/components/blog/horizontal-rail";
import { RailCategoryPanel, RailCtaPanel, RailIntroPanel } from "@/components/blog/category-rail-panels";
import { ScrollClipReveal, ScrollSpin } from "@/components/blog/scroll-effects";
import { GridPromo } from "@/components/blog/grid-promo";
import { BacklinkBand } from "@/components/blog/backlink-band";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/blog/breadcrumbs";
import {
  archiveIndex,
  blogPageHref,
  pageCount,
  pageSlice,
  POSTS_PER_PAGE,
  searchText,
  splitLead,
  topTopics,
} from "@/components/blog/blog-utils";
import type { BlogCategoryLite, CollageTile, FilterItem } from "@/components/blog/types";
import { blogCategories, getAllPosts, getCategory, type Post } from "@/lib/blog";
import { amazon, site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const BLOG_TITLE = "The Bundle Blog";
export const BLOG_DESCRIPTION =
  "Practical guides from PoundMart on flavoured toothpaste, kids' brushing, curly hair care, argan oil and buying everyday essentials for less.";

/** Numbers the pagination needs, shared with generateStaticParams. */
export function blogPagination() {
  const all = getAllPosts();
  const { lead, rest } = splitLead(all);
  return { all, lead, rest, totalPages: pageCount(rest.length) };
}

const heroTiles: CollageTile[] = [
  {
    src: "/products/B0GBMH1N54/a8.png",
    alt: "Model with long, glossy curls next to XHC argan oil conditioner",
    className: "left-0 top-[8%] w-[58%] aspect-[4/5]",
    sizes: "(min-width: 1024px) 22vw, 56vw",
    speed: 50,
    rotate: -3,
    objectPosition: "22% center",
    priority: true,
  },
  {
    src: "/products/B0G318R9JG/g5.jpg",
    alt: "Nice Smile toothpaste tubes on a party table with balloons and gifts",
    className: "right-0 top-0 w-[46%] aspect-square",
    sizes: "(min-width: 1024px) 18vw, 45vw",
    speed: 140,
    rotate: 4,
  },
  {
    src: "/products/B0GKYHKMRG/g5.jpg",
    alt: "XHC coconut, banana and papaya shampoo bars surrounded by tropical fruit",
    className: "right-[4%] top-[47%] w-[44%] aspect-square",
    sizes: "(min-width: 1024px) 17vw, 43vw",
    speed: 230,
    rotate: -5,
  },
  {
    src: "/products/B0GBMH1N54/a5.png",
    alt: "XHC argan oil conditioner on a wooden bath tray beside a steaming bath",
    className: "left-[10%] bottom-0 w-[40%] aspect-square",
    sizes: "(min-width: 1024px) 15vw, 40vw",
    speed: 120,
    rotate: 3,
  },
];

const marqueeLines = [
  "Brush with grape-ness",
  "Curls, sorted",
  "You're one in a melon",
  "Wash day, shortened",
  "Unit price maths, made easy",
  "Un-bear-ably fresh",
  "Stock up, spend less",
  "Hello, sweet tooth",
];

function accentFor(slug: string) {
  return getCategory(slug)?.accent ?? "#FCD000";
}

/**
 * The blog index for a given page. Page 1 is the full magazine front; later
 * pages are a lighter archive view with the same filter, topics and CTA.
 */
export function BlogIndexView({ page }: { page: number }) {
  const { all, lead, rest, totalPages } = blogPagination();
  const isFirst = page === 1;
  const pagePosts = pageSlice(rest, page);
  const categories: BlogCategoryLite[] = blogCategories.map((c) => ({
    slug: c.slug,
    name: c.name,
    accent: c.accent,
    count: all.filter((p) => p.categorySlug === c.slug).length,
  }));
  const topics = topTopics(all);
  const archive = archiveIndex(all, accentFor);
  const items: FilterItem[] = pagePosts.map((p, i) => ({
    slug: p.slug,
    categorySlug: p.categorySlug,
    search: searchText(p),
    card: <PostCard post={p} priority={!isFirst && i < 3} className="h-full w-full" />,
  }));
  const hasGrid = items.length > 0;
  const pageLabel = totalPages > 1 ? `page ${page} of ${totalPages}` : undefined;
  const pills = categories.map((c) => ({ label: c.name, href: `/blog/category/${c.slug}`, accent: c.accent, count: c.count }));
  const shownPosts: Post[] = [...(isFirst && lead ? [lead] : []), ...pagePosts];
  const trail = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    ...(isFirst ? [] : [{ label: `Page ${page}`, href: blogPageHref(page) }]),
  ];

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": `${site.url}/blog#blog`,
            name: `${BLOG_TITLE} by ${site.name}`,
            description: BLOG_DESCRIPTION,
            url: `${site.url}${blogPageHref(page)}`,
            inLanguage: "en-GB",
            publisher: {
              "@type": "Organization",
              name: site.name,
              url: site.url,
              logo: { "@type": "ImageObject", url: `${site.url}${site.logo}` },
            },
            blogPost: shownPosts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `${site.url}/blog/${p.slug}`,
              datePublished: p.date,
              dateModified: p.updated ?? p.date,
            })),
          },
          breadcrumbJsonLd(trail),
        ]}
      />

      {isFirst ? (
        <IndexHero total={all.length} latest={all[0]?.date} pills={pills} startHref={hasGrid ? "#guides" : lead ? "#featured" : "/shop"} />
      ) : (
        <ArchiveHero page={page} totalPages={totalPages} total={rest.length} pills={pills} trail={trail} />
      )}

      {isFirst && (
        <div aria-hidden className="relative z-10 -my-7 overflow-x-clip py-3">
          <div className="-ml-[5%] w-[110%] -rotate-[1.6deg] bg-sun py-4 shadow-soft">
            <Marquee duration={42} fade={false} className="font-display text-xl font-bold tracking-tight text-ink-deep sm:text-2xl">
              {marqueeLines.map((line) => (
                <span key={line} className="flex items-center gap-6 px-6">
                  {line}
                  <span className="text-base text-ink">✦</span>
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      )}

      {isFirst && lead && (
        <section id="featured" className="relative scroll-mt-28 bg-paper pb-24 pt-32 sm:pb-32 sm:pt-40">
          <div className="container-x">
            <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading eyebrow="Featured guide" title="Start *here*." intro="If you only read one guide today, make it this one." />
              <Reveal delay={0.2} y={12}>
                <Link
                  href={`/blog/category/${lead.categorySlug}`}
                  className="group inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink"
                >
                  <span aria-hidden className="size-2.5 rounded-full" style={{ background: accentFor(lead.categorySlug) }} />
                  <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-sun after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">
                    More {lead.category} guides
                  </span>
                </Link>
              </Reveal>
            </div>
            <ScrollClipReveal>
              <PostCard post={lead} variant="feature" />
            </ScrollClipReveal>
          </div>
        </section>
      )}

      <BlogFilterProvider anchorId="guides">
        {hasGrid && (
          <section id="guides" className="relative scroll-mt-28 bg-cream py-24 sm:py-32">
            <div className="container-x">
              <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeading
                  eyebrow={isFirst ? "Latest guides" : `Page ${page} of ${totalPages}`}
                  title={isFirst ? "Fresh off the *shelf*." : "More from the *archive*."}
                  intro="Filter by shelf or search every guide we've written. Each one links straight to the products it mentions."
                />
                <Reveal delay={0.2} y={12}>
                  <a
                    href="/blog/rss.xml"
                    className="group inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-4 text-sm font-semibold text-ink transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-peach hover:bg-[#FFEBDC]"
                  >
                    <Rss aria-hidden className="size-4 text-peach transition-transform duration-300 group-hover:rotate-12" />
                    Follow via RSS
                  </a>
                </Reveal>
              </div>
              <PostFilterGrid
                categories={categories}
                items={items}
                archive={archive}
                promo={isFirst ? <GridPromo /> : undefined}
                suggestions={topics}
                pageLabel={pageLabel}
              />
              <BlogPagination page={page} totalPages={totalPages} className="mt-16 border-t border-line pt-10" />
            </div>
          </section>
        )}

        {!hasGrid && !lead && <EmptyShelf />}

        {topics.length > 0 && hasGrid && (
          <section className="relative overflow-hidden bg-paper py-24 sm:py-32">
            <ScrollSpin turns={0.6} className="pointer-events-none absolute -right-28 top-10 size-80 opacity-[0.07] sm:size-[28rem]">
              <Image src="/brand/mark.png" alt="" width={278} height={278} className="size-full" />
            </ScrollSpin>
            <div className="container-x relative grid gap-12 grid-cols-1 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-4">
                <SectionHeading
                  eyebrow="Popular topics"
                  title="Pick a *topic*, any topic."
                  intro="Tap one to filter the guides above. The bigger the bubble, the more we've written about it."
                />
              </div>
              <div className="lg:col-span-8 lg:pt-4">
                <TopicCloud topics={topics} />
              </div>
            </div>
          </section>
        )}
      </BlogFilterProvider>

      {isFirst && (
        <section aria-label="Browse the blog by category" className="grain relative bg-ink text-cream">
          <HorizontalRail
            className="z-[2] py-24 sm:py-32"
            trackClassName="px-[clamp(1.25rem,4vw,3rem)] lg:px-[max(3rem,calc((100vw_-_88rem)/2_+_3rem))]"
          >
            <RailIntroPanel total={all.length} />
            {categories.map((c, i) => (
              <RailCategoryPanel
                key={c.slug}
                index={i}
                slug={c.slug}
                name={c.name}
                accent={c.accent}
                count={c.count}
                latest={all
                  .filter((p) => p.categorySlug === c.slug)
                  .slice(0, 2)
                  .map((p) => ({ slug: p.slug, title: p.title }))}
              />
            ))}
            <RailCtaPanel />
          </HorizontalRail>
        </section>
      )}

      <BacklinkBand
        eyebrow="Before you go"
        title="Stock up for *less*."
        text="Reading done? PoundMart packs the essentials you use every day into multi-packs that cost less per item. Explore PoundMart, browse the full shop or head straight to our Amazon store."
        placement="blog-index"
        amazonHref={amazon.store()}
        amazonLabel="Visit our Amazon store"
      />
    </>
  );
}

/* ---------- Heroes ---------- */

function IndexHero({
  total,
  latest,
  pills,
  startHref,
}: {
  total: number;
  latest?: string;
  pills: { label: string; href: string; accent: string; count: number }[];
  startHref: string;
}) {
  return (
    <section className="relative overflow-hidden bg-cream pb-24 pt-[calc(var(--header-h)_+_2.5rem)] sm:pb-32 lg:pt-[calc(var(--header-h)_+_4rem)]">
      <div aria-hidden className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_20%_10%,black,transparent_65%)]" />
      <div aria-hidden className="absolute -right-48 top-24 size-[40rem] rounded-full bg-sun/25 blur-3xl" />
      <div aria-hidden className="absolute -left-40 bottom-0 size-[26rem] rounded-full bg-sky/70 blur-3xl" />

      <div className="container-x relative grid items-center gap-16 grid-cols-1 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal y={12}>
            <p className="eyebrow inline-flex items-center gap-2 text-ink-soft">
              <BookOpenText aria-hidden className="size-4 text-sun-deep" />
              The PoundMart blog
            </p>
          </Reveal>
          <SplitHeading
            as="h1"
            immediate
            text="The *Bundle* Blog"
            className="type-display mt-6 text-[clamp(3.7rem,10.5vw,8.75rem)] text-ink"
            accentClassName="text-ink-soft"
            delay={0.1}
          />
          <Reveal delay={0.35} y={16}>
            <p className="mt-7 max-w-[26ch] font-display text-[clamp(1.4rem,2.4vw,1.95rem)] font-semibold leading-[1.15] tracking-tight text-ink">
              Guides for brighter smiles, happier hair and cupboards that never run dry.
            </p>
          </Reveal>
          <Reveal delay={0.45} y={16}>
            <p className="mt-5 max-w-[54ch] text-lg leading-relaxed text-ink-soft">
              Practical, jargon-free advice from the PoundMart team on flavoured toothpaste, kids&apos; brushing, curly hair and buying
              everyday essentials for less. When you&apos;re ready to shop, every product is one tap from Amazon.
            </p>
          </Reveal>
          <Reveal delay={0.55} y={16}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <AmazonButton href={amazon.store()} placement="blog-index-hero" size="lg">
                  Shop PoundMart on Amazon
                </AmazonButton>
              </Magnetic>
              <ButtonLink href={startHref} variant="outline" size="lg">
                Start reading
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.65} y={16}>
            <CategoryPills id="blog-hero-pills" pills={pills} className="mt-10" label="Blog categories" />
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <HeroCollage
            tiles={heroTiles}
            sticker={{ text: "The Bundle Blog ✦ Read ✦ Save ✦ Smile ✦ ", className: "-left-3 top-[40%] sm:left-[-1.5rem]" }}
            className="mx-auto aspect-[5/6] w-full max-w-[34rem]"
          />
        </div>
      </div>

      {total > 0 && (
        <div className="container-x relative mt-16 sm:mt-20">
          <Reveal y={16}>
            <dl className="grid grid-cols-3 divide-x divide-line overflow-hidden rounded-4xl border border-line bg-paper/70 shadow-soft backdrop-blur">
              <div className="flex flex-col gap-1 px-4 py-5 sm:px-8 sm:py-6">
                <dt className="order-2 text-xs font-medium text-ink-soft sm:text-sm">guides to read</dt>
                <dd className="order-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl">
                  <CountUp to={total} />
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-4 py-5 sm:px-8 sm:py-6">
                <dt className="order-2 text-xs font-medium text-ink-soft sm:text-sm">shelves to browse</dt>
                <dd className="order-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl">
                  <CountUp to={blogCategories.length} />
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-4 py-5 sm:px-8 sm:py-6">
                <dt className="order-2 text-xs font-medium text-ink-soft sm:text-sm">latest guide</dt>
                <dd className="order-1 font-display text-lg font-bold leading-tight tracking-tight text-ink sm:text-3xl">
                  {latest ? formatDate(latest, { day: "numeric", month: "short" }) : "Soon"}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      )}
    </section>
  );
}

function ArchiveHero({
  page,
  totalPages,
  total,
  pills,
  trail,
}: {
  page: number;
  totalPages: number;
  total: number;
  pills: { label: string; href: string; accent: string; count: number }[];
  trail: { label: string; href: string }[];
}) {
  const from = (page - 1) * POSTS_PER_PAGE + 1;
  const to = Math.min(page * POSTS_PER_PAGE, total);
  return (
    <section className="relative overflow-hidden bg-cream pb-16 pt-[calc(var(--header-h)_+_2.5rem)] sm:pb-20">
      <div aria-hidden className="dot-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_80%_20%,black,transparent_60%)]" />
      <div aria-hidden className="absolute -right-32 -top-10 size-[30rem] rounded-full bg-sun/20 blur-3xl" />
      <div className="container-x relative grid items-end gap-10 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Breadcrumbs items={trail} />
          <SplitHeading
            as="h1"
            immediate
            text={`The archive, *page ${page}*.`}
            className="type-display mt-8 text-[clamp(3rem,8vw,6.5rem)] text-ink"
            accentClassName="text-ink-soft"
          />
          <Reveal delay={0.3} y={16}>
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-ink-soft">
              Older guides from {BLOG_TITLE}, newest first. You&apos;re looking at guides {from} to {to} of {total} in the archive, plus search that
              covers every guide we&apos;ve published.
            </p>
          </Reveal>
          <Reveal delay={0.4} y={16}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <AmazonButton href={amazon.store()} placement="blog-archive-hero" size="lg">
                  Shop PoundMart on Amazon
                </AmazonButton>
              </Magnetic>
              <ButtonLink href="/blog" variant="outline" size="lg">
                Back to the latest
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.5} y={16}>
            <CategoryPills id="blog-archive-pills" pills={pills} className="mt-10" />
          </Reveal>
        </div>
        <div aria-hidden className="relative hidden h-full min-h-72 lg:col-span-4 lg:block">
          <Parallax offset={60} rotate={4} className="absolute inset-0 grid place-items-center">
            <span className="accent-serif select-none text-[16rem] leading-none text-ink/[0.08]">
              {String(page).padStart(2, "0")}
            </span>
            <span className="absolute bottom-6 right-6 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream shadow-lift">
              of {totalPages}
            </span>
          </Parallax>
        </div>
      </div>
    </section>
  );
}

function EmptyShelf() {
  return (
    <section id="guides" className="bg-cream py-24 sm:py-32">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-5xl border border-dashed border-ink/20 bg-paper px-6 py-20 text-center">
          <div aria-hidden className="dot-grid absolute inset-0 opacity-40" />
          <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
            <Image src="/brand/mark.png" alt="" width={278} height={278} className="size-20 animate-float" />
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">The first guides are on their way.</h2>
            <p className="text-lg text-ink-muted">
              While we finish writing, the shop is fully stocked. Take a look at our best value bundles.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/shop" variant="ink" size="lg">
                Browse the shop
              </ButtonLink>
              <ButtonLink href="/" variant="outline" size="lg">
                PoundMart home
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
