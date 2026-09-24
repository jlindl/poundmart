import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CATEGORY_OPTIONS, DEFAULT_FILTERS, GRID_CLASS, applyFilters, type ShopItem } from "@/components/shop/filters";
import { cn } from "@/lib/utils";

/**
 * Server-rendered stand-in for <ShopBrowser> (the Suspense fallback while the
 * query string is read on the client). It shows the full grid in the default
 * order, so crawlers and no-JS visitors get every product, and the swap to the
 * interactive version is visually seamless.
 */
export function ShopGridFallback({ items, cards }: { items: ShopItem[]; cards: Record<string, ReactNode> }) {
  const ordered = applyFilters(items, DEFAULT_FILTERS);
  return (
    <div>
      <div className="rounded-[1.75rem] border border-line/80 bg-paper/90 p-2 shadow-soft">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 rounded-full bg-cream p-1 lg:flex-none">
            {CATEGORY_OPTIONS.map((o, i) => (
              <span
                key={o.value}
                className={cn(
                  "flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-semibold sm:px-5",
                  i === 0 ? "bg-ink text-cream" : "text-ink/70",
                )}
              >
                {o.label}
                <span className={cn("text-xs tabular-nums", i === 0 ? "text-sun" : "text-ink-muted")}>
                  {items.filter((it) => o.value === "all" || it.category === o.value).length}
                </span>
              </span>
            ))}
          </div>
          <span className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-ink lg:hidden">
            <SlidersHorizontal className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Filters</span>
          </span>
        </div>
      </div>
      <div className="mb-8 mt-6 flex min-h-9 items-center px-1">
        <p className="text-sm text-ink-muted">
          Showing <span className="font-semibold tabular-nums text-ink">{ordered.length}</span> of{" "}
          <span className="tabular-nums">{items.length}</span> products
        </p>
      </div>
      <ul className={GRID_CLASS}>
        {ordered.map((item) => (
          <li key={item.slug} className="h-full">
            {cards[item.slug]}
          </li>
        ))}
      </ul>
    </div>
  );
}
