/**
 * Homepage data, computed at build time from the product catalogue.
 * Server-side only: client components receive the plain shapes in ./types.
 * Every number here comes from lib/products (the Amazon snapshot); nothing is invented.
 */
import { amazon, brandFacts, site } from "@/lib/site";
import {
  collections,
  fromPrice,
  getProduct,
  getProductByAsin,
  isInStock,
  pricePerUnit,
  products,
  productsIn,
  totalReviews,
  averageRating,
  type Product,
  type Variant,
} from "@/lib/products";
import { formatDate, formatPrice } from "@/lib/utils";
import type { BundleMathsData, FaqItem, FlavourOption, HeroData, TickerItem } from "./types";

export const priceNote = `Prices checked ${formatDate(site.catalogCheckedAt)}; Amazon shows the live price.`;

const inStock = products.filter(isInStock);

function requireProduct(slug: string): Product {
  const p = getProduct(slug);
  if (!p) throw new Error(`[home] product "${slug}" missing from lib/products.ts`);
  return p;
}

function variantByAsin(asin: string): { product: Product; variant: Variant } {
  const product = getProductByAsin(asin);
  const variant = product?.variants.find((v) => v.asin === asin);
  if (!product || !variant) throw new Error(`[home] ASIN ${asin} missing from lib/products.ts`);
  return { product, variant };
}

/* ---------- Ratings ---------- */

/** Weighted average Amazon rating and ratings count across in-stock products (shared variant pools counted once). */
export function ratingStats(list: Product[] = inStock) {
  return { average: averageRating(list) ?? 0, count: totalReviews(list) };
}

/** Product-level ratings count, for ranking. */
function ratingsFor(p: Product) {
  return totalReviews([p]);
}

/* ---------- Flavours & scents ---------- */

const FLAVOUR_COLOURS: Record<string, string> = {
  "Watermelon Fresh": "#FF5468",
  "Feelin' Grape": "#A66BE0",
  "Peachy Clean": "#FF9B54",
  "Berry Burst": "#5B8BFF",
  "Yummy Gummy": "#E6508F",
  "Candy Clean": "#FF7EB6",
  "Cherry & Almond": "#F2765F",
  "Dragon Fruit & Vanilla": "#E562B0",
  "Mango & Coconut": "#FDB42C",
  "Moroccan Argan Oil": "#C9914F",
  "Rosemary & Mint": "#2FB59B",
  Coconut: "#F3ECDD",
  Banana: "#FFE066",
  Papaya: "#FF8A4C",
};

function uniqueFlavours(list: Product[]): TickerItem[] {
  const names = [...new Set(list.flatMap((p) => p.flavours))];
  return names.map((name) => ({ name, color: FLAVOUR_COLOURS[name] ?? list.find((p) => p.flavours.includes(name))?.accent ?? "#FCD000" }));
}

export const toothpasteFlavours = uniqueFlavours(products.filter((p) => p.category === "toothpaste"));
export const haircareScents = uniqueFlavours(products.filter((p) => p.category === "haircare"));

/* ---------- Hero ---------- */

const TWELVE_PACK = "nice-smile-12-pack-toothpaste-bundle";

export function heroData(): HeroData {
  const { average, count } = ratingStats();
  const twelve = requireProduct(TWELVE_PACK);
  const perUnit = pricePerUnit(twelve.primary);
  const packshots = [
    TWELVE_PACK,
    "xhc-no-rinse-conditioner-3-pack",
    "xhc-argan-oil-shampoo-conditioner-set",
    "xhc-shampoo-conditioner-bars",
  ].map((slug) => {
    const p = requireProduct(slug);
    return { slug: p.slug, name: p.name, image: p.primary.image, accent: p.accent, accentSoft: p.accentSoft };
  });
  return {
    storeHref: amazon.store(),
    rating: average,
    ratingCount: count,
    packshots,
    sticker: { perUnit: perUnit ? formatPrice(perUnit) : "", units: twelve.primary.units },
    priceNote,
  };
}

/* ---------- The bundle maths ---------- */

