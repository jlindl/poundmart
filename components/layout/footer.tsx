import Link from "next/link";
import { ArrowUpRight, BadgeCheck, PackageCheck, RotateCcw, Truck } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AmazonButton, AmazonLink } from "@/components/ui/amazon-link";
import { Parallax } from "@/components/motion/parallax";
import { BackToTop } from "@/components/layout/back-to-top";
import { amazon, brandFacts, footerNav, site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

const facts = [
  { icon: BadgeCheck, label: brandFacts.soldBy },
  { icon: Truck, label: brandFacts.dispatchedBy },
  { icon: RotateCcw, label: brandFacts.returns },
  { icon: PackageCheck, label: brandFacts.packing },
];

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-ink-deep text-cream">
      {/* Facts strip */}
      <div className="border-b border-cream/10">
        <ul className="container-x grid grid-cols-2 gap-x-6 gap-y-4 py-7 lg:grid-cols-4">
          {facts.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-cream/80">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream/10 text-sun">
                <Icon className="size-4" aria-hidden />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="container-x relative z-[2] grid gap-14 py-20 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo tone="light" className="h-12" />
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-cream/70">
            {site.tagline}. Everyday essentials from brands you know, packed into multi-packs that cost less per item.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AmazonButton href={amazon.store()} placement="footer" size="md">
              Visit our Amazon store
            </AmazonButton>
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
          {footerNav.map((col) => (
            <div key={col.title}>
              <h2 className="eyebrow mb-5 text-sun">{col.title}</h2>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => {
                  const external = l.href.startsWith("http");
                  const cls = "group inline-flex items-center gap-1 text-cream/75 transition-colors hover:text-cream";
                  return (
                    <li key={l.href}>
                      {external ? (
                        <AmazonLink href={l.href} placement="footer-nav" className={cls}>
                          {l.label}
                          <ArrowUpRight aria-hidden className="size-3.5 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </AmazonLink>
                      ) : (
                        <Link href={l.href} className={cls}>
                          <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-sun after:transition-transform after:duration-300 group-hover:after:origin-left group-hover:after:scale-x-100">
                            {l.label}
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Giant wordmark */}
      <div aria-hidden className="pointer-events-none relative z-[1] -mb-[2vw] select-none overflow-hidden">
        <Parallax offset={40}>
          <p className="type-display whitespace-nowrap text-center text-[21vw] leading-[0.8] text-cream/[0.06]">
            Pound<span className="accent-serif">Mart</span>
          </p>
        </Parallax>
      </div>

      <div className="relative z-[2] border-t border-cream/10">
        <div className="container-x flex flex-col gap-4 py-8 text-xs leading-relaxed text-cream/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} PoundMart. Prices, ratings and availability checked {formatDate(site.catalogCheckedAt)} and may have
            changed; Amazon always shows the live price. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
