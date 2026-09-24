import { formatPrice } from "@/lib/utils";
import { pricePerUnit, type Product, type Variant } from "@/lib/products";
import { cn } from "@/lib/utils";

/** Price with optional was-price and per-unit value chip. */
export function Price({
  product,
  variant = product.primary,
  size = "md",
  showUnit = true,
  className,
}: {
  product: Product;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  showUnit?: boolean;
  className?: string;
}) {
  if (!variant.inStock || variant.price === null) {
    return <span className={cn("text-sm font-semibold text-ink-muted", className)}>Check availability on Amazon</span>;
  }
  const unit = pricePerUnit(variant);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span
        className={cn(
          "font-display font-bold tabular-nums tracking-tight text-ink",
          size === "sm" && "text-lg",
          size === "md" && "text-2xl",
          size === "lg" && "text-4xl",
        )}
      >
        {formatPrice(variant.price)}
      </span>
      {variant.listPrice && (
        <span className="text-sm text-ink-muted line-through tabular-nums">
          <span className="sr-only">Was </span>
          {formatPrice(variant.listPrice)}
        </span>
      )}
      {showUnit && unit && variant.units > 1 && (
        <span className="rounded-full bg-sun-soft px-2 py-0.5 text-xs font-semibold text-ink tabular-nums">
          {formatPrice(unit)} a {product.unitNoun}
        </span>
      )}
    </span>
  );
}
