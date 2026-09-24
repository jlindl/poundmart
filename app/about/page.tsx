import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { BadgeCheck, PackageCheck, RotateCcw, Truck } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/image-slot";
import { JsonLd } from "@/components/seo/json-ld";
import { AboutCta } from "@/components/about/about-cta";
import { BehindGallery, type GalleryItem } from "@/components/about/behind-gallery";
import { BrandPanels } from "@/components/about/brand-panels";
import { BundleTimeline, type TimelineStep } from "@/components/about/bundle-timeline";
import { FactTapes } from "@/components/about/fact-tapes";
import { FilmReveal } from "@/components/about/film-reveal";
import { HeroScrollFx } from "@/components/about/hero-fx";
import { NeverSell } from "@/components/about/never-sell";
import { Seal } from "@/components/about/seal";
import { StoryReveal, type StorySegment } from "@/components/about/story-reveal";
import { ValuesGrid } from "@/components/about/values-grid";
import { amazon, brandFacts, site } from "@/lib/site";
import { getProduct, pricePerUnit } from "@/lib/products";
import { formatDate, formatPrice } from "@/lib/utils";

const title = "About Us: Genuine Brands, Great Value Bundles";
const description =
  "UK-based PoundMart bundles genuine Nice Smile toothpaste and XHC haircare into great value multi-packs. Packed and checked by us, dispatched by Amazon.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "/about",
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

const heroFacts = [
  { icon: BadgeCheck, label: brandFacts.soldBy },
  { icon: Truck, label: brandFacts.dispatchedBy },
  { icon: RotateCcw, label: brandFacts.returns },
];

const story: StorySegment[] = [
  { text: "We think running out of the basics is a pain, and paying full price for one tube at a time is worse. So *PoundMart* does it differently. We take genuine products from brands like" },
  { image: "/products/B0G318R9JG/g1.jpg", tint: "#FFE3E6" },
  { text: "Nice Smile and" },
  { image: "/products/B0GBMH1N54/g1.jpg", tint: "#F3E8DB" },
  { text: "XHC Xpert Haircare, bundle them into" },
  { image: "/products/B0HBXLVW4S/g1.jpg", tint: "#FFF3B8" },
  { text: "multi-packs that cost less per item, then pack and check every box *ourselves.* Amazon takes it from there." },
];

function Sticker({ icon: Icon, children }: { icon: typeof Truck; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-paper/95 py-2 pl-2 pr-4 text-sm font-semibold text-ink shadow-soft backdrop-blur">
      <span className="grid size-7 place-items-center rounded-full bg-ink text-sun">
        <Icon aria-hidden className="size-3.5" />
      </span>
      {children}
    </span>
  );
}

