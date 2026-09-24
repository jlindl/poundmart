import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { collections, isInStock, productsIn } from "@/lib/products";
import { collectionArt } from "@/components/shop/shop-data";
import { cn } from "@/lib/utils";

/** Four (or three) collection tiles for internal linking between shop pages. */
export function CollectionRail({ exclude, className }: { exclude?: string; className?: string }) {
  const list = collections.filter((c) => c.slug !== exclude);
  return (
    <RevealGroup
      as="ul"
      className={cn("grid grid-cols-2 gap-3 sm:gap-4", list.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3", className)}
      stagger={0.09}
    >
      {list.map((c) => {
        const art = collectionArt[c.slug];
        const count = productsIn(c).filter(isInStock).length;
        return (
          <RevealItem as="li" key={c.slug} className="h-full">
            <Link
              href={`/collections/${c.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-paper p-3 shadow-soft transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-lift sm:p-4"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl" style={{ background: art.soft }}>
                <div
                  aria-hidden
                  className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-125"
                />
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, 45vw"
                  className="product-cutout object-contain p-[10%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-3 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-1 items-end justify-between gap-2 px-1 pb-1 pt-4">
                <div className="min-w-0">
                  <span className="eyebrow block truncate text-[10px] text-ink-muted">{c.eyebrow}</span>
                  <span className="mt-1 block font-display text-lg font-bold leading-tight tracking-tight text-ink sm:text-xl">{c.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {count} {count === 1 ? "product" : "products"}
                  </span>
                </div>
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink transition-all duration-300 group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-cream sm:size-10"
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </Link>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
