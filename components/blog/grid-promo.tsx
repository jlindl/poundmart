import Image from "next/image";
import { AmazonButton } from "@/components/ui/amazon-link";
import { ButtonLink } from "@/components/ui/button";
import { amazon } from "@/lib/site";

const shots = [
  { src: "/products/B0G318R9JG/g1.jpg", tint: "#EFE3FA", rotate: "-rotate-6" },
  { src: "/products/B0G3BS11B8/g1.jpg", tint: "#FDE6E1", rotate: "rotate-3" },
  { src: "/products/B0GBMH1N54/g1.jpg", tint: "#F3E8DB", rotate: "-rotate-2" },
];

/** Full-width promo that sits mid-grid on the blog index, between rows of guides. */
export function GridPromo() {
  return (
    <aside className="grain group/promo relative overflow-hidden rounded-5xl bg-ink px-6 py-10 text-cream [&_:focus-visible]:outline-sun sm:px-10 sm:py-12 lg:px-14">
      <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-sun/15 blur-3xl transition-transform duration-1000 group-hover/promo:scale-125" />
      <div aria-hidden className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-sky/10 blur-3xl" />
      <div className="relative z-[2] grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow text-sun">A quick word from the shop floor</p>
          <p className="mt-4 max-w-[18ch] font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[0.98] tracking-tight">
            Reading is lovely. <span className="accent-serif text-sun">Stocking up</span> is lovelier.
          </p>
          <p className="mt-4 max-w-[46ch] leading-relaxed text-cream/75">
            We bundle the everyday essentials these guides talk about into great value multi-packs, sold by PoundMart and dispatched by Amazon, with 30-day returns.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <AmazonButton href={amazon.store("shopAll")} placement="blog-grid-promo" size="md">
              Shop the bundles
            </AmazonButton>
            <ButtonLink href="/collections/bundles" variant="glass" size="md">
              Compare bundles
            </ButtonLink>
          </div>
        </div>
        <div aria-hidden className="relative mx-auto flex h-44 w-full max-w-md items-center justify-center sm:h-52">
          {shots.map((s, i) => (
            <div
              key={s.src}
              className={`relative -mx-3 aspect-square w-1/3 shrink-0 rounded-full shadow-lift ring-4 ring-ink transition-transform duration-700 ease-[var(--ease-spring)] ${s.rotate} group-hover/promo:-translate-y-2 group-hover/promo:rotate-0`}
              style={{ background: s.tint, transitionDelay: `${i * 70}ms` }}
            >
              <div className="absolute inset-[10%] rounded-full bg-white/70" />
              <Image src={s.src} alt="" fill sizes="(min-width: 1024px) 12vw, 30vw" className="product-cutout object-contain p-[16%]" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