export default function AboutPage() {
  const twelve = getProduct("nice-smile-12-pack-toothpaste-bundle");
  const single = getProduct("nice-smile-watermelon-fresh-toothpaste");
  const twelveUnit = twelve ? pricePerUnit(twelve.primary) : null;
  const singlePrice = single?.primary.price ?? null;

  const steps: TimelineStep[] = [
    {
      title: "Choose trusted brands",
      text: "It starts with brands worth bundling: Nice Smile flavoured toothpaste and XHC Xpert Haircare. Every item is genuine branded stock. No knockoffs, no grey-market products.",
      chips: ["Genuine stock", "Nice Smile", "XHC Xpert Haircare"],
      media: (
        <Image
          src="/products/B0FLWZ7D6T/g2.jpg"
          alt="Nice Smile Feelin' Grape, Peachy Clean and Watermelon Fresh tubes standing on white podiums"
          fill
          sizes="(min-width: 1024px) 40vw, 80vw"
          className="object-cover"
        />
      ),
    },
    {
      title: "Bundle for value",
      text: "Then we group them into multi-packs that make sense: every flavour in one box, a family-sized stock-up, a complete wash-day routine. More in the box, less per item.",
      chips: ["Multi-packs", "Price per item shown", "Mix of flavours"],
      media: (
        <div className="absolute inset-0 bg-sun-soft">
          <div aria-hidden className="dot-grid absolute inset-0 opacity-50" />
          <Image
            src="/products/B0HBXLVW4S/g1.jpg"
            alt="The Nice Smile 12 Pack: four each of Watermelon Fresh, Feelin' Grape and Peachy Clean"
            fill
            sizes="(min-width: 1024px) 40vw, 80vw"
            className="product-cutout object-contain p-[9%]"
          />
        </div>
      ),
      aside:
        twelveUnit !== null ? (
          <span className="flex flex-col rounded-3xl bg-ink px-4 py-3 text-cream shadow-lift">
            <span className="font-display text-2xl font-bold leading-none tracking-tight text-sun sm:text-3xl">{formatPrice(twelveUnit)}</span>
            <span className="mt-1 text-xs font-medium text-cream/80">
              a tube in the 12 Pack{singlePrice !== null ? `, vs ${formatPrice(singlePrice)} for one` : ""}
            </span>
          </span>
        ) : undefined,
    },
    {
      title: "Pack and check",
      text: "Every bundle is packaged and quality-checked by PoundMart here in the UK before it heads to Amazon, so each box is complete and ready to go.",
      chips: ["Packed by PoundMart", "Quality-checked", "UK-based"],
      media: (
        <SmartImage
          src="/images/about/packing-bench.jpg"
          alt="The PoundMart team packing bundles at the packing bench"
          hint="PoundMart team packing bundles at the packing bench"
          fill
          sizes="(min-width: 1024px) 40vw, 80vw"
          className="object-cover"
        />
      ),
      aside: <Sticker icon={PackageCheck}>Packed & checked by us</Sticker>,
    },
    {
      title: "Dispatched by Amazon",
      text: "Order on Amazon and Amazon dispatches it, with your delivery options shown at checkout and 30-day returns through Amazon if anything isn't right.",
      chips: ["Sold by PoundMart", "Dispatched by Amazon", "30-day returns"],
      media: (
        <Image
          src="/products/B0G318R9JG/g5.jpg"
          alt="Nice Smile toothpaste tubes beside a wrapped gift box and colourful balloons"
          fill
          sizes="(min-width: 1024px) 40vw, 80vw"
          className="object-cover"
        />
      ),
      aside: <Sticker icon={Truck}>Dispatched by Amazon</Sticker>,
    },
  ];

  const gallery: GalleryItem[] = [
    {
      id: "team",
      shape: "portrait",
      kicker: "The team",
      caption: "The people behind the bundles",
      media: (
        <SmartImage src="/images/about/team.jpg" alt="The PoundMart team" hint="The PoundMart team, smiling in the packing room" fill sizes="(min-width: 1024px) 30vw, 70vw" className="object-cover" />
      ),
    },
    {
      id: "spa",
      shape: "square",
      kicker: "XHC",
      caption: "Wash day, upgraded",
      media: (
        <Image
          src="/products/B0GBMH1N54/a5.png"
          alt="XHC Argan Oil conditioner on a wooden bath caddy with a towel and oil bottle"
          fill
          sizes="(min-width: 1024px) 36vw, 80vw"
          className="object-cover"
        />
      ),
    },
    {
      id: "shelves",
      shape: "landscape",
      kicker: "Stock room",
      caption: "Genuine stock, ready to bundle",
      media: (
        <SmartImage
          src="/images/about/stock-shelves.jpg"
          alt="Shelves stacked with Nice Smile and XHC stock"
          hint="Shelves of Nice Smile and XHC stock ready for bundling"
          fill
          sizes="(min-width: 1024px) 48vw, 85vw"
          className="object-cover"
        />
      ),
    },
    {
      id: "bars",
      shape: "square",
      kicker: "XHC bars",
      caption: "Tropical, plastic-free, gym-bag ready",
      media: (
        <Image
          src="/products/B0GKYHKMRG/g5.jpg"
          alt="XHC Coconut, Banana and Papaya shampoo bars among coconuts, bananas and papaya"
          fill
          sizes="(min-width: 1024px) 36vw, 80vw"
          className="object-cover"
        />
      ),
    },
    {
      id: "quality",
      shape: "portrait",
      kicker: "Quality check",
      caption: "Checked before it ships",
      media: (
        <SmartImage
          src="/images/about/quality-check.jpg"
          alt="Checking a Nice Smile bundle before it ships"
          hint="Hands checking a Nice Smile bundle before it's sealed"
          fill
          sizes="(min-width: 1024px) 30vw, 70vw"
          className="object-cover"
        />
      ),
    },
    {
      id: "sweet",
      shape: "square",
      kicker: "Nice Smile",
      caption: "Hello, sweet tooth",
      media: (
        <Image
          src="/products/B0G318R9JG/g8.jpg"
          alt="Hello sweet tooth: Nice Smile Candy Clean toothpaste with pink and blue candyfloss"
          fill
          sizes="(min-width: 1024px) 36vw, 80vw"
          className="object-cover"
        />
      ),
    },
  ];

  return (
    <>
      <ScrollProgress />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: `About ${site.name}`,
            url: `${site.url}/about`,
            description,
            mainEntity: {
              "@type": "Organization",
              name: site.name,
              url: site.url,
              logo: `${site.url}${site.logo}`,
              slogan: site.tagline,
              brand: brandFacts.brands.map((name) => ({ "@type": "Brand", name })),
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: site.url },
              { "@type": "ListItem", position: 2, name: "About", item: `${site.url}/about` },
            ],
          },
        ]}
      />

      {/* 1. Manifesto hero */}
      <section aria-label="About PoundMart" className="relative overflow-x-clip bg-cream pt-[var(--header-h)]">
        <div
          aria-hidden
          className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]"
        />
        <div className="container-x relative pb-20 pt-10 sm:pt-14 lg:pb-28 lg:pt-14">
          <HeroScrollFx>
            <Reveal y={12}>
              <span className="eyebrow inline-flex items-center gap-2 text-ink-soft">
                <span aria-hidden className="size-1.5 rounded-full bg-sun-deep" />
                About PoundMart
              </span>
            </Reveal>
            <SplitHeading
              as="h1"
              immediate
              delay={0.1}
              text="Everyday essentials shouldn't cost *a fortune*."
              className="type-display mt-6 max-w-[19ch] text-[clamp(3.1rem,7.8vw,8rem)] text-ink"
              accentClassName="text-ink-soft"
            />
          </HeroScrollFx>

          <div className="mt-10 grid gap-12 lg:mt-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <Reveal y={20} delay={0.45}>
                <p className="max-w-[46ch] text-lg leading-relaxed text-ink-muted sm:text-xl">
                  We&apos;re PoundMart, a UK-based seller with one simple idea: take the everyday essentials you already reach for,
                  bundle them into multi-packs, and let the value do the talking. Genuine brands, checked by us, on Amazon.
                </p>
              </Reveal>
              <Reveal y={20} delay={0.55} className="mt-8 flex flex-wrap gap-3">
                <AmazonButton href={amazon.store()} placement="about-hero">
                  Shop the Amazon store
                </AmazonButton>
                <ButtonLink href="/shop" variant="outline" size="lg">
                  Browse the bundles
                </ButtonLink>
              </Reveal>
              <Reveal y={12} delay={0.65}>
                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                  {heroFacts.map(({ icon: Icon, label }) => (
                    <li key={label} className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                      <span className="grid size-7 place-items-center rounded-full bg-sun-soft">
                        <Icon aria-hidden className="size-3.5" />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div className="relative hidden h-[300px] sm:block lg:col-span-6 lg:h-[360px]">
              <Reveal y={0} scale={0.6} delay={0.7} className="absolute right-[2%] top-[-6%] z-10 w-[26%] max-w-44">
                <Parallax offset={-40} rotate={14}>
                  <Seal id="about-hero" tone="sun" text="Home of great value bundles • " />
                </Parallax>
              </Reveal>
              <Parallax offset={50} rotate={-2} className="absolute left-[4%] top-0 w-[46%] lg:left-[12%]">
                <Reveal y={40} delay={0.5}>
                  <div className="relative aspect-square -rotate-6 overflow-hidden rounded-4xl border-[6px] border-paper shadow-lift transition-transform duration-700 ease-out-expo hover:-rotate-2 hover:scale-[1.03]">
                    <Image
                      src="/products/B0HBXLVW4S/g6.jpg"
                      alt="Nice Smile Feelin' Grape, Watermelon Fresh and Peachy Clean tubes on a bathroom counter"
                      fill
                      sizes="(min-width: 1024px) 22vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              </Parallax>
              <Parallax offset={-30} rotate={3} className="absolute bottom-0 right-[2%] w-[44%]">
                <Reveal y={40} delay={0.62}>
                  <div className="relative aspect-square rotate-6 overflow-hidden rounded-4xl border-[6px] border-paper shadow-lift transition-transform duration-700 ease-out-expo hover:rotate-2 hover:scale-[1.03]">
                    <Image
                      src="/products/B0GKYHKMRG/g4.jpg"
                      alt="XHC shampoo and conditioner bars: travel and hand luggage friendly"
                      fill
                      sizes="(min-width: 1024px) 22vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              </Parallax>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand film, revealed by scroll */}
      <FilmReveal
        eyebrow={site.tagline}
        title="One box. The whole bathroom *sorted*."
        text="Big bundles of the essentials your household gets through fastest, at a price that makes stocking up the obvious choice."
      />

      {/* 3. Verified facts, on tape */}
      <FactTapes
        label="PoundMart at a glance"
        top={[brandFacts.soldBy, brandFacts.dispatchedBy, brandFacts.returns, brandFacts.base]}
        bottom={["Genuine branded products", "No knockoffs", "No grey-market stock", brandFacts.packing]}
      />

      {/* 4. Story */}
      <section aria-labelledby="story-title" className="relative overflow-x-clip bg-paper pb-28 pt-4 sm:pb-36 lg:pb-44">
        <div className="container-x">
          <Reveal y={12}>
            <h2 id="story-title" className="eyebrow inline-flex items-center gap-2 text-ink-soft">
              <span aria-hidden className="size-1.5 rounded-full bg-sun-deep" />
              Who we are, in one breath
            </h2>
          </Reveal>
          <StoryReveal
            segments={story}
            className="mt-8 max-w-6xl font-display text-[clamp(1.8rem,4.3vw,3.9rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-ink"
          />

          <div className="mt-20 grid grid-cols-2 gap-4 sm:gap-6 lg:mt-28 lg:grid-cols-12">
            <Parallax offset={30} className="col-span-1 lg:col-span-4 lg:mt-24">
              <Reveal y={40}>
                <figure className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-4xl bg-sand shadow-soft">
                    <Image
                      src="/brand/conditioner-3pack-table.jpg"
                      alt="XHC No Rinse conditioners in Cherry & Almond, Dragon Fruit & Vanilla and Mango & Coconut on a wooden shelf"
                      fill
                      sizes="(min-width: 1024px) 30vw, 45vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="mt-3 text-sm font-medium text-ink-muted">The XHC no-rinse trio</figcaption>
                </figure>
              </Reveal>
            </Parallax>
            <Parallax offset={-20} className="col-span-1 lg:col-span-5">
              <Reveal y={40} delay={0.08}>
                <figure className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-4xl bg-sand shadow-soft lg:aspect-[5/6]">
                    <Image
                      src="/products/B0FLFZ2Z6C/g2.jpg"
                      alt="Nice Smile Yummy Gummy, Berry Burst and Candy Clean tubes by a bathroom sink"
                      fill
                      sizes="(min-width: 1024px) 38vw, 45vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="mt-3 text-sm font-medium text-ink-muted">Morning routine, sorted</figcaption>
                </figure>
              </Reveal>
            </Parallax>
            <Parallax offset={50} className="col-span-2 lg:col-span-3 lg:mt-48">
              <Reveal y={40} delay={0.16}>
                <figure className="group">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-4xl bg-sand shadow-soft lg:aspect-[4/5]">
                    <Image
                      src="/products/B0GBMH1N54/a3.png"
                      alt="XHC Argan Oil conditioner on a wooden bathroom shelf with a hairbrush and towel"
                      fill
                      sizes="(min-width: 1024px) 24vw, 90vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="mt-3 text-sm font-medium text-ink-muted">Argan oil, everyday</figcaption>
                </figure>
              </Reveal>
            </Parallax>
          </div>
        </div>
      </section>

      {/* 5. How a bundle comes together */}
      <section aria-label="How a bundle comes together" className="relative overflow-x-clip bg-cream py-28 sm:py-36 lg:py-44">
        <div className="container-x">
          <SectionHeading
            align="center"
            eyebrow="The PoundMart way"
            title="How a bundle *comes together*."
            intro="Four steps between a good idea and your bathroom shelf."
          />
          <div className="mt-12 lg:mt-20">
            <BundleTimeline steps={steps} finale="Hello, bathroom shelf." />
          </div>
          <p className="mt-10 text-center text-xs text-ink-muted">
            Prices checked {formatDate(site.catalogCheckedAt)}; Amazon shows the live price.
          </p>
        </div>
      </section>

      {/* 6. What we will never sell */}
      <section aria-label="What we will never sell" className="grain relative overflow-x-clip bg-ink-night py-28 text-cream sm:py-36 lg:py-44">
        <div className="container-x relative z-2">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              tone="light"
              eyebrow="Non-negotiables"
              title="What we will *never* sell."
              intro="Cheap should never mean dodgy. Great value only counts when what's in the box is the real thing."
            />
            <Reveal y={0} scale={0.7} className="w-32 shrink-0 self-start sm:w-40 lg:self-end">
              <Seal id="never" tone="sun" text="Genuine brands • Checked by us • " />
            </Reveal>
          </div>
          <div className="mt-14 lg:mt-20">
            <NeverSell
              items={[
                { word: "Knockoffs", note: "Lookalike packaging and copycat formulas have no place in a PoundMart bundle." },
                { word: "Grey-market stock", note: "Products sold outside the brand's official channels. Not in our boxes, not ever." },
              ]}
            />
          </div>
          <Reveal y={32} className="mt-16 flex flex-col gap-6 sm:flex-row sm:items-center lg:mt-24">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-sun text-ink-deep shadow-glow sm:size-20">
              <BadgeCheck aria-hidden className="size-8 sm:size-10" />
            </span>
            <p className="type-display text-[clamp(2rem,4.6vw,4.2rem)] text-cream">
              Only genuine branded products. <span className="accent-serif text-sun">Every tube, bottle and bar.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* 7. The brands we bundle */}
      <section aria-label="The brands we bundle" className="relative overflow-x-clip bg-paper py-28 sm:py-36 lg:py-44">
        <div className="container-x">
          <SectionHeading
            eyebrow="The brands we bundle"
            title="Two brands. *Plenty* of personality."
            intro="We keep the line-up tight and the quality high: brands we're proud to put in a PoundMart box."
          />
          <div className="mt-16 lg:mt-24">
            <BrandPanels />
          </div>
        </div>
      </section>

      {/* 8. Values */}
      <section aria-label="What we stand for" className="relative overflow-x-clip bg-sun py-28 sm:py-36 lg:py-44">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="container-x relative">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="What we stand for"
              title="Small prices. *Big* standards."
              intro={<span className="text-ink/85">The principles behind every bundle we put together, from the first tube to the final box.</span>}
            />
            <Reveal y={16} delay={0.1}>
              <ButtonLink href="/faq" variant="ink" size="lg">
                Read the FAQs
              </ButtonLink>
            </Reveal>
          </div>
          <div className="mt-14 lg:mt-20">
            <ValuesGrid />
          </div>
        </div>
      </section>

      {/* 9. Behind the bundles */}
      <BehindGallery
        eyebrow="Behind the bundles"
        title="From our shelves to *your* bathroom."
        intro="A peek at the real-life side of PoundMart, from genuine stock to the finished bundle."
        items={gallery}
      />

      {/* 10. Closing CTA */}
      <AboutCta />
    </>
  );
}
