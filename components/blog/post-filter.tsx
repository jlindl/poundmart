"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import {
  createContext,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { ArrowRight, Hash, Search, X } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { ArchiveEntry, BlogCategoryLite, FilterItem, Topic } from "@/components/blog/types";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const ALL = "all";
/** The in-grid promo sits after this many cards (two rows on desktop). */
const PROMO_AFTER = 6;
const ARCHIVE_PREVIEW = 8;

/* ---------- Shared filter state ---------- */

type FilterState = {
  query: string;
  setQuery: (q: string) => void;
  category: string;
  setCategory: (slug: string) => void;
  reset: () => void;
  /** Scrolls to the guides grid (used by the topic cloud). */
  focusGrid: () => void;
  searchRef: RefObject<HTMLInputElement | null>;
  anchorId: string;
};

const FilterContext = createContext<FilterState | null>(null);

function useBlogFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("Blog filter components must sit inside <BlogFilterProvider>");
  return ctx;
}

/** Holds the search query and category so the grid and the topic cloud stay in sync. */
export function BlogFilterProvider({ children, anchorId = "guides" }: { children: ReactNode; anchorId?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const searchRef = useRef<HTMLInputElement>(null);
  const lenis = useLenis();
  const reduce = useReducedMotion();

  const reset = useCallback(() => {
    setQuery("");
    setCategory(ALL);
  }, []);

  const focusGrid = useCallback(() => {
    const target = document.getElementById(anchorId);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -112, duration: 1.2 });
    else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [anchorId, lenis, reduce]);

  const value = useMemo(
    () => ({ query, setQuery, category, setCategory, reset, focusGrid, searchRef, anchorId }),
    [query, category, reset, focusGrid, anchorId],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

function tokenize(q: string) {
  return q
    .toLowerCase()
    .replace(/#/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/* ---------- Filterable grid ---------- */

export function PostFilterGrid({
  categories,
  items,
  archive,
  promo,
  suggestions,
  pageLabel,
}: {
  /** Categories with total post counts. */
  categories: BlogCategoryLite[];
  /** Server-rendered cards for this page. */
  items: FilterItem[];
  /** Every published post, so search reaches the whole archive. */
  archive: ArchiveEntry[];
  promo?: ReactNode;
  suggestions: Topic[];
  /** e.g. "page 1 of 3" */
  pageLabel?: string;
}) {
  const { query, setQuery, category, setCategory, reset, searchRef } = useBlogFilter();
  const reduce = useReducedMotion();
  const inputId = useId();
  const [expanded, setExpanded] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const tokens = useMemo(() => tokenize(deferredQuery), [deferredQuery]);
  const filtering = tokens.length > 0 || category !== ALL;

  const matchesQuery = useCallback((text: string) => tokens.every((t) => text.includes(t)), [tokens]);
  const inCategory = useCallback((slug: string) => category === ALL || slug === category, [category]);

  const visible = items.filter((i) => inCategory(i.categorySlug) && matchesQuery(i.search));
  const onPage = useMemo(() => new Set(items.map((i) => i.slug)), [items]);
  const totalMatches = filtering ? archive.filter((a) => inCategory(a.categorySlug) && matchesQuery(a.search)).length : archive.length;
  const archiveMatches = filtering ? archive.filter((a) => !onPage.has(a.slug) && inCategory(a.categorySlug) && matchesQuery(a.search)) : [];
  const shownArchive = expanded ? archiveMatches : archiveMatches.slice(0, ARCHIVE_PREVIEW);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL]: 0 };
    for (const a of archive) {
      if (!matchesQuery(a.search)) continue;
      counts[ALL] += 1;
      counts[a.categorySlug] = (counts[a.categorySlug] ?? 0) + 1;
    }
    return counts;
  }, [archive, matchesQuery]);

  // "/" jumps to search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchRef]);

  const tabs = [{ slug: ALL, name: "All guides", accent: "var(--color-ink)" }, ...categories];
  const catName = categories.find((c) => c.slug === category)?.name;

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    let next = step ? (index + step + tabs.length) % tabs.length : -1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setCategory(tabs[next].slug);
    const buttons = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button[role=radio]");
    buttons?.[next]?.focus();
  }

  const status = filtering
    ? `${totalMatches} ${totalMatches === 1 ? "guide" : "guides"}${catName ? ` in ${catName}` : ""}${tokens.length ? ` matching “${deferredQuery.trim()}”` : ""}`
    : `Showing ${items.length} ${items.length === 1 ? "guide" : "guides"}${pageLabel ? `, ${pageLabel}` : ""}`;

  const showPromo = Boolean(promo) && !filtering && visible.length > PROMO_AFTER;
  const nodes: ReactElement[] = [];
  visible.forEach((item, i) => {
    nodes.push(
      <motion.li
        key={item.slug}
        layout={reduce ? false : "position"}
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.94, transition: { duration: 0.22 } }}
        transition={{ duration: 0.5, ease: EASE }}
        className="grid"
      >
        <Reveal y={48} amount={0.15} delay={(i % 3) * 0.08} className="grid">
          {item.card}
        </Reveal>
      </motion.li>,
    );
    if (showPromo && i === PROMO_AFTER - 1) {
      nodes.push(
        <motion.li
          key="__promo"
          layout={reduce ? false : "position"}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="col-span-full"
        >
          {promo}
        </motion.li>,
      );
    }
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative -mx-[clamp(1.25rem,4vw,3rem)] overflow-x-auto px-[clamp(1.25rem,4vw,3rem)] py-1 no-scrollbar lg:mx-0 lg:px-0">
          <LayoutGroup id="blog-filter">
            <div
              role="radiogroup"
              aria-label="Filter guides by category"
              className="flex w-max items-center gap-1 rounded-full border border-line bg-paper p-1.5 shadow-soft"
            >
              {tabs.map((t, i) => {
                const checked = category === t.slug;
                const count = tabCounts[t.slug] ?? 0;
                return (
                  <button
                    key={t.slug}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    tabIndex={checked ? 0 : -1}
                    onClick={() => setCategory(t.slug)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className={cn(
                      "relative inline-flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-300",
                      checked ? "text-cream" : "text-ink/75 hover:bg-ink/[0.05] hover:text-ink",
                    )}
                  >
                    {checked &&
                      (reduce ? (
                        <span aria-hidden className="absolute inset-0 rounded-full bg-ink" />
                      ) : (
                        <motion.span
                          aria-hidden
                          layoutId="active-tab"
                          className="absolute inset-0 rounded-full bg-ink"
                          transition={{ type: "spring", stiffness: 420, damping: 36 }}
                        />
                      ))}
                    {t.slug !== ALL && <span aria-hidden className="relative size-2 rounded-full" style={{ background: t.accent }} />}
                    <span className="relative">{t.name}</span>
                    <span
                      className={cn(
                        "relative rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                        checked ? "bg-cream/15 text-cream" : "bg-ink/[0.06] text-ink-soft",
                      )}
                    >
                      {count}
                      <span className="sr-only"> {count === 1 ? "guide" : "guides"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        <div role="search" className="relative w-full sm:max-w-md xl:w-[22rem] xl:shrink-0">
          <label htmlFor={inputId} className="sr-only">
            Search every guide
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-muted" />
          <input
            ref={searchRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                setQuery("");
              }
            }}
            placeholder="Search guides: curls, kids, unit price…"
            autoComplete="off"
            spellCheck={false}
            className="peer h-[3.25rem] w-full appearance-none rounded-full border border-line bg-paper pl-11 pr-12 text-[0.95rem] text-ink shadow-soft outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-ink-muted/80 hover:border-ink/35 focus-visible:border-ink focus-visible:shadow-[0_0_0_4px_rgb(252_208_0/0.55)] [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              <X aria-hidden className="size-4" />
            </button>
          ) : (
            <kbd
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-cream px-1.5 font-mono text-xs text-ink-muted transition-opacity peer-focus:opacity-0 lg:block"
            >
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Results summary */}
      <div className="mt-6 flex min-h-8 flex-wrap items-center gap-x-4 gap-y-2">
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm font-medium text-ink-soft">
          {status}
        </p>
        {filtering && (
          <button
            type="button"
            onClick={reset}
            className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full text-sm font-semibold text-ink"
          >
            <X aria-hidden className="size-3.5 transition-transform duration-300 group-hover:rotate-90" />
            <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-sun after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">
              Clear filters
            </span>
          </button>
        )}
      </div>

      {/* Grid */}
      <ul className="relative mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        <AnimatePresence mode="popLayout" initial={false}>
          {nodes}
        </AnimatePresence>
      </ul>

      {/* Matches beyond this page */}
      {archiveMatches.length > 0 && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className={cn(visible.length > 0 && "mt-14")}
        >
          <h3 className="eyebrow flex items-center gap-2 text-ink-soft">
            <span aria-hidden className="size-1.5 rounded-full bg-sun-deep" />
            {visible.length > 0 ? "More matches from the archive" : "Found in the archive"}
          </h3>
          <ul className="mt-5 divide-y divide-line overflow-hidden rounded-4xl border border-line bg-paper shadow-soft">
            {shownArchive.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/blog/${a.slug}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors duration-300 hover:bg-sun-pale focus-visible:bg-sun-pale sm:px-7"
                >
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: a.accent }} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-bold leading-snug text-ink sm:text-lg">{a.title}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      {a.category} · {a.dateLabel} · {a.readMinutes} min read
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink transition-all duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-cream"
                  >
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {archiveMatches.length > ARCHIVE_PREVIEW && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-5 inline-flex h-11 cursor-pointer items-center rounded-full border-2 border-ink/15 px-5 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-cream"
            >
              {expanded ? "Show fewer" : `Show all ${archiveMatches.length} matches`}
            </button>
          )}
        </motion.div>
      )}

      {/* Nothing found */}
      {filtering && totalMatches === 0 && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative overflow-hidden rounded-5xl border border-dashed border-ink/20 bg-paper px-6 py-14 text-center sm:py-20"
        >
          <div aria-hidden className="dot-grid absolute inset-0 opacity-40" />
          <div className="relative mx-auto flex max-w-lg flex-col items-center gap-4">
            <Image src="/brand/mark.png" alt="" width={278} height={278} className="size-16 animate-float" />
            <p className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Nothing on the shelf{tokens.length ? ` for “${deferredQuery.trim()}”` : ""} yet.
            </p>
            <p className="text-ink-muted">Try a broader word or another category, or start with one of these popular topics.</p>
            {suggestions.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-2 pt-1">
                {suggestions.slice(0, 5).map((s) => (
                  <li key={s.tag}>
                    <button
                      type="button"
                      onClick={() => {
                        setCategory(ALL);
                        setQuery(s.tag);
                      }}
                      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-ink/10 bg-cream px-3.5 text-sm font-semibold text-ink transition-[transform,background-color,border-color] duration-300 hover:-translate-y-0.5 hover:border-sun hover:bg-sun"
                    >
                      <Hash aria-hidden className="size-3.5 opacity-50" />
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={reset}
              className="mt-2 inline-flex h-11 cursor-pointer items-center rounded-full bg-ink px-6 text-sm font-semibold text-cream transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-ink-deep"
            >
              Show every guide
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Topic cloud ---------- */

/** Popular tags. Picking one filters the guides grid and scrolls back up to it. */
export function TopicCloud({ topics }: { topics: Topic[] }) {
  const { query, setQuery, setCategory, focusGrid } = useBlogFilter();
  const reduce = useReducedMotion();
  const current = query.trim().toLowerCase();

  return (
    <ul className="flex flex-wrap gap-2.5 sm:gap-3">
      {topics.map((t, i) => {
        const on = current === t.tag.toLowerCase();
        return (
          <motion.li
            key={t.tag}
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: (i % 12) * 0.035 }}
          >
            <button
              type="button"
              aria-pressed={on}
              onClick={() => {
                setCategory(ALL);
                setQuery(on ? "" : t.tag);
                if (!on) focusGrid();
              }}
              className={cn(
                "group inline-flex cursor-pointer items-center gap-2 rounded-full border font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-[var(--ease-spring)] hover:-translate-y-1 hover:-rotate-2 hover:border-sun hover:bg-sun hover:text-ink-deep hover:shadow-glow focus-visible:-translate-y-1 active:scale-95",
                t.weight === 3 && "h-14 px-6 font-display text-lg sm:text-xl",
                t.weight === 2 && "h-12 px-5 text-base",
                t.weight === 1 && "h-10 px-4 text-sm",
                on ? "border-sun bg-sun text-ink-deep shadow-glow" : "border-ink/10 bg-cream text-ink",
              )}
            >
              <Hash aria-hidden className="size-[0.85em] opacity-40 transition-opacity duration-300 group-hover:opacity-100" />
              {t.label}
              <span className="rounded-full bg-ink/[0.07] px-1.5 py-0.5 font-sans text-[11px] font-bold tabular-nums">
                {t.count}
                <span className="sr-only"> {t.count === 1 ? "guide" : "guides"}</span>
              </span>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
