import Image from "next/image";
import { BadgeCheck, RotateCcw, Truck } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { ClipReveal, ScrollScale } from "@/components/shop/scroll-fx";
import { brandFacts } from "@/lib/site";
import { cn } from "@/lib/utils";

type CtaImage = { src: string; alt: string; width: number; height: number; cutout?: boolean; position?: string };

/**
 * The closing conversion band used at the foot of shop, collection and product
 * pages: a sunshine panel with the headline, the Amazon button and a
 * scroll-revealed image.
 */
export function CtaBand({
  id,
  eyebrow = "Ready when you are",
  title,
  body,
  primary,
  secondary,
  image = {
    src: "/brand/family-bundle-poster.png",
    alt: "A family on the sofa unboxing a PoundMart bundle of Nice Smile toothpaste",
    width: 1770,
    height: 753,
    position: "72% 50%",
  },
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  body: string;
  primary: { href: string; placement: string; label: string; asin?: string };
  secondary?: { href: string; label: string };
  image?: CtaImage;
  className?: string;
}) {
  const facts = [
    { icon: BadgeCheck, label: brandFacts.soldBy },
    { icon: Truck, label: brandFacts.dispatchedBy },
    { icon: RotateCcw, label: brandFacts.returns },
  ];
  return (
    <section id={id} className={cn("py-16 sm:py-24", className)}>
      <div className="container-x">
        <div className="grain relative overflow-hidden rounded-[2.25rem] bg-sun sm:rounded-5xl">
          <div aria-hidden className="absolute -left-24 -top-24 size-80 rounded-full bg-white/25 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 right-1/3 size-96 rounded-full bg-sun-deep/40 blur-3xl" />
          <div className="relative z-[2] grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:p-16">
            <div>
              <Reveal y={12}>
                <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-ink/10 px-3 py-1.5 text-ink">
                  <span aria-hidden className="size-1.5 rounded-full bg-ink" />
                  {eyebrow}
                </span>
              </Reveal>
              <SplitHeading
                text={title}
                className="type-display mt-5 max-w-[14ch] text-[clamp(2.5rem,6vw,5.25rem)] text-ink-deep"
                accentClassName="text-ink-soft"
              />
              <Reveal delay={0.15} y={16}>
                <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink/80">{body}</p>
              </Reveal>
              <Reveal delay={0.25} y={16}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Magnetic className="max-sm:w-full">
                    <AmazonButton
                      href={primary.href}
                      placement={primary.placement}
                      asin={primary.asin}
                      variant="ink"
                      size="xl"
                      className="max-sm:h-14 max-sm:w-full max-sm:gap-2 max-sm:px-5 max-sm:text-base"
                    >
                      {primary.label}
                    </AmazonButton>
                  </Magnetic>
                  {secondary && (
                    <ButtonLink href={secondary.href} variant="ghost" size="lg" className="text-ink-deep hover:bg-ink/10">
                      {secondary.label}
                    </ButtonLink>
                  )}
                </div>
              </Reveal>
              <Reveal delay={0.35} y={12}>
                <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-ink/80">
                  {facts.map(({ icon: Icon, label }) => (
                    <li key={label} className="inline-flex items-center gap-1.5">
                      <Icon aria-hidden className="size-4 text-ink" />
                      {label}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div className="relative">
              <ClipReveal className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-sun-soft shadow-lift sm:rounded-5xl">
                <ScrollScale>
                  {/* Background sits inside the scaled layer so a cutout packshot's multiply blend has something to knock out against */}
                  <div className={cn("relative h-full w-full", image.cutout && "bg-sun-soft")}>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 42vw, 90vw"
                      className={cn(image.cutout ? "product-cutout object-contain p-[8%]" : "object-cover")}
                      style={image.position ? { objectPosition: image.position } : undefined}
                    />
                  </div>
                </ScrollScale>
              </ClipReveal>
              <div
                aria-hidden
                className="absolute -bottom-5 -left-3 grid size-20 place-items-center rounded-full bg-paper shadow-lift sm:-bottom-7 sm:-left-7 sm:size-28"
              >
                <Image src="/brand/mark.png" alt="" width={278} height={278} className="w-[68%] animate-float" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
