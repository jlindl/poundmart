import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide-react";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { getCategoryArt } from "@/components/blog/category-art";
import { amazon } from "@/lib/site";
import { cn } from "@/lib/utils";

const panelSize = "shrink-0 lg:h-[min(36rem,78vh)]";

/** Opening panel of the category rail: the section heading. */
export function RailIntroPanel({ total }: { total: number }) {
  return (
    <div data-rail-panel className={cn(panelSize, "flex flex-col justify-center lg:w-[27rem] lg:pr-6")}>
      <p className="eyebrow inline-flex items-center gap-2 text-sun">
        <span aria-hidden className="size-1.5 rounded-full bg-sun" />
        Browse by category
      </p>
      <SplitHeading
        as="h2"
        text="Four shelves, *zero* fluff."
        className="type-display mt-5 max-w-[11ch] text-[clamp(2.6rem,5vw,4.6rem)] text-cream"
        accentClassName="text-sun"
      />
      <p className="mt-6 max-w-[38ch] text-lg leading-relaxed text-cream/75">
        {total > 0
          ? `All ${total} guides live on one of four shelves. Pick yours and dig in.`
          : "Every guide lives on one of four shelves. Pick yours and dig in."}
      </p>
      <p aria-hidden className="mt-8 hidden items-center gap-3 text-sm font-semibold text-cream/60 lg:flex">
        Keep scrolling
        <MoveRight className="size-5 animate-pulse text-sun" />
      </p>
    </div>
  );
}

/** One category on the rail: cover, blurb, the two newest guides and a clear way in. */
export function RailCategoryPanel({
  index,
  slug,
  name,
  accent,
  count,
  latest,
}: {
  index: number;
  slug: string;
  name: string;
  accent: string;
  count: number;
  latest: { slug: string; title: string }[];
}) {
  const art = getCategoryArt(slug);
  const contain = art.cover.fit === "contain";
  return (
    <article
      data-rail-panel
      className={cn(panelSize, "group relative flex flex-col overflow-hidden rounded-5xl bg-paper text-ink shadow-lift lg:w-[min(30rem,40vw)]")}
    >
      <div className="relative h-52 shrink-0 overflow-hidden sm:h-60 lg:h-[40%]" style={{ background: art.cover.tint ?? `${accent}22` }}>
        {contain && <div aria-hidden className="absolute left-1/2 top-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 lg:size-[88%]" />}
        <Image
          src={art.cover.src}
          alt={art.cover.alt}
          fill
          sizes="(min-width: 1024px) 480px, 92vw"
          className={cn(
            "transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover:scale-[1.06]",
            contain ? "product-cutout object-contain p-[8%]" : "object-cover",
          )}
          style={art.cover.objectPosition ? { objectPosition: art.cover.objectPosition } : undefined}
        />
        <span
          aria-hidden
          className={cn(
            "absolute left-5 top-5 font-display text-5xl font-bold leading-none tracking-tight",
            contain ? "text-ink" : "text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.35)]",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink backdrop-blur">
          {count === 0 ? "Coming soon" : `${count} ${count === 1 ? "guide" : "guides"}`}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 sm:p-7">
        <h3 className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          <span aria-hidden className="size-3 rounded-full" style={{ background: accent }} />
          {name}
        </h3>
        <p className="text-[0.95rem] leading-relaxed text-ink-muted">{art.teaser}</p>
        {latest.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1.5">
            {latest.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group/link flex cursor-pointer items-start gap-2 rounded-lg text-sm font-medium leading-snug text-ink transition-colors hover:text-ink-soft"
                >
                  <ArrowRight aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ink-muted transition-transform duration-300 group-hover/link:translate-x-0.5" />
                  <span className="line-clamp-1 underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-300 group-hover/link:decoration-sun">
                    {p.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/blog/category/${slug}`}
          className="group/cta mt-auto inline-flex h-12 cursor-pointer items-center justify-between gap-3 rounded-full border-2 border-ink/10 pl-5 pr-1.5 text-sm font-semibold text-ink transition-[border-color,background-color,color] duration-300 hover:border-ink hover:bg-ink hover:text-cream"
        >
          Explore {name}
          <span className="grid size-9 place-items-center rounded-full bg-sun text-ink-deep transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-rotate-12">
            <ArrowRight aria-hidden className="size-4" />
          </span>
        </Link>
      </div>
    </article>
  );
}

/** Closing panel of the rail: the conversion stop. */
export function RailCtaPanel() {
  return (
    <div
      data-rail-panel
      className={cn(panelSize, "grain relative flex flex-col justify-between overflow-hidden rounded-5xl bg-sun p-7 text-ink-deep sm:p-9 lg:w-[min(26rem,34vw)]")}
    >
      <Image
        src="/brand/mark.png"
        alt=""
        width={278}
        height={278}
        className="pointer-events-none absolute -bottom-10 -right-10 z-[1] size-56 rotate-12 opacity-25"
      />
      <div className="relative z-[2]">
        <p className="eyebrow">Ready when you are</p>
        <p className="mt-4 font-display text-[clamp(2rem,3.4vw,3rem)] font-bold leading-[0.98] tracking-tight">
          From reading list to <span className="accent-serif">shopping list.</span>
        </p>
        <p className="mt-4 leading-relaxed text-ink-deep/80">
          Every bundle is sold by PoundMart and dispatched by Amazon, so checkout is the bit you already know.
        </p>
      </div>
      <div className="relative z-[2] mt-8 flex flex-col gap-3">
        <AmazonButton href={amazon.store()} placement="blog-index-rail" variant="ink" size="lg" className="w-full">
          Visit our Amazon store
        </AmazonButton>
        <ButtonLink href="/shop" variant="light" size="lg" className="w-full">
          Browse the shop
        </ButtonLink>
      </div>
    </div>
  );
}