const BUNDLE_STEPS = [
  { asin: "B0FNYGR43T", id: "single", label: "1 tube", title: "The single", note: "Watermelon Fresh, one 60g tube" },
  { asin: "B0FLWZ7D6T", id: "three", label: "3 pack", title: "The fruity trio", note: "Watermelon, Grape and Peach" },
  { asin: "B0GTWGV3Q5", id: "six", label: "6 pack", title: "The sweet six", note: "Berry, Gummy and Candy, two of each" },
  { asin: "B0HBXLVW4S", id: "twelve", label: "12 pack", title: "The big box", note: "Four each of Watermelon, Grape and Peach" },
] as const;

const STEP_TINTS = ["#FFE3E6", "#FFEBDC", "#E1E9FC", "#FFF3B8"];

export function bundleMathsData(): BundleMathsData {
  const rows = BUNDLE_STEPS.map((s) => ({ ...s, ...variantByAsin(s.asin) })).filter((r) => r.variant.inStock && r.variant.price !== null);
  const base = pricePerUnit(rows[0].variant) ?? 0;
  const steps = rows.map((r, i) => {
    const per = pricePerUnit(r.variant) ?? 0;
    return {
      id: r.id,
      label: r.label,
      title: r.title,
      note: r.note,
      units: r.variant.units,
      price: formatPrice(r.variant.price ?? 0),
      perUnit: per,
      perUnitLabel: formatPrice(per),
      saving: base && i > 0 ? Math.round((1 - per / base) * 100) : 0,
      image: r.variant.image,
      accentSoft: STEP_TINTS[i % STEP_TINTS.length],
    };
  });
  const last = rows[rows.length - 1];
  return {
    steps,
    finalHref: amazon.product(last.variant.asin),
    finalAsin: last.variant.asin,
    finalSlug: last.product.slug,
    finalName: last.product.name,
    finalLabel: last.label,
    priceNote,
  };
}

/* ---------- Pick your flavour ---------- */

const FLAVOUR_PICKS: {
  id: string;
  name: string;
  pun: string;
  slug: string;
  panel: string;
  panelAlt: string;
  pack: string;
  packWide?: boolean;
  packLabel: string;
  description: string;
}[] = [
  {
    id: "watermelon",
    name: "Watermelon Fresh",
    pun: "You're one in a melon.",
    slug: "nice-smile-watermelon-fresh-toothpaste",
    panel: "/products/B0FNYGR43T/g2.jpg",
    panelAlt: "Nice Smile Watermelon Fresh toothpaste with watermelon slices and the line You're one in a melon",
    pack: "/products/B0FNYGR43T/g1.jpg",
    packLabel: "Single 60g tube",
    description: "Juicy watermelon flavour with fluoride and gentle whitening. Fruity enough that brushing stops being a negotiation.",
  },
  {
    id: "grape",
    name: "Feelin' Grape",
    pun: "Brush with grape-ness.",
    slug: "nice-smile-feelin-grape-toothpaste",
    panel: "/products/B0FNYH9TFC/g2.jpg",
    panelAlt: "Nice Smile Feelin' Grape toothpaste with a bunch of grapes and the line Brush with grape-ness",
    pack: "/products/B0FNYH9TFC/g1.jpg",
    packLabel: "Single 60g tube",
    description: "A proper grape hit in a vegan, enamel-safe fluoride toothpaste. The purple one everybody fights over.",
  },
  {
    id: "peach",
    name: "Peachy Clean",
    pun: "Peach, please.",
    slug: "nice-smile-3-pack-watermelon-grape-peach",
    panel: "/products/B0FLWZ7D6T/g5.jpg",
    panelAlt: "Nice Smile Peachy Clean toothpaste with fresh peaches and the line Peach please",
    pack: "/products/B0FLWZ7D6T/g1.jpg",
    packWide: true,
    packLabel: "In the fruity 3 pack",
    description: "Soft, sunny peach flavour. Find it in our fruity 3 pack alongside Watermelon Fresh and Feelin' Grape.",
  },
  {
    id: "berry",
    name: "Berry Burst",
    pun: "Berry nice to meet you.",
    slug: "nice-smile-3-pack-berry-gummy-candy",
    panel: "/products/B0FLFZ2Z6C/g3.jpg",
    panelAlt: "Nice Smile Berry Burst toothpaste surrounded by blueberries and raspberries with its key benefits",
    pack: "/products/B0FLFZ2Z6C/g1.jpg",
    packWide: true,
    packLabel: "In the sweet-tooth 3 pack",
    description: "A burst of mixed berries. It lives in our most reviewed bundle, next to Yummy Gummy and Candy Clean.",
  },
  {
    id: "gummy",
    name: "Yummy Gummy",
    pun: "Un-bear-ably fresh.",
    slug: "nice-smile-yummy-gummy-toothpaste",
    panel: "/products/B0FPDJHWN8/g2.jpg",
    panelAlt: "Nice Smile Yummy Gummy toothpaste with gummy bears and the line Un-bear-ably fresh",
    pack: "/products/B0FPDJHWN8/g1.jpg",
    packLabel: "Single 60g tube",
    description: "Gummy bear flavour for little brushers and big kids alike. Vegan, cruelty-free and made with fluoride.",
  },
  {
    id: "candy",
    name: "Candy Clean",
    pun: "Hello, sweet tooth.",
    slug: "nice-smile-candy-clean-toothpaste",
    panel: "/products/B0FPDJXQRG/g2.jpg",
    panelAlt: "Nice Smile Candy Clean toothpaste with pink cotton candy and the line Hello sweet tooth",
    pack: "/products/B0FPDJXQRG/g1.jpg",
    packLabel: "Single 60g tube",
    description: "Cotton candy sweetness in a gentle whitening fluoride toothpaste. Bedtime brushing, sorted.",
  },
];

