"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArchiveListItem = { slug: string; title: string; dateLabel: string; readMinutes: number };

/**
 * Compact list of older guides. Every link is in the HTML (good for crawl depth
 * as the blog grows); only the first few show until the reader expands the list.
 */
export function ArchiveList({ items, accent, preview = 8 }: { items: ArchiveListItem[]; accent: string; preview?: number }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  if (items.length === 0) return null;

  return (
    <div>
      <ul id={listId} className="divide-y divide-line overflow-hidden rounded-4xl border border-line bg-paper shadow-soft">
        {items.map((p, i) => (
          <li key={p.slug} className={cn(!open && i >= preview && "hidden")}>
            <Link
              href={`/blog/${p.slug}`}
              className="group flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors duration-300 hover:bg-sun-pale focus-visible:bg-sun-pale sm:px-7 sm:py-5"
            >
              <span aria-hidden className="size-2.5 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-150" style={{ background: accent }} />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold leading-snug text-ink sm:text-lg">{p.title}</span>
                <span className="mt-0.5 block text-xs text-ink-muted">
                  {p.dateLabel} · {p.readMinutes} min read
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
      {items.length > preview && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className="group mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-ink/15 px-5 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-cream"
        >
          {open ? "Show fewer" : `Show all ${items.length} older guides`}
          <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
        </button>
      )}
    </div>
  );
}
