import Image from "next/image";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { RatingSummary } from "@/components/ui/stars";
import { PackshotFan, type FanItem } from "@/components/about/packshot-fan";
import { amazon, type amazonStore } from "@/lib/site";
import { isInStock, products, type Brand } from "@/lib/products";
import { cn } from "@/lib/utils";

type Panel = {
  brand: Brand;
  eyebrow: string;
  name: string;
  accentName: string;
  description: string;
  accent: string;
  accentSoft: string;
  chips: { label: string; colour: string }[];
  facts: { value: string; label: string }[];
  photo: { src: string; alt: string };
  sticker: { src: string; alt: string };
  fan: FanItem[];
  fanLabel: string;
  collection: { href: string; label: string };
  store: keyof typeof amazonStore;
  placement: string;
  storeLabel: string;
};

const panels: Panel[] = [
  {
    brand: "Nice Smile",
    eyebrow: "Oral care",
    name: "Nice",
    accentName: "Smile",
    description:
      "Flavoured whitening fluoride toothpaste that makes brushing the best bit of the bedtime routine. Vegan, cruelty-free and enamel-safe, in six flavours made for kids and grown-ups alike.",
    accent: "#FF5468",
    accentSoft: "#FFE3E6",
    chips: [
      { label: "Watermelon Fresh", colour: "var(--color-watermelon)" },
      { label: "Feelin' Grape", colour: "var(--color-grape)" },
      { label: "Peachy Clean", colour: "var(--color-peach)" },
      { label: "Berry Burst", colour: "var(--color-berry)" },
      { label: "Yummy Gummy", colour: "var(--color-gummy)" },
      { label: "Candy Clean", colour: "var(--color-candy)" },
    ],
    facts: [
      { value: "6", label: "flavours" },
      { value: "60g", label: "tubes" },
      { value: "Vegan", label: "& cruelty-free" },
    ],
    photo: {
      src: "/products/B0G318R9JG/g5.jpg",
      alt: "Nice Smile Yummy Gummy, Berry Burst and Candy Clean toothpaste on a table with party balloons and a gift box",
    },
    sticker: { src: "/products/B0FLWZ7D6T/g3.jpg", alt: "You're one in a melon: Nice Smile Watermelon Fresh toothpaste with watermelon slices" },
    fan: [
      { src: "/products/B0FNYH9TFC/g1.jpg", width: 203, height: 1000 },
      { src: "/products/B0HBXLVW4S/g9.jpg", width: 203, height: 1000 },
      { src: "/products/B0FNYGR43T/g1.jpg", width: 204, height: 1000 },
      { src: "/products/B0FPDJXQRG/g1.jpg", width: 202, height: 1000 },
      { src: "/products/B0FPDJHWN8/g1.jpg", width: 202, height: 1000 },
    ],
    fanLabel: "Nice Smile tubes in Feelin' Grape, Peachy Clean, Watermelon Fresh, Candy Clean and Yummy Gummy",
    collection: { href: "/collections/toothpaste", label: "Explore toothpaste" },
    store: "toothpaste",
    placement: "about-brand-nice-smile",
    storeLabel: "Nice Smile on Amazon",
  },
  {
    brand: "XHC",
    eyebrow: "Haircare",
    name: "XHC",
    accentName: "Xpert Haircare",
    description:
      "Haircare for every hair type. Vegan no-rinse conditioners for curls and coils, Moroccan argan oil shampoo and conditioner, a revitalising rosemary and mint shampoo, and plastic-free 2-in-1 bars for the gym bag.",
    accent: "#9A6A3A",
    accentSoft: "#F3E8DB",
    chips: [
      { label: "No-rinse conditioners", colour: "var(--color-mango)" },
      { label: "Moroccan argan oil", colour: "var(--color-argan)" },
      { label: "Rosemary & mint", colour: "var(--color-mint)" },
      { label: "2-in-1 shampoo bars", colour: "var(--color-dragonfruit)" },
    ],
    facts: [
      { value: "4", label: "haircare ranges" },
      { value: "Vegan", label: "friendly formulas" },
      { value: "2-in-1", label: "plastic-free bars" },
    ],
    photo: {
      src: "/products/B0GBMH1N54/a8.png",
      alt: "A woman with long, glossy curls beside a tube of XHC Argan Oil conditioner",
    },
    sticker: { src: "/products/B0GKYHKMRG/g3.jpg", alt: "XHC Coconut, Banana and Papaya shampoo and conditioner bars with tropical fruit" },
    fan: [
      { src: "/products/B0GMXQNCYN/g7.jpg", width: 274, height: 814 },
      { src: "/products/B0G3BS11B8/g7.jpg", width: 367, height: 1000 },
      { src: "/products/B0G3BS11B8/g9.jpg", width: 369, height: 1000 },
      { src: "/products/B0G3BS11B8/g8.jpg", width: 361, height: 1000 },
      { src: "/products/B0GG7J6QCM/g8.jpg", width: 288, height: 818 },
    ],
    fanLabel: "XHC Rosemary & Mint shampoo, No Rinse conditioners in Cherry & Almond, Mango & Coconut and Dragon Fruit & Vanilla, and Argan Oil shampoo",
    collection: { href: "/collections/haircare", label: "Explore haircare" },
    store: "haircare",
    placement: "about-brand-xhc",
    storeLabel: "XHC on Amazon",
  },
];

