import Image from "next/image";
import { BadgeCheck, RotateCcw, Truck } from "lucide-react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { Magnetic } from "@/components/motion/magnetic";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { ScrollSpin } from "@/components/blog/scroll-effects";
import { brandFacts } from "@/lib/site";

const facts = [
  { icon: BadgeCheck, label: brandFacts.soldBy },
  { icon: Truck, label: brandFacts.dispatchedBy },
  { icon: RotateCcw, label: brandFacts.returns },
];

const packshots = [
  {
    src: "/products/B0HBXLVW4S/g1.jpg",
    wrap: "left-[4%] top-[6%] w-[46%]",
    offset: 40,
    rotate: -6,
  },
  {
    src: "/products/B0G3BS11B8/g1.jpg",
    wrap: "right-0 top-0 w-[44%]",
    offset: 90,
    rotate: 5,
  },
  {
    src: "/products/B0H9YX3DG3/g1.jpg",
    wrap: "bottom-0 right-[16%] w-[48%]",
    offset: 140,
    rotate: -3,
  },
];

/**
 * The closing conversion band used across the blog: an Amazon CTA plus the
 * required backlinks to the homepage and the shop.
 */
export function BacklinkBand({
  eyebrow,
  title,
  text,
  placement,
  amazonHref,
  amazonLabel = "Shop on Amazon",
  homeLabel = "Explore PoundMart",
}: {
  eyebrow: string;
  /** Wrap accent words in *asterisks*. */
  title: string;
  text: string;
  placement: string;
  amazonHref: string;
  amazonLabel?: string;
  homeLabel?: string;
}) {
  return (
    <section className="grain relative overflow-hidden bg-sun py-24 text-ink-deep sm:py-32 lg:py-40">
      <div aria-hidden className="dot-grid absolute inset-0 opacity-50" />
      <ScrollSpin turns={0.35} className="pointer-events-none absolute -left-24 -top-24 size-72 opacity-[0.12] sm:size-96">
        <Image src="/brand/mark.png" alt="" width={278} height={278} className="size-full" />
      </ScrollSpin>

      <div className="container-x relative z-[2] grid items-center gap-16 grid-cols-1 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal y={12}>
            <p className="eyebrow inline-flex items-center gap-2 text-ink">
              <span aria-hidden className="size-1.5 rounded-full bg-ink" />
              {eyebrow}
            </p>
          </Reveal>
          <SplitHeading
            as="h2"
            text={title}
            className="type-display mt-5 max-w-[14ch] text-[clamp(2.9rem,7.4vw,6.75rem)] text-ink-deep"
            accentClassName="text-ink"
          />
          <Reveal delay={0.15} y={16}>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-deep/85">{text}</p>
          </Reveal>
          <Reveal delay={0.25} y={16}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <AmazonButton href={amazonHref} placement={placement} variant="ink" size="lg">
                  {amazonLabel}
                </AmazonButton>
              </Magnetic>
              <ButtonLink href="/" variant="light" size="lg">
                {homeLabel}
              </ButtonLink>
              <ButtonLink href="/shop" variant="outline" size="lg" className="border-ink/25">
                Browse the shop
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.35} y={12}>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-ink-deep">
              {facts.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-full bg-ink-deep text-sun">
                    <Icon aria-hidden className="size-3.5" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[30rem] lg:col-span-5">
          {packshots.map((p) => (
            <Parallax key={p.src} offset={p.offset} rotate={p.rotate} className={`absolute aspect-square ${p.wrap}`}>
              <div className="relative size-full rounded-full bg-paper shadow-lift ring-8 ring-white/40">
                <Image src={p.src} alt="" fill sizes="(min-width: 1024px) 15vw, 45vw" className="product-cutout object-contain p-[14%]" />
              </div>
            </Parallax>
          ))}
        </div>
      </div>
    </section>
  );
}
