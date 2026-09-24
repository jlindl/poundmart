import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { imageExists } from "@/components/ui/image-slot";
import { getCategory, type Post } from "@/lib/blog";
import { getProduct } from "@/lib/products";
import { cn, formatDate } from "@/lib/utils";

/**
 * A post's cover. Uses the hero photo when the file exists; otherwise builds a
 * branded cover from the post's first featured product on the category colour,
 * so the blog looks finished before photography arrives. Server Component.
 */
export function PostCover({
  post,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
}: {
  post: Pick<Post, "heroImage" | "heroImageAlt" | "products" | "categorySlug" | "category" | "title">;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const accent = getCategory(post.categorySlug)?.accent ?? "#FCD000";
  if (imageExists(post.heroImage)) {
    return (
      <div className={cn("relative overflow-hidden bg-sand", className)}>
        <Image src={post.heroImage} alt={post.heroImageAlt} fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
      </div>
    );
  }
  const product = post.products.map(getProduct).find(Boolean);
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: product ? product.accentSoft : `${accent}26` }}
      role="img"
      aria-label={post.heroImageAlt}
    >
      <div aria-hidden className="dot-grid absolute inset-0 opacity-50" />
      <div
        aria-hidden
        className="absolute -right-[12%] -top-[20%] aspect-square w-[70%] rounded-full opacity-60 blur-2xl transition-transform duration-700 group-hover:scale-110"
        style={{ background: product?.accent ?? accent }}
      />
      <div aria-hidden className="absolute bottom-[-30%] left-[-10%] aspect-square w-[55%] rounded-full bg-white/60" />
      {product ? (
        <Image
          src={product.primary.image}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="product-cutout object-contain p-[12%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-3 group-hover:scale-[1.06]"
        />
      ) : (
        <Image
          src="/brand/mark.png"
          alt=""
          width={278}
          height={278}
          className="absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110"
        />
      )}
      <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink backdrop-blur">
        {post.category}
      </span>
    </div>
  );
}

/** Blog card. `variant="feature"` for the large lead story. */
export function PostCard({
  post,
  variant = "default",
  className,
  priority = false,
}: {
  post: Post;
  variant?: "default" | "feature" | "compact";
  className?: string;
  priority?: boolean;
}) {
  const feature = variant === "feature";
  const compact = variant === "compact";
  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-4xl border border-line bg-paper shadow-soft transition-[box-shadow,transform] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-lift",
        feature ? "flex-col lg:grid lg:grid-cols-[1.15fr_1fr]" : compact ? "flex-row items-stretch" : "flex-col",
        className,
      )}
    >
      <PostCover
        post={post}
        priority={priority}
        className={cn(feature ? "aspect-[16/11] lg:aspect-auto lg:min-h-[440px]" : compact ? "aspect-square w-32 shrink-0 sm:w-40" : "aspect-[16/11]")}
        sizes={feature ? "(min-width: 1024px) 55vw, 100vw" : compact ? "160px" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
      />
      <div className={cn("flex flex-1 flex-col gap-3", feature ? "p-7 sm:p-10 lg:justify-center" : compact ? "p-5" : "p-6 sm:p-7")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-ink-muted">
          <time dateTime={post.date}>{formatDate(post.date, { day: "numeric", month: "short", year: "numeric" })}</time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden /> {post.readMinutes} min read
          </span>
        </div>
        <h3
          className={cn(
            "font-display font-bold leading-[1.08] tracking-tight text-ink",
            feature ? "text-[clamp(1.8rem,3.2vw,2.8rem)]" : compact ? "text-base" : "text-xl",
          )}
        >
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-4xl focus-visible:outline-none">
            {post.title}
          </Link>
        </h3>
        {!compact && <p className={cn("leading-relaxed text-ink-muted", feature ? "text-lg" : "line-clamp-3 text-[0.95rem]")}>{post.excerpt}</p>}
        {!compact && (
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-ink">
            <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-sun after:transition-transform after:duration-300 group-hover:after:scale-x-100">
              Read the guide
            </span>
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
        )}
      </div>
    </article>
  );
}
