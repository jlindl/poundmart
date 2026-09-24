import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/motion/count-up";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ScrollBar } from "@/components/shop/scroll-fx";
import type { SavingsRow } from "@/components/shop/shop-data";
import { amazon } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

function packLabel(label: string, units: number) {
  return label.includes("×") ? `${units} pack` : label;
}

/** Bundle vs smaller option, per unit. Bars fill as the rows scroll into view. */
export function BundleSavings({ rows }: { rows: SavingsRow[] }) {
  if (rows.length === 0) return null;
  return (
    <RevealGroup as="ol" className="flex flex-col gap-4" stagger={0.1}>
      {rows.map((r) => {
        const bigLabel = packLabel(r.big.label, r.big.units);
        return (
          <RevealItem
            as="li"
            key={`${r.small.asin}-${r.big.asin}`}
            className="group grid items-center gap-6 rounded-4xl border border-cream/10 bg-ink-deep/60 p-5 transition-colors duration-500 hover:border-cream/25 hover:bg-ink-deep/80 sm:p-7 lg:grid-cols-[15rem_1fr_13rem] lg:gap-10"
          >
            <div className="flex items-center gap-4">
              <span className="relative size-20 shrink-0 rounded-full bg-cream transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6 group-hover:scale-105">
                <Image src={r.big.image} alt="" fill sizes="80px" className="product-cutout object-contain p-3" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold leading-tight text-cream">{r.title}</h3>
                <Link
                  href={`/shop/${r.big.slug}`}
                  className="mt-1 inline-block text-sm text-cream/75 underline decoration-cream/30 underline-offset-4 transition-colors hover:text-sun hover:decoration-sun"
                >
                  See the {bigLabel.toLowerCase()}
                </Link>
              </div>
            </div>

            <dl className="flex flex-col gap-4">
              <div>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <dt className="text-cream/70">{r.small.label}</dt>
                  <dd className="font-semibold tabular-nums text-cream">
                    {formatPrice(r.small.perUnit)} <span className="font-normal text-cream/70">a {r.unitNoun}</span>
                  </dd>
                </div>
                <ScrollBar value={1} className="mt-2 h-3 bg-cream/10" barClassName="bg-cream/35" />
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <dt className="font-semibold text-sun">{bigLabel}</dt>
                  <dd className="font-semibold tabular-nums text-sun">
                    {formatPrice(r.big.perUnit)} <span className="font-normal text-cream/70">a {r.unitNoun}</span>
                  </dd>
                </div>
                <ScrollBar value={r.big.perUnit / r.small.perUnit} className="mt-2 h-3 bg-cream/10" barClassName="bg-sun" />
              </div>
            </dl>

            <div className="flex flex-row items-center justify-between gap-4 border-t border-cream/10 pt-5 lg:flex-col lg:items-start lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p>
                <span className="type-display block text-5xl leading-none text-sun">
                  <CountUp to={r.percent} suffix="%" />
                </span>
                <span className="mt-1 block text-sm text-cream/70">
                  less per {r.unitNoun}, {formatPrice(r.saving)} saved on each
                </span>
              </p>
              <AmazonButton
                href={amazon.product(r.big.asin)}
                placement="collection-bundles-savings"
                asin={r.big.asin}
                size="sm"
                showBag={false}
                className="shrink-0"
              >
                Buy the {bigLabel.toLowerCase()}
              </AmazonButton>
            </div>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
