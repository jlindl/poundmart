import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, RotateCcw, Truck } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmazonButton, AmazonLink } from "@/components/ui/amazon-link";
import { CoinDrop } from "./coin-drop";

/** Closing conversion block: big sun-yellow finale with coins dropping into the cart. */
export function FinalCta({ storeHref, shopAllHref }: { storeHref: string; shopAllHref: string }) {
  return (
    <section className="relative overflow-clip bg-sun py-24 text-ink-deep md:py-32 lg:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(rgb(4_64_108/0.14)_1.5px,transparent_1.5px)] [background-size:26px_26px] [mask-image:radial-gradient(80%_70%_at_70%_50%,black,transparent)]"
      />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal y={12}>
            <span className="eyebrow inline-flex items-center gap-2 text-ink">
              <span aria-hidden className="size-1.5 rounded-full bg-ink" />
              Ready when you are
            </span>
          </Reveal>
          <SplitHeading
            text="Your basket's *waiting*."
            className="type-display mt-5 max-w-[10ch] text-[clamp(3.4rem,8.6vw,8.25rem)] text-ink-deep"
            accentClassName="text-ink"
          />
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-ink sm:text-xl">
              Every PoundMart bundle is one tap away in our official Amazon store. Sold by PoundMart, dispatched by Amazon, with 30-day
              returns.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Magnetic className="w-full sm:w-auto">
                <AmazonButton href={storeHref} placement="home-final" variant="ink" size="xl" className="w-full sm:w-auto">
                  Shop the Amazon store
                </AmazonButton>
              </Magnetic>
              <AmazonLink
                href={shopAllHref}
                placement="home-final-shop-all"
                className="group inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-3 font-semibold text-ink-deep sm:justify-start"
              >
                <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-100 after:bg-ink after:transition-transform after:duration-300 group-hover:after:scale-x-0 group-hover:after:origin-right">
                  See every product on Amazon
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
                <span className="sr-only"> (opens Amazon in a new tab)</span>
              </AmazonLink>
            </div>
          </Reveal>
          <Reveal delay={0.35}>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-ink">
              <li className="inline-flex items-center gap-2">
                <BadgeCheck aria-hidden className="size-4" /> Genuine brands
              </li>
              <li className="inline-flex items-center gap-2">
                <Truck aria-hidden className="size-4" /> Dispatched by Amazon
              </li>
              <li className="inline-flex items-center gap-2">
                <RotateCcw aria-hidden className="size-4" /> 30-day returns
              </li>
            </ul>
            <Link
              href="/shop"
              className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
            >
              Rather browse here first? See the full range
              <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
        <div className="lg:col-span-5">
          <CoinDrop />
        </div>
      </div>
    </section>
  );
}
