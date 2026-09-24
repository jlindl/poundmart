import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, RotateCcw, ShoppingBag, Truck } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqExplorer } from "@/components/faq/faq-explorer";
import { getFaqGroups } from "@/components/faq/faq-content";
import { answerHtml } from "@/components/faq/faq-text";
import { QuestionGlyph } from "@/components/faq/question-glyph";
import { ScrollScale } from "@/components/faq/scroll-scale";
import { blogCategories, featuredPosts } from "@/lib/blog";
import { amazon, brandFacts, site } from "@/lib/site";

const title = "FAQs: Ordering, Delivery, Returns & Ingredients";
const description =
  "Answers to common questions about PoundMart bundles: buying on Amazon, delivery, 30-day returns, and Nice Smile toothpaste and XHC haircare ingredients.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    url: "/faq",
    siteName: site.name,
    locale: site.locale,
    title: `${title} | ${site.name}`,
    description,
    images: [{ url: site.ogImage, width: 1770, height: 753, alt: "A family unboxing a PoundMart value bundle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${site.name}`,
    description,
    images: [site.ogImage],
  },
};

const shortVersion = [
  { icon: ShoppingBag, q: "Where do I buy?", a: "On Amazon UK, in the PoundMart store.", href: "#where-to-buy" },
  { icon: Truck, q: "Who delivers?", a: `${brandFacts.soldBy}, ${brandFacts.dispatchedBy.toLowerCase()}.`, href: "#who-dispatches" },
  { icon: RotateCcw, q: "Can I return it?", a: `Yes: ${brandFacts.returns}.`, href: "#returns-policy" },
];

const ctaProducts = [
  { src: "/products/B0FLFZ2Z6C/g1.jpg", alt: "Nice Smile 3 Pack: Berry Burst, Yummy Gummy and Candy Clean", bg: "#E1E9FC", className: "left-0 top-[4%] w-[52%] -rotate-6", offset: 34 },
  { src: "/products/B0G3BS11B8/g1.jpg", alt: "XHC No Rinse Conditioner 3 Pack", bg: "#FDE6E1", className: "right-0 top-0 w-[46%] rotate-6", offset: -26 },
  { src: "/products/B0GKYHKMRG/g1.jpg", alt: "XHC 2-in-1 shampoo and conditioner bars in Coconut, Banana and Papaya", bg: "#FEEFD6", className: "bottom-0 left-[22%] w-[56%] rotate-2", offset: 46 },
];

