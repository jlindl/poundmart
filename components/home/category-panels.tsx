import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import type { TickerItem } from "./types";

type Panel = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  accent: string;
  count: number;
  flavours?: TickerItem[];
};

type Props = {
  toothpaste: Panel;
  haircare: Panel;
  bundles: Panel;
  fresh: Panel;
};

/** Big lifestyle panels per category that widen on hover, plus two smaller collection tiles. */
export function CategoryPanels({ toothpaste, haircare, bundles, fresh }: Props) {
  return (
    <section className="relative bg-cream py-24 md:py-32 lg:py-40">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Shop by category"
            title="Two brands. *One* happy bathroom."
            intro={
              <p className="text-ink-soft">
                Nice Smile makes brushing the best bit of the day. XHC Xpert Haircare sorts wash day. We bundle both for less.
              </p>
            }
          />
          <Reveal delay={0.2} className="shrink-0">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-ink/15 px-5 py-3 font-semibold text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-cream"
            >
              Browse everything
              <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <Reveal y={48} className="mt-14">
          <div className="flex flex-col gap-4 lg:h-[clamp(560px,72vh,700px)] lg:flex-row">
            <BigPanel
              panel={toothpaste}
              brand="Nice Smile"
              image="/products/B0HBXLVW4S/g6.jpg"
              imageAlt="Nice Smile Feelin' Grape, Watermelon Fresh and Peachy Clean toothpaste tubes on a marble bathroom counter"
              packshot="/products/B0HBXLVW4S/g1.jpg"
              countLabel={`${toothpaste.flavours?.length ?? 0} flavours`}
              objectPosition="50% 45%"
            />
            <BigPanel
              panel={haircare}
              brand="XHC Xpert Haircare"
              image="/products/B0GBMH1N54/a8.png"
              imageAlt="Woman with long, glossy curls next to a tube of XHC Argan Oil conditioner"
              packshot="/products/B0G3BS11B8/g1.jpg"
              countLabel={`${haircare.flavours?.length ?? 0} scents`}
              objectPosition="35% 40%"
            />
          </div>
        </Reveal>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Reveal delay={0.05}>
            <SmallTile panel={bundles} tone="sun" packshot="/products/B0H9YX3DG3/g1.jpg" label="Stock up and save" />
          </Reveal>
          <Reveal delay={0.12}>
            <SmallTile panel={fresh} tone="mint" packshot="/products/B0GMXQNCYN/g1.jpg" label="Just landed" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BigPanel({
  panel,
  brand,
  image,
  imageAlt,
  packshot,
  countLabel,
  objectPosition,
}: {
  panel: Panel;
  brand: string;
  image: string;
  imageAlt: string;
  packshot: string;
  countLabel: string;
  objectPosition: string;
}) {
  return (
    <Link
      href={`/collections/${panel.slug}`}
      className={cn(
        "group/panel relative isolate flex min-h-[520px] flex-1 cursor-pointer flex-col justify-end overflow-hidden rounded-5xl bg-ink-deep text-cream shadow-soft",
        "transition-[flex-grow,box-shadow] duration-700 ease-[var(--ease-out-expo)] hover:shadow-lift lg:min-h-0 lg:hover:grow-[1.55] lg:focus-visible:grow-[1.55]",
      )}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="-z-20 object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover/panel:scale-[1.06]"
        style={{ objectPosition }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-night/95 via-ink-night/45 to-transparent" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-0 mix-blend-multiply transition-opacity duration-700 group-hover/panel:opacity-35"
        style={{ background: panel.accent }}
      />

      {/* Top row */}
      <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3 sm:inset-x-7 sm:top-7">
        <span className="rounded-full bg-paper/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-ink backdrop-blur">
          {brand}
        </span>
        <span className="rounded-full border border-cream/25 bg-ink-night/75 px-3.5 py-1.5 text-xs font-semibold text-cream backdrop-blur">
          {panel.count} products · {countLabel}
        </span>
      </div>

      {/* Packshot that rises on hover */}
      <div
        aria-hidden
        className="absolute right-6 top-20 hidden size-36 translate-y-4 rotate-6 rounded-full bg-paper/95 opacity-0 shadow-lift transition-all duration-700 ease-[var(--ease-spring)] group-hover/panel:translate-y-0 group-hover/panel:rotate-0 group-hover/panel:opacity-100 lg:block xl:size-44"
      >
        <Image src={packshot} alt="" fill sizes="176px" className="product-cutout object-contain p-5" />
      </div>

      {/* Copy */}
      <div className="relative p-6 sm:p-9">
        <span className="accent-serif text-2xl text-sun">{panel.eyebrow}</span>
        <h3 className="type-display mt-1 text-[clamp(3rem,6vw,5.5rem)]">{panel.title}</h3>
        <p className="mt-3 max-w-[42ch] text-cream/85">{panel.description}</p>
        {panel.flavours && (
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={`${panel.title} ${countLabel}`}>
            {panel.flavours.map((f) => (
              <li
                key={f.name}
                className="inline-flex items-center gap-1.5 rounded-full bg-cream/10 px-2.5 py-1 text-xs font-medium text-cream backdrop-blur"
              >
                <span aria-hidden className="size-2 rounded-full" style={{ background: f.color }} />
                {f.name}
              </li>
            ))}
          </ul>
        )}
        <span className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-sun px-6 font-semibold text-ink-deep transition-[gap,padding] duration-500 ease-[var(--ease-out-expo)] group-hover/panel:gap-4 group-hover/panel:pr-7">
          Shop {panel.title.toLowerCase()}
          <ArrowRight aria-hidden className="size-4" />
        </span>
      </div>
    </Link>
  );
}

function SmallTile({ panel, tone, packshot, label }: { panel: Panel; tone: "sun" | "mint"; packshot: string; label: string }) {
  return (
    <Link
      href={`/collections/${panel.slug}`}
      className={cn(
        "group relative flex min-h-[220px] cursor-pointer items-center gap-4 overflow-hidden rounded-5xl p-6 transition-[translate,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-lift sm:p-8",
        tone === "sun" ? "bg-sun text-ink-deep" : "bg-[#DDF5EF] text-ink-deep",
      )}
    >
      <div className="relative z-10 flex flex-1 flex-col gap-2">
        <span className="eyebrow">{label}</span>
        <h3 className="type-display text-[clamp(2rem,3.4vw,3rem)]">{panel.title}</h3>
        <p className="max-w-[30ch] text-sm leading-relaxed text-ink">
          {panel.count} products. {firstSentence(panel.description)}
        </p>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold">
          <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">
            Explore {panel.title.toLowerCase()}
          </span>
          <ArrowUpRight
            aria-hidden
            className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </div>
      <div className="relative aspect-square w-[42%] max-w-[220px] shrink-0">
        <span
          aria-hidden
          className="absolute inset-[6%] rounded-full bg-white/60 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110"
        />
        <Image
          src={packshot}
          alt=""
          fill
          sizes="(min-width: 640px) 220px, 40vw"
          className="product-cutout object-contain p-[10%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-6 group-hover:scale-110"
        />
      </div>
    </Link>
  );
}

function firstSentence(text: string) {
  return text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
}
