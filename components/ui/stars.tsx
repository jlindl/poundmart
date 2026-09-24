import { cn } from "@/lib/utils";

const STAR = "M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z";

/** Star rating with fractional fill. */
export function Stars({ rating, className, size = 16 }: { rating: number; className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
            <defs>
              <linearGradient id={`star-${i}-${Math.round(fill * 100)}`}>
                <stop offset={`${fill * 100}%`} stopColor="var(--color-sun-deep)" />
                <stop offset={`${fill * 100}%`} stopColor="currentColor" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <path d={STAR} fill={`url(#star-${i}-${Math.round(fill * 100)})`} />
          </svg>
        );
      })}
    </span>
  );
}

/** "4.3 ★★★★☆ (99)" with a link-friendly layout. */
export function RatingSummary({ rating, count, className }: { rating: number | null; count: number; className?: string }) {
  if (!rating) return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span>
      <Stars rating={rating} size={14} />
      <span className="text-ink-muted tabular-nums">({count.toLocaleString("en-GB")})</span>
    </span>
  );
}
