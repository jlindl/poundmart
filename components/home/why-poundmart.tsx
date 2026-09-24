import Image from "next/image";
import type { ReactNode } from "react";
import { BadgeCheck, PackageCheck, RotateCcw, Truck, type LucideIcon } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AmazonButton } from "@/components/ui/amazon-link";
import { SmartImage } from "@/components/ui/image-slot";
import { SectionHeading } from "@/components/ui/section-heading";
import { brandFacts } from "@/lib/site";
import { cn, parseAccent } from "@/lib/utils";
import { StackCards } from "./stack-cards";

type Stats = { products: number; flavours: number; ratings: number; average: number };

export function WhyPoundMart({ stats, storeHref }: { stats: Stats; storeHref: string }) {
  return (
    <section className="grain relative bg-ink py-24 text-cream md:py-32 lg:py-40">
      <div className="container-x relative z-[2] grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="[@media(min-width:1024px)_and_(min-height:800px)]:sticky [@media(min-width:1024px)_and_(min-height:800px)]:top-[calc(var(--header-h)+2.5rem)]">
            <SectionHeading
              tone="light"
              eyebrow="Why PoundMart"
              title="Great value. *No* catch."
              intro="Bundles are only a bargain if you can trust what's inside. Here's what you get every time you order a PoundMart bundle."
            />
            <RevealGroup as="ul" className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-cream/15 pt-10">
              <Stat value={<CountUp to={stats.products} />} label="products to shop on Amazon" />
              <Stat value={<CountUp to={stats.flavours} />} label="flavours and scents" />
              <Stat value={<CountUp to={stats.ratings} />} label="Amazon ratings so far" />
              <Stat value={<CountUp to={stats.average} decimals={1} />} label="average Amazon star rating" suffix="★" />
            </RevealGroup>
            <Reveal delay={0.2} className="mt-10">
              <AmazonButton href={storeHref} placement="home-why" size="lg" className="focus-visible:outline-sun">
                Shop with confidence
              </AmazonButton>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7">
          <StackCards>
            <FactCard
              n="01"
              icon={BadgeCheck}
              eyebrow="Genuine brands"
              title="The real thing, *every* time."
              text={`${brandFacts.authenticity} Just Nice Smile and XHC Xpert Haircare, the brands on the box.`}
              className="bg-sun text-ink-deep"
              media={
                <Image
                  src="/products/B0G318R9JG/a2.jpg"
                  alt="Nice Smile Feelin' Grape, Peachy Clean and Watermelon Fresh tubes standing on white display blocks"
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              }
            />
            <FactCard
              n="02"
              icon={PackageCheck}
              eyebrow="Packed in the UK"
              title="Packed and *checked* by us."
              text="Every bundle is packaged and quality-checked by PoundMart, a UK-based business. We pack the kind of box we'd be happy to open ourselves."
              className="bg-paper text-ink"
              media={
                <SmartImage
                  src="/images/home/packing-bench.jpg"
                  alt="The PoundMart team packing bundles at the packing bench"
                  hint="Photo to add: the PoundMart team packing bundles at the UK packing bench"
                  accent="#FCD000"
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              }
            />
            <FactCard
              n="03"
              icon={Truck}
              eyebrow="Dispatched by Amazon"
              title="Sold by us. *Sent* by Amazon."
              text="Sold by PoundMart, dispatched by Amazon. You check out with the Amazon account you already use, and your order sits in Your Orders like everything else."
              className="bg-sky text-ink"
              media={
                <Image
                  src="/brand/family-bundle-poster.png"
                  alt="A laughing family on the sofa opening a PoundMart delivery together"
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover object-[68%_50%]"
                />
              }
            />
            <FactCard
              n="04"
              icon={RotateCcw}
              eyebrow="Easy returns"
              title="Changed your *mind*? No drama."
              text={`${brandFacts.returns}. Sending something back works exactly like any other Amazon order.`}
              className="bg-cream text-ink"
              media={
                <div className="absolute inset-0 grid place-items-center bg-sun-soft" aria-hidden>
                  <div className="dot-grid absolute inset-0 opacity-60" />
                  <div className="relative flex flex-col items-center leading-none text-ink">
                    <span className="type-display text-[clamp(7rem,14vw,11rem)]">30</span>
                    <span className="accent-serif -mt-2 text-4xl text-ink-soft">day returns</span>
                  </div>
                  <RotateCcw className="absolute right-6 top-6 size-10 animate-spin-slow text-ink/20 [animation-direction:reverse]" />
                </div>
              }
            />
          </StackCards>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label, suffix }: { value: ReactNode; label: string; suffix?: string }) {
  return (
    <RevealItem as="li" className="flex flex-col gap-1">
      <span className="type-display flex items-baseline gap-1 text-[clamp(2.6rem,4.4vw,3.8rem)] tabular-nums text-sun">
        {value}
        {suffix && (
          <span aria-hidden className="text-[0.5em]">
            {suffix}
          </span>
        )}
      </span>
      <span className="text-sm text-cream/75">{label}</span>
    </RevealItem>
  );
}

function FactCard({
  n,
  icon: Icon,
  eyebrow,
  title,
  text,
  media,
  className,
}: {
  n: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  text: string;
  media: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("grid overflow-hidden rounded-5xl shadow-lift sm:min-h-[420px] sm:grid-cols-2 lg:min-h-[460px]", className)}>
      <div className="flex flex-col justify-between gap-10 p-7 sm:p-9">
        <div className="flex items-center justify-between">
          <span className="grid size-12 place-items-center rounded-full bg-ink/10">
            <Icon aria-hidden className="size-5" />
          </span>
          <span className="font-mono text-sm font-medium opacity-70">{n} / 04</span>
        </div>
        <div>
          <span className="eyebrow opacity-80">{eyebrow}</span>
          <h3 className="type-display mt-3 text-[clamp(2rem,3.2vw,2.9rem)]">
            {parseAccent(title).map((seg, i) =>
              seg.accent ? (
                <span key={i} className="accent-serif pr-[0.06em]">
                  {seg.text}
                </span>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </h3>
          <p className="mt-4 max-w-[40ch] leading-relaxed opacity-85">{text}</p>
        </div>
      </div>
      <div className="relative min-h-[240px] sm:min-h-0">{media}</div>
    </article>
  );
}
