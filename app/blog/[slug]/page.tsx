import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, RefreshCw } from "lucide-react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { Parallax } from "@/components/motion/parallax";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { imageExists } from "@/components/ui/image-slot";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductCard } from "@/components/product/product-card";
import { PostBody } from "@/components/blog/mdx";
import { PostCard, PostCover } from "@/components/blog/post-card";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/blog/breadcrumbs";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ShareRow } from "@/components/blog/share-row";
import { CoverParallax } from "@/components/blog/scroll-effects";
import { AuthorBox, PostNav, PRICE_NOTE, QuickBuyCard } from "@/components/blog/article-parts";
import { BacklinkBand } from "@/components/blog/backlink-band";
import { getCategoryArt } from "@/components/blog/category-art";
import { absoluteUrl, extractFaq, formatTag, productsForPost, shareImage } from "@/components/blog/blog-utils";
import { getAllPosts, getCategory, getPost, getRelatedPosts } from "@/lib/blog";
import { amazon, site } from "@/lib/site";
import { formatDate, seoTitle } from "@/lib/utils";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return { title: "Guide not found", robots: { index: false } };
  const image = absoluteUrl(shareImage(post, imageExists(post.heroImage)));
  const path = `/blog/${post.slug}`;
  return {
    title: seoTitle(post.title),
    description: post.description,
    keywords: [post.targetKeyword, ...post.tags].filter((k): k is string => Boolean(k)),
    alternates: { canonical: path },
    authors: [{ name: post.author, url: `${site.url}/about` }],
    category: post.category,
    openGraph: {
      type: "article",
      url: path,
      siteName: site.name,
      locale: site.locale,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      section: post.category,
      tags: post.tags,
      authors: [post.author],
      images: [{ url: image, alt: post.heroImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();

  const all = getAllPosts();
  const index = all.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? all[index - 1] : undefined;
  const older = index >= 0 && index < all.length - 1 ? all[index + 1] : undefined;
  const category = getCategory(post.categorySlug);
  const accent = category?.accent ?? "#FCD000";
  const art = getCategoryArt(post.categorySlug);
  const related = getRelatedPosts(post, 3);
  const picks = productsForPost(post, 3);
  const lead = picks[0];
  const url = `${site.url}/blog/${post.slug}`;
  const heroExists = imageExists(post.heroImage);
  const image = absoluteUrl(shareImage(post, heroExists));
  const mood = art.collage.find((t) => t.fit !== "contain");
  const faq = extractFaq(post.body);
  const headings = post.headings.map((h) => ({ id: h.id, text: h.text, depth: h.depth }));
  const updated = post.updated && post.updated !== post.date ? post.updated : undefined;
  const trail = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.category, href: `/blog/category/${post.categorySlug}` },
    { label: post.title, href: `/blog/${post.slug}` },
  ];
  const navPost = (p: typeof newer) => (p ? { slug: p.slug, title: p.title, category: p.category, date: p.date } : undefined);

  return (
    <>
      <ScrollProgress />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": `${url}#article`,
            headline: post.title,
            description: post.description,
            image: [image],
            datePublished: post.date,
            dateModified: post.updated ?? post.date,
            author: { "@type": "Organization", name: post.author, url: `${site.url}/about` },
            publisher: {
              "@type": "Organization",
              name: site.name,
              url: site.url,
              logo: { "@type": "ImageObject", url: `${site.url}${site.logo}` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            url,
            isPartOf: { "@id": `${site.url}/blog#blog` },
            articleSection: post.category,
            keywords: [post.targetKeyword, ...post.tags].filter(Boolean).join(", "),
            wordCount: post.wordCount,
            inLanguage: "en-GB",
          },
          breadcrumbJsonLd(trail),
          ...(faq.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faq.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: { "@type": "Answer", text: f.answer },
                  })),
                },
              ]
            : []),
        ]}
      />

      <article>
        {/* Header */}
        <header className="relative overflow-hidden bg-cream pb-12 pt-[calc(var(--header-h)_+_2rem)] sm:pb-16 lg:pt-[calc(var(--header-h)_+_3rem)]">
          <div aria-hidden className="absolute -right-48 -top-24 size-[38rem] rounded-full opacity-25 blur-3xl" style={{ background: accent }} />
          <div aria-hidden className="dot-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_85%_0%,black,transparent_60%)]" />
          <div className="container-x relative">
            <Reveal y={10}>
              <Breadcrumbs items={trail} />
            </Reveal>
            <div className="mt-10 grid gap-10 grid-cols-1 lg:grid-cols-12 lg:items-end lg:gap-12">
              <div className="lg:col-span-8">
                <Reveal y={12}>
                  <Link
                    href={`/blog/category/${post.categorySlug}`}
                    className="group inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-ink/10 bg-paper px-3.5 text-sm font-semibold text-ink shadow-soft transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-cream"
                  >
                    <span aria-hidden className="size-2.5 rounded-full ring-2 ring-white" style={{ background: accent }} />
                    {post.category}
                    <ArrowRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </Reveal>
                <SplitHeading
                  as="h1"
                  immediate
                  text={post.title.replace(/\*/g, "")}
                  stagger={0.035}
                  className="type-display mt-6 max-w-[21ch] text-[clamp(2.35rem,5.4vw,5rem)] leading-[0.98] text-ink"
                />
                <Reveal delay={0.3} y={16}>
                  <p className="mt-7 max-w-[60ch] text-lg leading-relaxed text-ink-soft sm:text-xl">{post.excerpt}</p>
                </Reveal>
                <Reveal delay={0.4} y={16}>
                  <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 text-sm text-ink-soft">
                    <Link href="/about" className="group flex cursor-pointer items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sun shadow-glow transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-12 group-hover:scale-110">
                        <Image src="/brand/mark.png" alt="" width={278} height={278} className="size-7" />
                      </span>
                      <span>
                        <span className="block text-xs">Written by</span>
                        <span className="block font-semibold text-ink underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-300 group-hover:decoration-sun">
                          {post.author}
                        </span>
                      </span>
                    </Link>
                    <span className="flex items-center gap-2">
                      <CalendarDays aria-hidden className="size-4" />
                      <span>
                        Published <time dateTime={post.date}>{formatDate(post.date)}</time>
                      </span>
                    </span>
                    {updated && (
                      <span className="flex items-center gap-2">
                        <RefreshCw aria-hidden className="size-4" />
                        <span>
                          Updated <time dateTime={updated}>{formatDate(updated)}</time>
                        </span>
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <Clock aria-hidden className="size-4" />
                      {post.readMinutes} min read
                    </span>
                  </div>
                </Reveal>
              </div>
              <Reveal delay={0.45} y={24} className="lg:col-span-4">
                <QuickBuyCard product={lead} placement="blog-article-hero" />
              </Reveal>
            </div>
          </div>
        </header>

        {/* Cover: the hero photo, or until one exists, the product cover beside a category lifestyle shot */}
        <div className="bg-cream">
          <div className="container-x">
            {heroExists || !mood ? (
              <CoverParallax className="aspect-[4/3] rounded-4xl shadow-lift sm:aspect-[16/9] sm:rounded-5xl lg:aspect-[12/5]">
                <PostCover post={post} priority className="size-full" sizes="(min-width: 1408px) 1312px, 94vw" />
              </CoverParallax>
            ) : (
              <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                <CoverParallax className="aspect-[4/3] rounded-4xl shadow-lift sm:aspect-[16/9] sm:rounded-5xl lg:aspect-auto lg:h-[min(34rem,64vh)]">
                  <PostCover post={post} priority className="size-full" sizes="(min-width: 1024px) 60vw, 94vw" />
                </CoverParallax>
                <CoverParallax className="hidden rounded-5xl shadow-lift lg:block lg:h-[min(34rem,64vh)]">
                  <Image
                    src={mood.src}
                    alt={mood.alt}
                    fill
                    sizes="(min-width: 1408px) 480px, 36vw"
                    className="object-cover"
                    style={mood.objectPosition ? { objectPosition: mood.objectPosition } : undefined}
                  />
                </CoverParallax>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="bg-cream">
          <div className="container-x grid gap-10 pb-24 pt-14 sm:pt-20 lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[15rem_minmax(0,1fr)_17.5rem] xl:gap-14">
            <aside className="hidden lg:block">
              <div className="sticky top-28 flex flex-col gap-10">
                <TableOfContents headings={headings} />
                <ShareRow url={url} title={post.title} />
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mx-auto max-w-[44rem]">
                {headings.length > 0 && (
                  <div className="mb-12 lg:hidden">
                    <TableOfContents headings={headings} variant="mobile" />
                  </div>
                )}
                <PostBody source={post.body} />

                {post.tags.length > 0 && (
                  <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-line pt-8">
                    <span className="eyebrow mr-2 text-ink-soft">Tagged</span>
                    {post.tags.map((t) => (
                      <span key={t} className="rounded-full bg-sand px-3 py-1.5 text-sm font-medium text-ink">
                        #{formatTag(t)}
                      </span>
                    ))}
                  </div>
                )}
                <ShareRow url={url} title={post.title} className="mt-10 lg:hidden" />
              </div>
            </div>

            <aside className="hidden xl:block" aria-label="Shop this guide">
              <div className="sticky top-28">
                <QuickBuyCard product={lead} placement="blog-article-rail" layout="stack" eyebrow="Shop this guide" />
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Shop this article */}
      {picks.length > 0 && (
        <section className="grain relative overflow-hidden bg-ink py-24 text-cream sm:py-32">
          <div aria-hidden className="absolute -left-32 top-0 size-[30rem] rounded-full blur-3xl" style={{ background: `${accent}33` }} />
          <div aria-hidden className="absolute -right-24 bottom-0 size-[26rem] rounded-full bg-sun/10 blur-3xl" />
          <div className="container-x relative z-[2]">
            <div className="mb-12 flex flex-col gap-8 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                tone="light"
                eyebrow="Shop this article"
                title="Everything in this guide, *one tap* away."
                intro={<>Ratings are from Amazon. {PRICE_NOTE}</>}
              />
              <Reveal delay={0.2} y={12}>
                <ButtonLink href={art.shopHref} variant="light" size="lg" className="focus-visible:outline-sun">
                  {art.shopLabel}
                </ButtonLink>
              </Reveal>
            </div>
            <RevealGroup className={`grid gap-6 sm:grid-cols-2 ${picks.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {picks.map((p) => (
                <RevealItem key={p.slug} className="h-full">
                  <ProductCard product={p} placement="blog-article-products" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* Author and older/newer */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="container-x flex flex-col gap-6">
          <Reveal y={24}>
            <AuthorBox author={post.author} />
          </Reveal>
          <Reveal y={24} delay={0.1}>
            <PostNav older={navPost(older)} newer={navPost(newer)} />
          </Reveal>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="relative overflow-hidden bg-paper py-24 sm:py-32">
          <Parallax offset={90} rotate={8} className="pointer-events-none absolute -right-20 top-16 hidden size-72 opacity-[0.08] lg:block">
            <Image src="/brand/mark.png" alt="" width={278} height={278} className="size-full" />
          </Parallax>
          <div className="container-x relative">
            <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading eyebrow="Keep reading" title="More *good reads*." intro="More from the same shelf and similar topics." />
              <Reveal delay={0.2} y={12}>
                <ButtonLink href="/blog" variant="outline" size="lg">
                  All guides
                </ButtonLink>
              </Reveal>
            </div>
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {related.map((p) => (
                <RevealItem key={p.slug} className="grid">
                  <PostCard post={p} className="h-full" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <BacklinkBand
        eyebrow="Enjoyed this guide?"
        title="Now for the *fun* part."
        text="Everything in this guide is a tap away. Explore PoundMart for more great value bundles, or head straight to our Amazon store, where every order is sold by PoundMart and dispatched by Amazon."
        placement="blog-article-end"
        amazonHref={amazon.store(art.amazonPage)}
        amazonLabel={art.amazonLabel}
      />
    </>
  );
}
