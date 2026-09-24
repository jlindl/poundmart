import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { AmazonButton } from "@/components/ui/amazon-link";
import { RatingSummary } from "@/components/ui/stars";
import { Price } from "@/components/product/price";
import { amazon, site } from "@/lib/site";
import type { Product } from "@/lib/products";
import { cn, formatDate } from "@/lib/utils";

export const PRICE_NOTE = `Prices checked ${formatDate(site.catalogCheckedAt)}; Amazon shows the live price.`;

/**
 * Compact buy box for the article header and the sticky reading rail.
 * With no product it becomes a store-level call to action.
 */
export function QuickBuyCard({
  product,
  placement,
  className,
  layout = "row",
  eyebrow = "Featured in this guide",
}: {
  product?: Product;
  placement: string;
  className?: string;
  layout?: "row" | "stack";
  eyebrow?: string;
}) {
  if (!product) {
    return (
      <div className={cn("grain relative overflow-hidden rounded-4xl bg-ink p-6 text-cream shadow-lift [&_:focus-visible]:outline-sun", className)}>
        <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-sun/20 blur-2xl" />
        <div className="relative z-[2] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sun">
              <Image src="/brand/mark.png" alt="" width={278} height={278} className="size-8" />
            </span>
            <p className="eyebrow text-sun">PoundMart on Amazon</p>
          </div>
          <p className="font-display text-xl font-bold leading-tight">Great value bundles of the essentials in this guide.</p>
          <AmazonButton href={amazon.store()} placement={placement} size="md" className="w-full">
            Shop PoundMart on Amazon
          </AmazonButton>
          <p className="text-xs text-cream/65">Sold by PoundMart, dispatched by Amazon.</p>
        </div>
      </div>
    );
  }

  const v = product.primary;
  const stack = layout === "stack";
  return (
    <div
      className={cn("group relative overflow-hidden rounded-4xl border border-line bg-paper p-5 shadow-soft transition-shadow duration-500 hover:shadow-lift", className)}
      style={{ ["--accent-soft" as string]: product.accentSoft }}
    >
      <p className="eyebrow mb-4 flex items-center gap-2 text-[10px] text-ink-muted">
        <span aria-hidden className="size-1.5 rounded-full" style={{ background: product.accent }} />
        {eyebrow}
      </p>
      <div className={cn("flex gap-4", stack ? "flex-col" : "items-center")}>
        <Link
          href={`/shop/${product.slug}`}
          tabIndex={-1}
          aria-hidden
          className={cn(
            "relative shrink-0 cursor-pointer overflow-hidden rounded-3xl bg-[var(--accent-soft)]",
            stack ? "aspect-square w-full" : "size-24 sm:size-28",
          )}
        >
          <span className="absolute left-1/2 top-1/2 size-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 transition-transform duration-700 group-hover:scale-110" />
          <Image
            src={v.image}
            alt=""
            fill
            sizes={stack ? "300px" : "112px"}
            className="product-cutout object-contain p-[12%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-3 group-hover:scale-105"
          />
        </Link>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Link
            href={`/shop/${product.slug}`}
            className="cursor-pointer font-display text-base font-bold leading-snug text-ink underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-300 hover:decoration-sun"
          >
            {product.name}
          </Link>
          {v.rating && (
            <span className="flex flex-wrap items-center gap-x-1.5 text-xs text-ink-muted">
              <RatingSummary rating={v.rating} count={v.reviewCount} className="text-xs text-ink" />
              <span>on Amazon</span>
            </span>
          )}
          <Price product={product} size="sm" />
        </div>
      </div>
      <AmazonButton href={amazon.product(v.asin)} asin={v.asin} placement={placement} size="md" className="mt-5 w-full">
        Buy on Amazon
      </AmazonButton>
      <p className="mt-3 text-[11px] leading-snug text-ink-muted">{PRICE_NOTE}</p>
    </div>
  );
}

/** "Written by" box linking to the About page. */
export function AuthorBox({ author }: { author: string }) {
  return (
    <div className="relative overflow-hidden rounded-5xl border border-line bg-paper p-7 shadow-soft sm:p-10">
      <div aria-hidden className="dot-grid absolute inset-y-0 right-0 w-1/2 opacity-40 [mask-image:linear-gradient(to_left,black,transparent)]" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative grid size-20 shrink-0 place-items-center rounded-full bg-sun shadow-glow sm:size-24">
          <Image src="/brand/mark.png" alt="" width={278} height={278} className="size-12 sm:size-14" />
          <span aria-hidden className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-4 border-paper bg-ink text-xs text-sun">
            ✦
          </span>
        </div>
        <div className="flex-1">
          <p className="eyebrow text-ink-muted">Written by</p>
          <p className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">{author}</p>
          <p className="mt-3 max-w-[60ch] leading-relaxed text-ink-muted">
            We&apos;re the UK-based team behind PoundMart. We package and quality-check every bundle before it heads to Amazon, and we write these
            guides to help you get more from your everyday essentials while spending less on them.
          </p>
        </div>
        <Link
          href="/about"
          className="group inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 self-start rounded-full border-2 border-ink/15 px-5 text-sm font-semibold text-ink transition-[border-color,background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-cream sm:self-center"
        >
          More about PoundMart
          <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

type NavPost = { slug: string; title: string; category: string; date: string };

/** Older / newer post navigation. */
export function PostNav({ older, newer }: { older?: NavPost; newer?: NavPost }) {
  if (!older && !newer) return null;
  return (
    <nav aria-label="More guides" className="grid gap-4 sm:grid-cols-2">
      {older ? <NavCard post={older} direction="older" /> : <span aria-hidden className="hidden sm:block" />}
      {newer ? <NavCard post={newer} direction="newer" /> : <span aria-hidden className="hidden sm:block" />}
    </nav>
  );
}

function NavCard({ post, direction }: { post: NavPost; direction: "older" | "newer" }) {
  const newer = direction === "newer";
  return (
    <Link
      href={`/blog/${post.slug}`}
      rel={newer ? "next" : "prev"}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-4xl border border-line bg-paper p-6 shadow-soft transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-ink/20 hover:shadow-lift sm:p-7",
        newer && "sm:items-end sm:text-right",
      )}
    >
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-sun transition-transform duration-500 group-hover:scale-x-100" />
      <span className={cn("inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted", newer && "sm:flex-row-reverse")}>
        {newer ? (
          <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        ) : (
          <ArrowLeft aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
        )}
        {newer ? "Newer guide" : "Older guide"}
      </span>
      <span className="font-display text-lg font-bold leading-snug text-ink sm:text-xl">{post.title}</span>
      <span className="text-xs text-ink-muted">
        {post.category} · {formatDate(post.date, { day: "numeric", month: "short", year: "numeric" })}
      </span>
    </Link>
  );
}
