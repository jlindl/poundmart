import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href: string };

/** schema.org BreadcrumbList for the same trail the reader sees. */
export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `${site.url}${c.href === "/" ? "" : c.href}`,
    })),
  };
}

/** Visible breadcrumb trail. The last item is the current page. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-ink-soft">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.href} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronRight aria-hidden className="size-3.5 shrink-0 opacity-50" />}
              {last ? (
                <span aria-current="page" className="block max-w-[26ch] truncate font-medium text-ink sm:max-w-[48ch]">
                  {c.label}
                </span>
              ) : (
                <Link
                  href={c.href}
                  className={cn(
                    "relative cursor-pointer rounded-sm transition-colors duration-300 hover:text-ink",
                    "after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-sun after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100 focus-visible:after:scale-x-100",
                  )}
                >
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
