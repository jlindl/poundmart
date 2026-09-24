"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUpDown, ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import {
  CATEGORY_OPTIONS,
  DEFAULT_FILTERS,
  GRID_CLASS,
  SORT_OPTIONS,
  applyFilters,
  filtersToQuery,
  isDefaultFilters,
  parseFilters,
  typeSlug,
  typesFor,
  type CategoryFilter,
  type ShopFilters,
  type ShopItem,
  type SortKey,
} from "@/components/shop/filters";
import { useHeaderHidden } from "@/components/shop/scroll-fx";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring", stiffness: 380, damping: 34 } as const;

function subscribeLg(cb: () => void) {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True at the lg breakpoint and up. */
function useIsLg() {
  return useSyncExternalStore(
    subscribeLg,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

/**
 * Filter bar + animated product grid. The product cards are rendered on the
 * server and passed in keyed by slug; this component only decides which to
 * show and in what order. Filter state lives in the query string so a
 * filtered view can be shared.
 */
export function ShopBrowser({ items, cards }: { items: ShopItem[]; cards: Record<string, ReactNode> }) {
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const isLg = useIsLg();
  const headerHidden = useHeaderHidden();
  const [filters, setFilters] = useState<ShopFilters>(() => parseFilters(searchParams, items));
  const [panelOpen, setPanelOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const visible = useMemo(() => applyFilters(items, filters), [items, filters]);
  const types = useMemo(() => typesFor(items, filters.category), [items, filters.category]);
  const counts = useMemo(
    () =>
      Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, items.filter((i) => o.value === "all" || i.category === o.value).length])) as Record<
        CategoryFilter,
        number
      >,
    [items],
  );
  const activeCount = (filters.type ? 1 : 0) + (filters.bundles ? 1 : 0) + (filters.sort !== "popular" ? 1 : 0);

  function update(patch: Partial<ShopFilters>) {
    const next = { ...filters, ...patch };
    if (next.type && !typesFor(items, next.category).some((t) => typeSlug(t) === next.type)) next.type = null;
    setFilters(next);
    // Update the URL without a navigation: no server round trip and no page transition.
    const qs = filtersToQuery(next);
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    // If the grid top has scrolled out of view, bring it back so the change is visible.
    const el = sectionRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      if (lenis) lenis.scrollTo(el, { offset: -180, duration: 0.9 });
      else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  function onCategoryKey(e: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = CATEGORY_OPTIONS.findIndex((o) => o.value === filters.category);
    const last = CATEGORY_OPTIONS.length - 1;
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? last
          : e.key === "ArrowRight" || e.key === "ArrowDown"
            ? i === last
              ? 0
              : i + 1
            : i === 0
              ? last
              : i - 1;
    update({ category: CATEGORY_OPTIONS[next].value });
    categoryRefs.current[next]?.focus();
  }

  const collapsed = !isLg && !panelOpen;

  return (
    <div ref={sectionRef} className="scroll-mt-40">
      {/* Sticky filter bar */}
      <div
        className={cn(
          "sticky z-30 transition-[top] duration-500 ease-[var(--ease-out-expo)]",
          headerHidden ? "top-3" : "top-[calc(var(--header-h)+0.5rem)]",
        )}
      >
        <div className="rounded-[1.75rem] border border-line/80 bg-paper/90 p-2 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
            <div className="flex items-center gap-2">
              {/* Category: segmented control */}
              <div
                role="radiogroup"
                aria-label="Category"
                onKeyDown={onCategoryKey}
                className="relative flex flex-1 rounded-full bg-cream p-1 lg:flex-none"
              >
                {CATEGORY_OPTIONS.map((o, i) => {
                  const active = filters.category === o.value;
                  return (
                    <button
                      key={o.value}
                      ref={(el) => {
                        categoryRefs.current[i] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      tabIndex={active ? 0 : -1}
                      onClick={() => update({ category: o.value })}
                      className={cn(
                        "relative isolate flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-semibold transition-colors duration-300 sm:px-5",
                        active ? "text-cream" : "text-ink/70 hover:bg-ink/5 hover:text-ink",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="shop-category-pill"
                          aria-hidden
                          className="absolute inset-0 -z-10 rounded-full bg-ink shadow-[0_8px_20px_-8px_rgb(4_64_108/0.7)]"
                          transition={reduce ? { duration: 0 } : SPRING}
                        />
                      )}
                      {o.label}
                      <span className={cn("text-xs tabular-nums", active ? "text-sun" : "text-ink-muted")}>{counts[o.value]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile: filters toggle */}
              <button
                type="button"
                onClick={() => setPanelOpen((v) => !v)}
                aria-expanded={panelOpen}
                aria-controls="shop-filter-panel"
                className={cn(
                  "relative inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-300 lg:hidden",
                  panelOpen ? "border-ink bg-ink text-cream" : "border-line bg-paper text-ink hover:border-ink",
                )}
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                <span className="sr-only sm:not-sr-only">Filters</span>
                {activeCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-sun text-[11px] font-bold text-ink-deep tabular-nums">
                    {activeCount}
                    <span className="sr-only"> active</span>
                  </span>
                )}
              </button>
            </div>

            {/* Secondary filters: always shown on desktop, collapsible on mobile */}
            <div
              id="shop-filter-panel"
              inert={collapsed}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)] lg:flex-1 lg:grid-rows-[1fr] lg:opacity-100",
                collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
              )}
            >
              <div className="min-h-0 overflow-hidden lg:overflow-visible">
                <div className="flex flex-col gap-3 px-1 pb-1 pt-2 lg:flex-row lg:items-center lg:gap-3 lg:p-0">
                  {/* Type chips */}
                  <div className="min-w-0 lg:flex-1">
                    {types.length > 1 ? (
                      <div
                        role="group"
                        aria-label="Product type"
                        className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 lg:mask-fade-x lg:px-2"
                      >
                        <Chip active={!filters.type} onClick={() => update({ type: null })}>
                          All types
                        </Chip>
                        {types.map((t) => (
                          <Chip
                            key={t}
                            active={filters.type === typeSlug(t)}
                            onClick={() => update({ type: filters.type === typeSlug(t) ? null : typeSlug(t) })}
                          >
                            {t}
                          </Chip>
                        ))}
                      </div>
                    ) : filters.category === "toothpaste" ? (
                      <p className="px-2 text-sm text-ink-muted">
                        Every tube is <span className="font-semibold text-ink">60g</span>, every flavour is{" "}
                        <span className="accent-serif text-base text-ink">vegan</span>.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap lg:justify-end">
                    {/* Bundles only */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={filters.bundles}
                      onClick={() => update({ bundles: !filters.bundles })}
                      className="group inline-flex h-10 shrink-0 cursor-pointer items-center gap-2.5 rounded-full border border-line bg-paper pl-1.5 pr-4 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-7 w-12 items-center rounded-full p-1 transition-colors duration-300",
                          filters.bundles ? "justify-end bg-ink" : "justify-start bg-ink/15 group-hover:bg-ink/25",
                        )}
                      >
                        <motion.span
                          layout
                          transition={reduce ? { duration: 0 } : SPRING}
                          className="grid size-5 place-items-center rounded-full bg-paper shadow-soft"
                        >
                          <span
                            className={cn("size-1.5 rounded-full transition-colors duration-300", filters.bundles ? "bg-sun" : "bg-transparent")}
                          />
                        </motion.span>
                      </span>
                      Bundles only
                    </button>

                    {/* Sort */}
                    <label className="relative inline-flex shrink-0 items-center">
                      <span className="sr-only">Sort products</span>
                      <ArrowUpDown aria-hidden className="pointer-events-none absolute left-3.5 size-4 text-ink-muted" />
                      <select
                        value={filters.sort}
                        onChange={(e) => update({ sort: e.target.value as SortKey })}
                        className="h-10 cursor-pointer appearance-none rounded-full border border-line bg-paper pl-10 pr-10 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink"
                      >
                        {SORT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 size-4 text-ink" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="mb-8 mt-6 flex min-h-9 flex-wrap items-center justify-between gap-3 px-1">
        <p aria-live="polite" aria-atomic="true" className="text-sm text-ink-muted">
          Showing <span className="font-semibold tabular-nums text-ink">{visible.length}</span> of{" "}
          <span className="tabular-nums">{items.length}</span> products
          {filters.sort !== "popular" && (
            <>
              , sorted by <span className="font-semibold text-ink">{SORT_OPTIONS.find((o) => o.value === filters.sort)?.label.toLowerCase()}</span>
            </>
          )}
        </p>
        <AnimatePresence>
          {!isDefaultFilters(filters) && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onClick={() => update(DEFAULT_FILTERS)}
              className="group inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink transition-colors hover:bg-ink/5"
            >
              <RotateCcw aria-hidden className="size-3.5 transition-transform duration-500 group-hover:-rotate-180" />
              Clear filters
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <ul className={cn(GRID_CLASS, "relative")}>
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => (
            <motion.li
              key={item.slug}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 30, mass: 0.8 }}
              className="h-full"
            >
              {cards[item.slug]}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Empty state */}
      <AnimatePresence>
        {visible.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5 rounded-5xl border border-dashed border-line bg-paper/60 px-6 py-20 text-center"
          >
            <Image src="/brand/mark.png" alt="" width={278} height={278} className="w-20 animate-float" />
            <div>
              <p className="font-display text-2xl font-bold text-ink">Nothing in that bundle bin (yet).</p>
              <p className="mt-2 text-ink-muted">Try another type or switch off Bundles only.</p>
            </div>
            <button
              type="button"
              onClick={() => update(DEFAULT_FILTERS)}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-ink px-5 font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              <RotateCcw aria-hidden className="size-4" /> Show everything
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-300 active:scale-95",
        active
          ? "border-sun bg-sun text-ink-deep shadow-[0_6px_16px_-8px_rgb(230_184_0/0.9)]"
          : "border-line bg-paper text-ink/75 hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
