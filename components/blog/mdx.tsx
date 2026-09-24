/**
 * MDX rendering for blog posts. Posts are trusted repo content (hand-written or
 * from the SEO engine). Only the components registered below may be used in a
 * post; keep this list in sync with content/README.md and the engine config.
 */
import Link from "next/link";
import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { ArrowUpRight, Lightbulb, AlertTriangle, Info } from "lucide-react";
import { AmazonButton, AmazonLink } from "@/components/ui/amazon-link";
import { RatingSummary } from "@/components/ui/stars";
import { Price } from "@/components/product/price";
import { amazon } from "@/lib/site";
import { getProduct, isInStock } from "@/lib/products";
import { cn } from "@/lib/utils";

/* ---------- Typography ---------- */

function A({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  const cls =
    "font-semibold text-ink underline decoration-sun decoration-[3px] underline-offset-[5px] transition-colors hover:decoration-ink";
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  if (/amazon\.co\.uk/.test(href)) {
    return (
      <AmazonLink href={href} placement="blog-inline" className={cn(cls, "inline-flex items-baseline gap-0.5")}>
        {children}
        <ArrowUpRight aria-hidden className="size-3.5 self-center" />
      </AmazonLink>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
      {children}
    </a>
  );
}

const H2 = (p: ComponentPropsWithoutRef<"h2">) => (
  <h2 {...p} className="mt-16 mb-5 scroll-mt-32 text-[clamp(1.75rem,3vw,2.35rem)] font-bold leading-[1.1] text-ink first:mt-0" />
);
const H3 = (p: ComponentPropsWithoutRef<"h3">) => (
  <h3 {...p} className="mt-10 mb-3 scroll-mt-32 text-xl font-bold leading-snug text-ink sm:text-2xl" />
);
const H4 = (p: ComponentPropsWithoutRef<"h4">) => <h4 {...p} className="mt-8 mb-2 text-lg font-bold text-ink" />;
const P = (p: ComponentPropsWithoutRef<"p">) => <p {...p} className="my-5 text-[1.075rem] leading-[1.8] text-ink/85" />;
const UL = (p: ComponentPropsWithoutRef<"ul">) => (
  <ul {...p} className="my-6 flex flex-col gap-3 pl-0 [&>li]:relative [&>li]:pl-8 [&>li]:before:absolute [&>li]:before:left-1 [&>li]:before:top-[0.7em] [&>li]:before:size-2.5 [&>li]:before:rounded-full [&>li]:before:bg-sun [&>li]:before:ring-4 [&>li]:before:ring-sun-soft" />
);
const OL = (p: ComponentPropsWithoutRef<"ol">) => (
  <ol {...p} className="my-6 flex list-none flex-col gap-3 pl-0 [counter-reset:li] [&>li]:relative [&>li]:pl-11 [&>li]:[counter-increment:li] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-0.5 [&>li]:before:grid [&>li]:before:size-7 [&>li]:before:place-items-center [&>li]:before:rounded-full [&>li]:before:bg-ink [&>li]:before:text-xs [&>li]:before:font-bold [&>li]:before:text-cream [&>li]:before:content-[counter(li)]" />
);
const LI = (p: ComponentPropsWithoutRef<"li">) => <li {...p} className="text-[1.05rem] leading-[1.7] text-ink/85 [&>p]:my-0" />;
const Blockquote = (p: ComponentPropsWithoutRef<"blockquote">) => (
  <blockquote
    {...p}
    className="my-10 border-l-4 border-sun pl-6 font-serif text-2xl italic leading-snug text-ink [&>p]:font-serif [&>p]:text-2xl [&>p]:italic [&>p]:text-ink"
  />
);
const HR = () => (
  <div aria-hidden className="my-14 flex items-center justify-center gap-3 text-sun">
    <span className="h-px w-16 bg-line" />✦<span className="h-px w-16 bg-line" />
  </div>
);
const Strong = (p: ComponentPropsWithoutRef<"strong">) => <strong {...p} className="font-semibold text-ink" />;
const Table = (p: ComponentPropsWithoutRef<"table">) => (
  <div className="my-8 overflow-x-auto rounded-3xl border border-line bg-paper shadow-soft" data-lenis-prevent-wheel>
    <table {...p} className="w-full min-w-[520px] border-collapse text-left text-[0.95rem]" />
  </div>
);
const TH = (p: ComponentPropsWithoutRef<"th">) => <th {...p} className="bg-ink px-4 py-3 font-semibold text-cream first:rounded-tl-3xl last:rounded-tr-3xl" />;
const TD = (p: ComponentPropsWithoutRef<"td">) => <td {...p} className="border-t border-line px-4 py-3 align-top text-ink/85" />;
const Img = ({ src = "", alt = "" }: ComponentPropsWithoutRef<"img">) =>
  typeof src === "string" && src ? (
    <span className="relative my-8 block aspect-[16/10] overflow-hidden rounded-3xl bg-sand">
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 720px, 100vw" className="object-cover" />
    </span>
  ) : null;

/* ---------- Post components (usable in MDX) ---------- */

/** Store-level call to action. The SEO engine's `ctaComponent`. */
export function AmazonCta({
  title = "Stock up for less on Amazon",
  text = "Every PoundMart bundle is sold by PoundMart and dispatched by Amazon, with 30-day returns.",
  button = "Shop PoundMart on Amazon",
}: {
  title?: string;
  text?: string;
  button?: string;
}) {
  return (
    <aside className="grain relative my-12 overflow-hidden rounded-4xl bg-ink p-8 text-cream sm:p-10">
      <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-sun/20 blur-2xl" />
      <div aria-hidden className="absolute -bottom-20 left-10 size-48 rounded-full bg-sun/10 blur-2xl" />
      <div className="relative z-[2] flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md">
          <p className="eyebrow mb-2 text-sun">PoundMart on Amazon</p>
          <p className="font-display text-2xl font-bold leading-tight sm:text-3xl">{title}</p>
          <p className="mt-2 text-cream/70">{text}</p>
        </div>
        <AmazonButton href={amazon.store()} placement="blog-cta" size="lg" className="shrink-0">
          {button}
        </AmazonButton>
      </div>
    </aside>
  );
}

/** Inline product feature. `slug` is a product slug from lib/products.ts. */
export function ProductSpotlight({ slug, note }: { slug: string; note?: string }) {
  const product = getProduct(slug);
  if (!product) {
    if (process.env.NODE_ENV !== "production") throw new Error(`[mdx] <ProductSpotlight slug="${slug}"> is not a known product`);
    return null;
  }
  const v = product.primary;
  return (
    <aside
      className="group relative my-10 grid overflow-hidden rounded-4xl border border-line bg-paper shadow-soft transition-shadow duration-500 hover:shadow-lift sm:grid-cols-[220px_1fr]"
      style={{ ["--accent-soft" as string]: product.accentSoft }}
    >
      <div className="relative aspect-square bg-[var(--accent-soft)] sm:aspect-auto">
        <Image
          src={v.image}
          alt={product.name}
          fill
          sizes="220px"
          className="product-cutout object-contain p-6 transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-2"
        />
      </div>
      <div className="flex flex-col gap-3 p-6 sm:p-7">
        <span className="eyebrow text-[10px] text-ink-muted">{note ?? "Featured in this guide"}</span>
        <Link href={`/shop/${product.slug}`} className="font-display text-xl font-bold leading-tight text-ink hover:underline">
          {product.name}
        </Link>
        <p className="text-sm leading-relaxed text-ink-muted">{product.summary}</p>
        <RatingSummary rating={v.rating} count={v.reviewCount} />
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Price product={product} size="sm" />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <AmazonButton href={amazon.product(v.asin)} placement="blog-spotlight" asin={v.asin} size="sm" showBag={false} variant={isInStock(product) ? "sun" : "outline"}>
            {isInStock(product) ? "Buy on Amazon" : "View on Amazon"}
          </AmazonButton>
          <Link
            href={`/shop/${product.slug}`}
            className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            Details
          </Link>
        </div>
      </div>
    </aside>
  );
}

const calloutStyles = {
  tip: { icon: Lightbulb, label: "Tip", cls: "bg-sun-pale border-sun/50" },
  note: { icon: Info, label: "Good to know", cls: "bg-sky/60 border-sky" },
  warning: { icon: AlertTriangle, label: "Heads up", cls: "bg-[#FFE9E4] border-[#F7C6BA]" },
} as const;

/** Highlighted aside. `type`: tip | note | warning. */
export function Callout({ type = "tip", title, children }: { type?: keyof typeof calloutStyles; title?: string; children: ReactNode }) {
  const s = calloutStyles[type] ?? calloutStyles.tip;
  const Icon = s.icon;
  return (
    <aside className={cn("my-8 rounded-3xl border p-6", s.cls)}>
      <p className="mb-2 flex items-center gap-2 font-display text-base font-bold text-ink">
        <Icon className="size-4" aria-hidden /> {title ?? s.label}
      </p>
      <div className="text-ink/85 [&_p]:my-2 [&_p]:text-base [&_p]:leading-relaxed">{children}</div>
    </aside>
  );
}

const components = {
  a: A,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  blockquote: Blockquote,
  hr: HR,
  strong: Strong,
  table: Table,
  th: TH,
  td: TD,
  img: Img,
  AmazonCta,
  ProductSpotlight,
  Callout,
};

export async function PostBody({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  });
  return (
    <div className="post-body">
      <Content components={components} />
    </div>
  );
}
