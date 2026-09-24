"use client";

import Link from "next/link";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type CategoryPill = {
  label: string;
  href: string;
  accent: string;
  count?: number;
  active?: boolean;
};

/**
 * Category links with an ink pill that glides between chips on hover and focus.
 * `id` scopes the shared layout animation when several sets appear on one page.
 */
export function CategoryPills({
  pills,
  id,
  className,
  label = "Blog categories",
}: {
  pills: CategoryPill[];
  id: string;
  className?: string;
  label?: string;
}) {
  const [lit, setLit] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <LayoutGroup id={id}>
      <nav aria-label={label} className={className}>
        <ul className="flex flex-wrap gap-2" onMouseLeave={() => setLit(null)}>
          {pills.map((p) => {
            const on = lit === p.href;
            return (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={p.active ? "page" : undefined}
                  onMouseEnter={() => setLit(p.href)}
                  onFocus={() => setLit(p.href)}
                  onBlur={() => setLit(null)}
                  className={cn(
                    "relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-[border-color,color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97]",
                    p.active ? "border-ink bg-ink/[0.04] text-ink" : "border-ink/10 bg-paper/80 text-ink backdrop-blur",
                    on && "border-ink",
                  )}
                >
                  {on &&
                    (reduce ? (
                      <span aria-hidden className="absolute inset-0 rounded-full bg-ink" />
                    ) : (
                      <motion.span
                        aria-hidden
                        layoutId="pill"
                        className="absolute inset-0 rounded-full bg-ink"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    ))}
                  <span
                    aria-hidden
                    className={cn("relative size-2.5 rounded-full ring-2 transition-transform duration-300", on ? "scale-125 ring-cream/30" : "ring-white")}
                    style={{ background: p.accent }}
                  />
                  <span className={cn("relative transition-colors duration-200", on && "text-cream")}>{p.label}</span>
                  {p.count !== undefined && (
                    <span
                      className={cn(
                        "relative min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums transition-colors duration-200",
                        on ? "bg-cream/15 text-cream" : "bg-ink/[0.06] text-ink-soft",
                      )}
                    >
                      {p.count}
                      <span className="sr-only"> {p.count === 1 ? "guide" : "guides"}</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </LayoutGroup>
  );
}