/** The best-rated in-stock product for a brand, among listings with a meaningful number of Amazon ratings. */
function topRated(brand: Brand) {
  return products
    .filter((p) => p.brand === brand && isInStock(p) && p.primary.rating !== null && p.primary.reviewCount >= 20)
    .sort((a, b) => (b.primary.rating ?? 0) - (a.primary.rating ?? 0) || b.primary.reviewCount - a.primary.reviewCount)[0];
}

function BrandPanel({ panel, index }: { panel: Panel; index: number }) {
  const flip = index % 2 === 1;
  const star = topRated(panel.brand);

  return (
    <article
      aria-labelledby={`brand-${index}`}
      className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16"
      style={{ ["--accent" as string]: panel.accent }}
    >
      {/* Stage */}
      <Reveal y={48} className={cn("lg:col-span-7", flip && "lg:order-2")}>
        <div
          className="group relative aspect-[4/5] overflow-hidden rounded-5xl sm:aspect-[5/4] lg:aspect-[6/5]"
          style={{ backgroundColor: panel.accentSoft }}
        >
          <div aria-hidden className="dot-grid absolute inset-0 opacity-60" />
          <div
            aria-hidden
            className="absolute -right-[20%] -top-[25%] aspect-square w-[70%] rounded-full opacity-25 blur-3xl"
            style={{ backgroundColor: panel.accent }}
          />

          <Parallax offset={28} className="absolute right-[5%] top-[5%] w-[60%] sm:w-[54%]">
            <div className="relative aspect-square rotate-2 overflow-hidden rounded-4xl shadow-lift transition-transform duration-700 ease-out-expo group-hover:rotate-0 group-hover:scale-[1.02]">
              <Image src={panel.photo.src} alt={panel.photo.alt} fill sizes="(min-width: 1024px) 32vw, 60vw" className="object-cover" />
            </div>
          </Parallax>

          <Parallax offset={-44} rotate={5} className="absolute left-[6%] top-[7%] hidden w-[27%] sm:block">
            <div className="relative aspect-square -rotate-6 overflow-hidden rounded-3xl border-4 border-paper shadow-lift">
              <Image src={panel.sticker.src} alt={panel.sticker.alt} fill sizes="(min-width: 1024px) 16vw, 25vw" className="object-cover" />
            </div>
          </Parallax>

          <div aria-hidden className="absolute -bottom-[22%] -left-[12%] aspect-square w-[78%] rounded-full bg-paper/90" />
          <PackshotFan items={panel.fan} label={panel.fanLabel} className="absolute bottom-[5%] left-[3%] h-[56%] w-[58%]" />

          {star?.primary.rating && (
            <div className="absolute bottom-4 right-4 z-10 flex max-w-[60%] flex-col gap-0.5 rounded-3xl bg-paper/95 px-4 py-3 shadow-soft backdrop-blur sm:bottom-6 sm:right-6">
              <RatingSummary rating={star.primary.rating} count={star.primary.reviewCount} className="text-xs sm:text-sm" />
              <span className="text-[11px] leading-snug text-ink-muted">Amazon rating: {star.name}</span>
            </div>
          )}
        </div>
      </Reveal>

      {/* Copy */}
      <div className={cn("lg:col-span-5", flip && "lg:order-1")}>
        <Reveal y={20}>
          <span className="eyebrow inline-flex items-center gap-2 text-ink-soft">
            <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: panel.accent }} />
            {panel.eyebrow}
          </span>
        </Reveal>
        <Reveal y={28} delay={0.05}>
          <h3 id={`brand-${index}`} className="type-display mt-4 text-[clamp(3rem,6.6vw,6rem)] text-ink">
            {panel.name} <span className="accent-serif block text-[0.62em] leading-[1.05] text-ink-soft sm:inline sm:text-[1em]">{panel.accentName}</span>
          </h3>
        </Reveal>
        <Reveal y={20} delay={0.1}>
          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-ink-muted">{panel.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${panel.brand} range`}>
            {panel.chips.map((c) => (
              <li key={c.label} className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-sm font-medium text-ink">
                <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: c.colour }} />
                {c.label}
              </li>
            ))}
          </ul>
          <dl className="mt-8 grid grid-cols-3 gap-3 border-y border-line py-5">
            {panel.facts.map((f) => (
              <div key={f.label} className="flex flex-col-reverse gap-1">
                <dt className="text-xs leading-snug text-ink-muted">{f.label}</dt>
                <dd className="font-display text-xl font-bold leading-none tracking-tight text-ink sm:text-2xl">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <AmazonButton href={amazon.store(panel.store)} placement={panel.placement} size="md">
              {panel.storeLabel}
            </AmazonButton>
            <ButtonLink href={panel.collection.href} variant="outline" size="md">
              {panel.collection.label}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </article>
  );
}

/** The two brands PoundMart bundles, each with a photo stage, a fan of packshots and routes to shop. */
export function BrandPanels() {
  return (
    <div className="flex flex-col gap-24 lg:gap-36">
      {panels.map((p, i) => (
        <BrandPanel key={p.brand} panel={p} index={i} />
      ))}
    </div>
  );
}
