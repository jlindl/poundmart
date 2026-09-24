import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/components/shop/shop-data";
import { cn } from "@/lib/utils";

/** Visual breadcrumb trail. The last crumb is the current page. Pair with breadcrumbJsonLd(). */
export function Breadcrumbs({ items, className, tone = "dark" }: { items: Crumb[]; className?: string; tone?: "dark" | "light" }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.href} className="flex min-w-0 items-center gap-1.5">
              {last ? (
                <span aria-current="page" className={cn("truncate font-semibold", tone === "dark" ? "text-ink" : "text-cream")}>
                  {c.name}
                </span>
              ) : (
                <>
                  <Link
                    href={c.href}
                    className={cn(
                      "relative font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-sun after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100",
                      tone === "dark" ? "text-ink-muted hover:text-ink" : "text-cream/70 hover:text-cream",
                    )}
                  >
                    {c.name}
                  </Link>
                  <ChevronRight aria-hidden className={cn("size-3.5 shrink-0", tone === "dark" ? "text-ink/30" : "text-cream/40")} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