/** Pastel backgrounds per flavour: light enough for ink text at AA contrast. */
const FLAVOUR_TINTS: Record<string, { accent: string; soft: string }> = {
  watermelon: { accent: "#FF5468", soft: "#FFE3E6" },
  grape: { accent: "#7B3FB8", soft: "#EDE2F8" },
  peach: { accent: "#FF9B54", soft: "#FFEBDC" },
  berry: { accent: "#3D6FE8", soft: "#E1E9FC" },
  gummy: { accent: "#E6508F", soft: "#FCE1EC" },
  candy: { accent: "#FF7EB6", soft: "#FFE4F0" },
};

export function flavourOptions(): FlavourOption[] {
  return FLAVOUR_PICKS.map((f) => {
    const p = requireProduct(f.slug);
    const v = p.primary;
    return {
      id: f.id,
      name: f.name,
      pun: f.pun,
      accent: FLAVOUR_TINTS[f.id].accent,
      soft: FLAVOUR_TINTS[f.id].soft,
      description: f.description,
      productName: p.name,
      productSlug: p.slug,
      asin: v.asin,
      amazonHref: amazon.product(v.asin),
      priceLabel: v.inStock && v.price !== null ? formatPrice(v.price) : null,
      packLabel: f.packLabel,
      rating: v.rating,
      reviewCount: v.reviewCount,
      panel: f.panel,
      panelAlt: f.panelAlt,
      pack: f.pack,
      packWide: f.packWide ?? false,
    };
  });
}

/* ---------- Categories ---------- */

export function categoryData() {
  const toothpaste = collections.find((c) => c.slug === "toothpaste")!;
  const haircare = collections.find((c) => c.slug === "haircare")!;
  const bundles = collections.find((c) => c.slug === "bundles")!;
  const fresh = collections.find((c) => c.slug === "new-arrivals")!;
  const count = (slug: string) => productsIn(collections.find((c) => c.slug === slug)!).filter(isInStock).length;
  return {
    toothpaste: { ...pick(toothpaste), count: count("toothpaste"), flavours: toothpasteFlavours },
    haircare: { ...pick(haircare), count: count("haircare"), flavours: haircareScents },
    bundles: { ...pick(bundles), count: count("bundles") },
    fresh: { ...pick(fresh), count: count("new-arrivals") },
  };
}