export default function FaqPage() {
  const groups = getFaqGroups();
  const posts = featuredPosts(3);
  const store = amazon.store();

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            url: `${site.url}/faq`,
            mainEntity: groups.flatMap((g) =>
              g.items.map((item) => ({
                "@type": "Question",
                name: item.question,
                url: `${site.url}/faq#${item.id}`,
                acceptedAnswer: { "@type": "Answer", text: answerHtml(item.answer, site.url) },
              })),
            ),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: site.url },
              { "@type": "ListItem", position: 2, name: "FAQs", item: `${site.url}/faq` },
            ],
          },
        ]}
      />

      {/* Hero */}
      <section aria-label="PoundMart FAQs" className="relative overflow-x-clip bg-cream pt-[var(--header-h)]">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_60%)]" />
        <div className="container-x relative grid gap-14 pb-20 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-28 lg:pt-14">
          <div className="relative z-2 lg:col-span-7">
            <Reveal y={12}>
              <span className="eyebrow inline-flex items-center gap-2 text-ink-soft">
                <span aria-hidden className="size-1.5 rounded-full bg-sun-deep" />
                Help centre
              </span>
            </Reveal>
            <SplitHeading
              as="h1"
              immediate
              delay={0.1}
              text="Questions? We've got *answers*."
              className="type-display mt-6 max-w-[11ch] text-[clamp(3.1rem,8.4vw,8rem)] text-ink"
              accentClassName="text-ink-soft"
            />
            <Reveal y={20} delay={0.4}>
              <p className="mt-8 max-w-[48ch] text-lg leading-relaxed text-ink-muted sm:text-xl">
                Everything you need to know about buying PoundMart bundles on Amazon, delivery, returns, ingredients and value. Search
                below, or jump straight to a topic.
              </p>
            </Reveal>
            <Reveal y={20} delay={0.5} className="mt-8 flex flex-wrap gap-3">
              <AmazonButton href={store} placement="faq-hero">
                Shop on Amazon
              </AmazonButton>
              <ButtonLink
                href="#questions"
                variant="outline"
                size="lg"
                icon="none"
                iconLeft={<ArrowDown aria-hidden className="relative size-[1.1em] transition-transform duration-300 group-hover/btn:translate-y-0.5" />}
              >
                Browse questions
              </ButtonLink>
            </Reveal>
          </div>

          <div className="relative lg:col-span-5">
            <QuestionGlyph className="absolute right-[-4%] -top-24 z-0 hidden sm:block lg:-top-40 lg:right-[-8%]" />
            <div className="relative z-1 rounded-5xl border border-line bg-paper/80 p-4 shadow-lift backdrop-blur-md sm:p-5">
              <p className="eyebrow px-3 pb-3 pt-2 text-ink-soft">The short version</p>
              <RevealGroup as="ul" delay={0.45} stagger={0.1} className="flex flex-col gap-2">
                {shortVersion.map(({ icon: Icon, q, a, href }) => (
                  <RevealItem as="li" key={href}>
                    <a
                      href={href}
                      className="group flex items-center gap-4 rounded-3xl bg-cream px-4 py-4 transition-[background-color,transform] duration-500 ease-out-expo hover:-translate-y-0.5 hover:bg-sun-soft sm:px-5"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-sun transition-transform duration-500 ease-spring group-hover:-rotate-12">
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-lg font-bold leading-tight text-ink">{q}</span>
                        <span className="mt-0.5 block text-sm leading-snug text-ink-muted">{a}</span>
                      </span>
                      <ArrowRight aria-hidden className="size-5 shrink-0 text-ink transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </div>
        </div>
      </section>

      {/* Search + questions */}
      <section id="questions" aria-label="Frequently asked questions" className="relative scroll-mt-4 bg-paper py-20 sm:py-28 lg:py-32">
        <div className="container-x">
          <FaqExplorer groups={groups} storeHref={store} />
        </div>
      </section>

      {/* From the blog */}
      <section aria-label="Guides from the PoundMart blog" className="relative overflow-x-clip bg-cream py-24 sm:py-32 lg:py-40">
        <div className="container-x">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="From the blog"
              title="Want the *long* answers?"
              intro="Our guides go deeper on brushing routines, curly hair care, argan oil, smart saving and busy family life."
            />
            <Reveal y={16} delay={0.1}>
              <ButtonLink href="/blog" variant="ink" size="lg">
                Visit the blog
              </ButtonLink>
            </Reveal>
          </div>

          {posts.length > 0 && (
            <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:mt-20 lg:grid-cols-3">
              {posts.map((post) => (
                <RevealItem key={post.slug} className="h-full">
                  <PostCard post={post} className="h-full" />
                </RevealItem>
              ))}
            </RevealGroup>
          )}

          <nav aria-label="Blog categories" className={posts.length > 0 ? "mt-10" : "mt-14 lg:mt-20"}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {blogCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/blog/category/${c.slug}`}
                    className="group relative flex h-full flex-col gap-2 overflow-hidden rounded-3xl border border-line bg-paper p-5 transition-[transform,box-shadow,border-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-ink/20 hover:shadow-lift"
                  >
                    <span aria-hidden className="absolute -right-6 -top-6 size-20 rounded-full opacity-20 transition-transform duration-700 group-hover:scale-150" style={{ backgroundColor: c.accent }} />
                    <span className="relative flex items-center justify-between gap-3">
                      <span className="font-display text-lg font-bold text-ink">{c.name}</span>
                      <ArrowRight aria-hidden className="size-4 text-ink transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <span className="relative line-clamp-2 text-sm leading-relaxed text-ink-muted">{c.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* Closing CTA */}
      <section aria-label="Shop PoundMart on Amazon" className="bg-cream pb-20 sm:pb-28">
        <div className="container-x">
          <ScrollScale>
            <div className="grain relative overflow-hidden rounded-5xl bg-ink px-6 py-16 text-cream sm:px-12 sm:py-20 lg:px-20 lg:py-24 [&_:focus-visible]:outline-sun">
              <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-sun/15 blur-2xl" />
              <div className="relative z-2 grid items-center gap-14 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <Reveal y={12}>
                    <span className="eyebrow inline-flex items-center gap-2 text-sun">
                      <span aria-hidden className="size-1.5 rounded-full bg-sun" />
                      Answers found?
                    </span>
                  </Reveal>
                  <SplitHeading
                    text="Now for the *bundles*."
                    className="type-display mt-5 text-[clamp(2.8rem,6.6vw,6.2rem)] text-cream"
                    accentClassName="text-sun"
                  />
                  <Reveal y={16} delay={0.1}>
                    <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-cream/75">
                      Browse every PoundMart bundle in our Amazon store: {brandFacts.soldBy.toLowerCase()},{" "}
                      {brandFacts.dispatchedBy.toLowerCase()}, with {brandFacts.returns}.
                    </p>
                  </Reveal>
                  <Reveal y={16} delay={0.18} className="mt-9 flex flex-wrap items-center gap-3">
                    <Magnetic>
                      <AmazonButton href={store} placement="faq-final" size="xl">
                        Visit our Amazon store
                      </AmazonButton>
                    </Magnetic>
                    <ButtonLink href="/shop" variant="glass" size="xl">
                      Shop all bundles
                    </ButtonLink>
                  </Reveal>
                </div>
                <div className="relative mx-auto aspect-square w-full max-w-[440px] lg:col-span-5">
                  {ctaProducts.map((p) => (
                    <Parallax key={p.src} offset={p.offset} className={`absolute ${p.className}`}>
                      <div
                        className="relative aspect-square overflow-hidden rounded-4xl shadow-lift transition-transform duration-700 ease-out-expo hover:-translate-y-2 hover:scale-[1.04]"
                        style={{ backgroundColor: p.bg }}
                      >
                        <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 18vw, 45vw" className="product-cutout object-contain p-[10%]" />
                      </div>
                    </Parallax>
                  ))}
                </div>
              </div>
            </div>
          </ScrollScale>
        </div>
      </section>
    </>
  );
}
