import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

type WashDayProduct = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  accentSoft: string;
  fromLabel: string | null;
  multiple: boolean;
};

const MOSAIC = {
  left: [
    {
      src: "/products/B0GBMH1N54/a8.png",
      alt: "Woman with long, defined curls beside a tube of XHC Argan Oil conditioner",
      href: "/shop/xhc-argan-oil-conditioner-twin-pack",
      label: "Argan Oil Conditioner",
    },
    {
      src: "/products/B0GKYHKMRG/g5.jpg",
      alt: "XHC Coconut, Banana and Papaya shampoo and conditioner bars with fresh tropical fruit",
      href: "/shop/xhc-shampoo-conditioner-bars",
      label: "2-in-1 Haircare Bars",
    },
  ],
  right: [
    {
      src: "/products/B0GBMH1N54/a5.png",
      alt: "XHC Argan Oil conditioner on a wooden bath caddy beside a steaming bath",
      href: "/shop/xhc-argan-oil-shampoo-conditioner-set",
      label: "Argan Oil Set",
    },
    {
      src: "/brand/conditioner-3pack-table.jpg",
      alt: "Three XHC No Rinse Conditioners: Cherry & Almond, Dragon Fruit & Vanilla and Mango & Coconut on a wooden shelf",
      href: "/shop/xhc-no-rinse-conditioner-3-pack",
      label: "No Rinse 3 Pack",
    },
    {
      src: "/products/B0GBMH1N54/a7.png",
      alt: "XHC Argan Oil conditioner resting on a pile of argan nuts with a drop of golden oil",
      href: "/shop/xhc-argan-oil-shampoo-3-pack",
      label: "Argan Oil Shampoo",
    },
  ],
};

/** Haircare lifestyle mosaic with scroll parallax, plus quick links to the key XHC bundles. */
export function WashDay({ products, haircareHref, priceNote }: { products: WashDayProduct[]; haircareHref: string; priceNote: string }) {
  return (
    <section className="relative overflow-clip bg-sand py-24 md:py-32 lg:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/3 size-[40rem] rounded-full bg-[#E9D6BD] opacity-60 blur-3xl"
      />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="XHC Xpert Haircare"
          title="Wash day, *sorted*."
          intro={
            <p className="text-ink-soft">
              Leave-in conditioner for curls, Moroccan argan oil, rosemary and mint, and plastic-free bars. Vegan-friendly haircare, bundled
              so you can stock up in one go.
            </p>
          }
        />
      </div>

      <div className="container-x relative mt-14 grid gap-16 lg:mt-20 lg:grid-cols-12 lg:gap-14">
        {/* Mosaic */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            <Parallax offset={50} className="flex flex-col gap-3 sm:gap-5">
              {MOSAIC.left.map((t, i) => (
                <Reveal key={t.src} delay={i * 0.08} y={40}>
                  <Tile {...t} />
                </Reveal>
              ))}
            </Parallax>
            <Parallax offset={-50} className="mt-20 flex flex-col gap-3 sm:mt-32 sm:gap-5">
              {MOSAIC.right.map((t, i) => (
                <Reveal key={t.src} delay={0.1 + i * 0.08} y={40}>
                  <Tile {...t} />
                </Reveal>
              ))}
            </Parallax>
          </div>
        </div>

        {/* Product links */}
        <div className="lg:col-span-5">
          <div className="[@media(min-width:1024px)_and_(min-height:800px)]:sticky [@media(min-width:1024px)_and_(min-height:800px)]:top-[calc(var(--header-h)+2.5rem)]">
            <h3 className="eyebrow flex items-center gap-2 text-ink-soft">
              <span aria-hidden className="size-1.5 rounded-full bg-argan" />
              Shop the routine
            </h3>
            <RevealGroup as="ul" className="mt-5 border-t border-ink/10">
              {products.map((p) => (
                <RevealItem as="li" key={p.slug} className="border-b border-ink/10">
                  <Link
                    href={`/shop/${p.slug}`}
                    className="group flex items-center gap-4 rounded-2xl py-4 transition-colors duration-300 hover:bg-paper/60 sm:px-2"
                  >
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl" style={{ background: p.accentSoft }}>
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="product-cutout object-contain p-1.5 transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-110"
                      />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-display font-bold leading-snug tracking-tight text-ink">
                        <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-[var(--ease-out-expo)] group-hover:bg-[length:100%_2px] group-focus-visible:bg-[length:100%_2px]">
                          {p.name}
                        </span>
                      </span>
                      <span className="truncate text-sm text-ink-soft">{p.tagline}</span>
                    </span>
                    {p.fromLabel && (
                      <span className="hidden text-sm font-semibold tabular-nums text-ink sm:block">
                        {p.multiple ? `from ${p.fromLabel}` : p.fromLabel}
                      </span>
                    )}
                    <ArrowRight
                      aria-hidden
                      className="size-4 shrink-0 text-ink transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.1} className="mt-9 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <AmazonButton href={haircareHref} placement="home-washday" size="lg">
                  Shop haircare on Amazon
                </AmazonButton>
                <ButtonLink href="/collections/haircare" variant="outline" size="lg">
                  All haircare
                </ButtonLink>
              </div>
              <p className="text-xs text-ink-soft">{priceNote}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({ src, alt, href, label }: { src: string; alt: string; href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative block aspect-square cursor-pointer overflow-hidden rounded-4xl bg-paper shadow-soft transition-shadow duration-500 hover:shadow-lift"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 28vw, 48vw"
        className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
      />
      <span className="absolute bottom-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full bg-paper/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-soft backdrop-blur transition-[gap,padding] duration-300 group-hover:gap-2.5 group-hover:pr-4 sm:bottom-4 sm:left-4 sm:text-sm">
        <span className="truncate">{label}</span>
        <ArrowRight aria-hidden className="size-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
