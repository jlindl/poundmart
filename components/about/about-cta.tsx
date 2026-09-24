import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, RotateCcw, Truck } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { Seal } from "@/components/about/seal";
import { amazon, brandFacts } from "@/lib/site";

const facts = [
  { icon: BadgeCheck, label: brandFacts.soldBy },
  { icon: Truck, label: brandFacts.dispatchedBy },
  { icon: RotateCcw, label: brandFacts.returns },
];

/** Closing call to action for the About page. */
export function AboutCta() {
  return (
    <section aria-labelledby="about-cta-title" className="grain relative overflow-hidden bg-ink py-28 text-cream sm:py-36 lg:py-44 [&_:focus-visible]:outline-sun">
      <div aria-hidden className="absolute -bottom-1/3 -left-1/4 aspect-square w-[70vw] max-w-[900px] rounded-full bg-ink-soft/30 blur-3xl" />

      <div className="container-x relative z-2 grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal y={12}>
            <span className="eyebrow inline-flex items-center gap-2 text-sun">
              <span aria-hidden className="size-1.5 rounded-full bg-sun" />
              Ready when you are
            </span>
          </Reveal>
          <div id="about-cta-title">
            <SplitHeading
              text="Your next bundle is *waiting*."
              className="type-display mt-5 max-w-[12ch] text-[clamp(3rem,7.4vw,7rem)] text-cream"
              accentClassName="text-sun"
            />
          </div>
          <Reveal y={16} delay={0.1}>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-cream/75 sm:text-xl">
              Every PoundMart bundle lives in our Amazon store. Stock up on the essentials your household gets through fastest, and
              let the value do the talking.
            </p>
          </Reveal>
          <Reveal y={16} delay={0.18} className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic>
              <AmazonButton href={amazon.store()} placement="about-final" size="xl">
                Visit our Amazon store
              </AmazonButton>
            </Magnetic>
            <ButtonLink href="/shop" variant="glass" size="xl">
              Shop all bundles
            </ButtonLink>
          </Reveal>
          <Reveal y={12} delay={0.24}>
            <Link
              href="/blog"
              className="group mt-8 inline-flex items-center gap-2 font-semibold text-cream/85 transition-colors hover:text-sun"
            >
              <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-sun after:transition-transform after:duration-300 group-hover:after:origin-left group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">
                Or get the lowdown on the PoundMart blog
              </span>
              <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-cream/10 pt-6">
            {facts.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2 text-sm text-cream/75">
                <Icon aria-hidden className="size-4 text-sun" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-square w-full max-w-[520px]">
            <Parallax offset={40} rotate={-3} className="absolute left-0 top-[8%] w-[62%]">
              <div className="group relative aspect-[4/5] -rotate-6 overflow-hidden rounded-4xl bg-sun-pale shadow-lift transition-transform duration-700 ease-out-expo hover:-rotate-3 hover:scale-[1.03]">
                <Image
                  src="/products/B0HBXLVW4S/g1.jpg"
                  alt="Nice Smile 12 Pack: twelve tubes of Watermelon Fresh, Feelin' Grape and Peachy Clean toothpaste"
                  fill
                  sizes="(min-width: 1024px) 22vw, 60vw"
                  className="product-cutout object-contain p-[10%]"
                />
                <span className="absolute bottom-4 left-4 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cream">
                  12 tubes
                </span>
              </div>
            </Parallax>
            <Parallax offset={-44} rotate={4} className="absolute bottom-[2%] right-0 w-[54%]">
              <div className="group relative aspect-[4/5] rotate-6 overflow-hidden rounded-4xl bg-[#F3E8DB] shadow-lift transition-transform duration-700 ease-out-expo hover:rotate-2 hover:scale-[1.03]">
                <Image
                  src="/products/B0GBMH1N54/g1.jpg"
                  alt="XHC Argan Oil shampoo and conditioner set"
                  fill
                  sizes="(min-width: 1024px) 20vw, 55vw"
                  className="product-cutout object-contain p-[12%]"
                />
                <span className="absolute bottom-4 left-4 rounded-full bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
                  Wash-day set
                </span>
              </div>
            </Parallax>
            <Seal id="about-cta" tone="sun" text="Home of great value bundles • PoundMart • " className="absolute right-[3%] top-0 w-[30%]" />
          </div>
        </div>
      </div>
    </section>
  );
}
