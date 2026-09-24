import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowRight } from "lucide-react";
import { TiltCard } from "@/components/motion/tilt-card";
import { AmazonButton } from "@/components/ui/amazon-link";
import { RatingSummary } from "@/components/ui/stars";
import { Price } from "@/components/product/price";
import { amazon } from "@/lib/site";
import { isInStock, type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * The standard product tile. Whole card links to the product page;
 * the Amazon button sits above the stretched link.
 */
export function ProductCard({
  product,
  placement = "product-card",
  priority = false,
  className,
  size = "md",
}: {
  product: Product;
  placement?: string;
  priority?: boolean;
  className?: string;
  size?: "md" | "lg";
}) {
  const v = product.primary;
  const inStock = isInStock(product);
  const badges = [product.isNew ? "New" : null, ...product.badges].filter(Boolean).slice(0, 2) as string[];

  return (
    <TiltCard max={5} className={cn("group h-full rounded-4xl", className)}>
      <article
        className="relative flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-paper shadow-soft transition-shadow duration-500 group-hover:shadow-lift"
        style={{ ["--accent" as string]: product.accent, ["--accent-soft" as string]: product.accentSoft }}
      >
        {/* Image stage */}
        <div className={cn("relative overflow-hidden bg-[var(--accent-soft)]", size === "lg" ? "aspect-[4/4.2]" : "aspect-square")}>
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110"
          />
          <ViewTransition name={`product-image-${product.slug}`} share="morph" default="none">
            <Image
              src={v.image}
              alt={product.name}
              fill
              priority={priority}
              sizes={size === "lg" ? "(min-width: 1024px) 40vw, 90vw" : "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 80vw"}
              className="product-cutout object-contain p-[9%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-2 group-hover:scale-[1.07]"
            />
          </ViewTransition>
          {badges.length > 0 && (
            <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5">
              {badges.map((b, i) => (
                <span
                  key={b}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                    i === 0 ? "bg-ink text-cream" : "bg-white/90 text-ink backdrop-blur",
                  )}
                >
                  {b}
                </span>
              ))}
            </div>
          )}
          {!inStock && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
              Currently unavailable
            </span>
          )}
        </div>

        {/* Copy */}
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow text-[10px] text-ink-muted">{product.brand}</span>
            <RatingSummary rating={v.rating} count={v.reviewCount} className="text-xs" />
          </div>
          <h3 className={cn("font-display font-bold leading-[1.1] tracking-tight text-ink", size === "lg" ? "text-2xl" : "text-lg")}>
            <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0 after:z-[1] after:rounded-4xl focus-visible:outline-none">
              {product.name}
            </Link>
          </h3>
          <p className="text-sm leading-relaxed text-ink-muted">{product.tagline}</p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
            <Price product={product} size="sm" />
          </div>
          <div className="relative z-[2] flex items-center gap-2 pt-1">
            <AmazonButton
              href={amazon.product(v.asin)}
              placement={placement}
              asin={v.asin}
              size="sm"
              variant={inStock ? "sun" : "outline"}
              showBag={false}
              className="flex-1"
            >
              {inStock ? "Buy on Amazon" : "View on Amazon"}
            </AmazonButton>
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink transition-all duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-cream"
            >
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
