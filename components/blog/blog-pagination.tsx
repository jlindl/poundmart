import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { blogPageHref } from "@/components/blog/blog-utils";
import { cn } from "@/lib/utils";

/** 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => pages.add(n));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => pages.add(n));
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

const step =
  "group inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border-2 px-5 text-sm font-semibold transition-[transform,background-color,color,border-color] duration-300 ease-[var(--ease-out-expo)]";

/** Numbered pagination with previous/next links (rel=prev/next) for the blog archive. */
export function BlogPagination({ page, totalPages, className }: { page: number; totalPages: number; className?: string }) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? blogPageHref(page - 1) : null;
  const next = page < totalPages ? blogPageHref(page + 1) : null;

  return (
    <nav aria-label="Blog pages" className={cn("flex flex-col items-center gap-5 sm:flex-row sm:justify-between", className)}>
      {prev ? (
        <Link href={prev} rel="prev" className={cn(step, "border-ink/15 text-ink hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-cream")}>
          <ArrowLeft aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Newer guides
        </Link>
      ) : (
        <span aria-hidden className={cn(step, "pointer-events-none invisible hidden border-transparent sm:inline-flex")}>
          Newer guides
        </span>
      )}

      <ol className="flex flex-wrap items-center justify-center gap-1.5">
        {pageWindow(page, totalPages).map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} aria-hidden className="grid size-11 place-items-center text-ink-muted">
              …
            </li>
          ) : (
            <li key={n}>
              {n === page ? (
                <span aria-current="page" className="grid size-11 place-items-center rounded-full bg-ink text-sm font-bold tabular-nums text-cream shadow-soft">
                  <span className="sr-only">Page </span>
                  {n}
                </span>
              ) : (
                <Link
                  href={blogPageHref(n)}
                  className="grid size-11 cursor-pointer place-items-center rounded-full text-sm font-semibold tabular-nums text-ink transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-sun"
                >
                  <span className="sr-only">Page </span>
                  {n}
                </Link>
              )}
            </li>
          ),
        )}
      </ol>

      {next ? (
        <Link href={next} rel="next" className={cn(step, "border-ink bg-ink text-cream hover:-translate-y-0.5 hover:bg-ink-deep")}>
          Older guides
          <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      ) : (
        <span aria-hidden className={cn(step, "pointer-events-none invisible hidden border-transparent sm:inline-flex")}>
          Older guides
        </span>
      )}
    </nav>
  );
}