function pick(c: (typeof collections)[number]) {
  return { slug: c.slug, title: c.title, eyebrow: c.eyebrow, description: c.description, image: c.image, accent: c.accent };
}

/* ---------- Bestsellers & ratings ---------- */

/** In-stock products ranked by their Amazon ratings count. */
export function bestsellers(limit = 8) {
  return [...inStock].sort((a, b) => ratingsFor(b) - ratingsFor(a) || (b.primary.rating ?? 0) - (a.primary.rating ?? 0)).slice(0, limit);
}

export function ratingTiles() {
  return inStock
    .filter((p) => p.primary.rating !== null && p.primary.reviewCount > 0)
    .sort((a, b) => b.primary.reviewCount - a.primary.reviewCount || (b.primary.rating ?? 0) - (a.primary.rating ?? 0))
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      image: p.primary.image,
      accentSoft: p.accentSoft,
      rating: p.primary.rating as number,
      count: p.primary.reviewCount,
      asin: p.primary.asin,
      reviewsHref: amazon.reviews(p.primary.asin),
    }));
}

/* ---------- Why PoundMart ---------- */

export function whyStats() {
  const { average, count } = ratingStats();
  return {
    products: inStock.length,
    flavours: toothpasteFlavours.length + haircareScents.length,
    ratings: count,
    average,
  };
}

/* ---------- Wash day ---------- */

export function washDayProducts() {
  return [
    "xhc-no-rinse-conditioner-3-pack",
    "xhc-argan-oil-shampoo-conditioner-set",
    "xhc-argan-oil-shampoo-3-pack",
    "xhc-rosemary-mint-shampoo-3-pack",
    "xhc-shampoo-conditioner-bars",
  ]
    .map(requireProduct)
    .filter(isInStock)
    .map((p) => {
      const from = fromPrice(p);
      return {
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        image: p.primary.image,
        accentSoft: p.accentSoft,
        fromLabel: from !== null ? formatPrice(from) : null,
        multiple: p.variants.filter((v) => v.inStock).length > 1,
      };
    });
}

/* ---------- FAQ ---------- */

export function homeFaqs(): FaqItem[] {
  const maths = bundleMathsData();
  const single = maths.steps[0];
  const biggest = maths.steps[maths.steps.length - 1];
  return [
    {
      q: "How do I buy a PoundMart bundle?",
      a: "Every PoundMart product is sold on Amazon. Tap any Shop on Amazon button on this site and you land on the product in our official Amazon store, where you check out with your own Amazon account as usual.",
    },
    {
      q: "Who sells and dispatches my order?",
      a: "Every order is sold by PoundMart and dispatched by Amazon. Every bundle is packaged and quality-checked by PoundMart, a UK-based business.",
    },
    {
      q: "What if I need to return something?",
      a: "Returns are handled by Amazon, with 30-day returns on your order. You manage them from your Amazon account, just like any other Amazon purchase.",
    },
    {
      q: "Are your products genuine?",
      a: `Yes. We only sell genuine branded products from ${brandFacts.brands.join(" and ")}. No knockoffs, no grey-market stock.`,
    },
    {
      q: "Is Nice Smile toothpaste vegan and cruelty-free?",
      a: "Yes. The Nice Smile listings describe every flavour as vegan, cruelty-free and enamel-safe, with fluoride and gentle whitening, in a 60g tube suitable for kids and adults.",
    },
    {
      q: "What exactly is a PoundMart bundle?",
      a: `A multi-pack of an everyday essential, packed so each item costs less. For example, a single Nice Smile tube is ${single.perUnitLabel}, while the ${biggest.label} works out at ${biggest.perUnitLabel} a tube (${priceNote.replace(/\.$/, "")}).`,
    },
  ];
}

export const storeLinks = {
  home: amazon.store(),
  shopAll: amazon.store("shopAll"),
  haircare: amazon.store("haircare"),
  toothpaste: amazon.store("toothpaste"),
};
