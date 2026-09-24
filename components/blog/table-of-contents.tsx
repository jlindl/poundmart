"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, ListTree } from "lucide-react";
import type { TocHeading } from "@/components/blog/types";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Tracks which heading the reader is in: the last heading that has passed the reading line. */
function useActiveHeading(headings: TocHeading[]) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const elements = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;
    // The reading line sits 30% down the viewport and the observer band ends exactly
    // there, so it fires whenever a heading crosses the line in either direction.
    const pick = () => {
      const line = window.innerHeight * 0.3 + 4;
      let current: string | null = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };
    const io = new IntersectionObserver(pick, { rootMargin: "0px 0px -70% 0px", threshold: [0, 1] });
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  return [active, setActive] as const;
}

/** Maps each heading to the h2 section it belongs to. */
function useSections(headings: TocHeading[]) {
  return useMemo(() => {
    const parent = new Map<string, string>();
    let section = "";
    for (const h of headings) {
      if (h.depth === 2) section = h.id;
      parent.set(h.id, h.depth === 2 ? h.id : section);
    }
    return parent;
  }, [headings]);
}

function TocList({
  headings,
  active,
  onPick,
  indicatorId,
  collapse = false,
}: {
  headings: TocHeading[];
  active: string | null;
  onPick: (id: string) => void;
  indicatorId: string;
  /** Only show sub-headings for the section being read. */
  collapse?: boolean;
}) {
  const reduce = useReducedMotion();
  const sections = useSections(headings);
  const activeSection = active ? sections.get(active) : undefined;
  const shown = collapse ? headings.filter((h) => h.depth === 2 || sections.get(h.id) === activeSection) : headings;

  return (
    <ol className="relative flex flex-col border-l-2 border-line">
      <AnimatePresence initial={false} mode="popLayout">
        {shown.map((h) => {
          const on = active === h.id;
          return (
            <motion.li
              key={h.id}
              data-toc-id={h.id}
              layout={reduce ? false : "position"}
              className="relative"
              initial={reduce || h.depth === 2 ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.12 } }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {on &&
                (reduce ? (
                  <span aria-hidden className="absolute inset-y-1 -left-[2px] w-[3px] rounded-full bg-sun-deep" />
                ) : (
                  <motion.span
                    aria-hidden
                    layoutId={indicatorId}
                    className="absolute inset-y-1 -left-[2px] w-[3px] rounded-full bg-sun-deep"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                ))}
              <a
                href={`#${h.id}`}
                onClick={() => onPick(h.id)}
                aria-current={on ? "location" : undefined}
                className={cn(
                  "block cursor-pointer rounded-r-xl py-1.5 pr-2 leading-snug transition-[color,background-color,transform] duration-300 hover:translate-x-0.5 hover:bg-ink/[0.04] hover:text-ink",
                  h.depth === 3 ? "pl-8 text-[0.84rem]" : "pl-4 text-[0.9rem]",
                  on ? "font-semibold text-ink" : "text-ink-soft",
                )}
              >
                {h.depth === 3 && (
                  <span aria-hidden className="mr-1.5 inline-block text-ink-muted/60">
                    ·
                  </span>
                )}
                {h.text}
              </a>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ol>
  );
}

/**
 * Article table of contents built from the post's h2/h3 headings.
 * `desktop`: sticky sidebar list with an active-section indicator; sub-headings
 * open for the section being read. `mobile`: a collapsible "On this page" panel
 * (Escape closes it). Links are plain #hash anchors, which Lenis scrolls smoothly.
 */
export function TableOfContents({ headings, variant = "desktop" }: { headings: TocHeading[]; variant?: "desktop" | "mobile" }) {
  const [active, setActive] = useActiveHeading(headings);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Keep the active entry visible inside the sidebar's own scroll area.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || !active) return;
    const item = box.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(active)}"]`);
    if (!item) return;
    const b = box.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    const pad = 24;
    if (r.top < b.top + pad) box.scrollTo({ top: box.scrollTop - (b.top + pad - r.top), behavior: reduce ? "auto" : "smooth" });
    else if (r.bottom > b.bottom - pad) box.scrollTo({ top: box.scrollTop + (r.bottom - b.bottom + pad), behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  if (headings.length === 0) return null;

  if (variant === "desktop") {
    return (
      <nav aria-label="Table of contents">
        <p className="eyebrow mb-4 flex items-center gap-2 text-ink-soft">
          <ListTree aria-hidden className="size-3.5" /> On this page
        </p>
        <div ref={boxRef} data-lenis-prevent className="no-scrollbar max-h-[calc(100vh_-_20rem)] overflow-y-auto overscroll-contain pr-1">
          <TocList headings={headings} active={active} onPick={setActive} indicatorId="toc-indicator-desktop" collapse />
        </div>
      </nav>
    );
  }

  const activeText = headings.find((h) => h.id === active)?.text;

  return (
    <nav
      aria-label="Table of contents"
      className="overflow-hidden rounded-3xl border border-line bg-paper shadow-soft"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          e.currentTarget.querySelector<HTMLButtonElement>("button")?.focus();
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left transition-colors duration-300 hover:bg-sun-pale"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sun text-ink-deep">
          <ListTree aria-hidden className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="eyebrow block text-[10px] text-ink-muted">On this page</span>
          <span className="block truncate font-display text-sm font-bold text-ink">{activeText ?? "Jump to a section"}</span>
        </span>
        <ChevronDown aria-hidden className={cn("size-5 shrink-0 text-ink transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div data-lenis-prevent className="max-h-[60vh] overflow-y-auto overscroll-contain border-t border-line px-5 pb-5 pt-4">
              <TocList
                headings={headings}
                active={active}
                indicatorId="toc-indicator-mobile"
                onPick={(id) => {
                  setActive(id);
                  setOpen(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
