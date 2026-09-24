/**
 * Server-side helpers for the shop, collection and product pages: value maths,
 * listing-copy clean-up, JSON-LD builders and per-collection art direction.
 * Everything here is derived from lib/products.ts (the Amazon snapshot) and
 * lib/site.ts (verified brand facts). Do not import into client components.
 */
import {
  bestUnitPrice,
  fromPrice,
  getCollection,
  isInStock,
  pricePerUnit,
  products,
  type Collection,
  type Product,
  type Variant,
} from "@/lib/products";
import { amazon, site } from "@/lib/site";
import type { ShopItem } from "@/components/shop/filters";

/* ---------- Copy ---------- */

/** Listing copy uses em dashes and pipes; the house style uses neither. */
export function cleanCopy(text: string) {
  return text
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s*\|\s*/g, ". ")
    .replace(/^[\s,.;:|]+/, "")
    .replace(/\s{2,}/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();
}

function sentence(text: string) {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

/**
 * Listing bullets, cleaned, with the empty "applies to each unit" rows removed.
 * One older bullet says bundles are "shipped directly by PoundMart"; they are
 * dispatched by Amazon (brandFacts), so that phrase is corrected here.
 */
export function productFeatures(p: Product) {
  return p.features
    .filter((f) => f.title.trim().length > 0 && f.text.trim().length > 0)
    .map((f) => ({
      title: cleanCopy(f.title),
      text: sentence(
        cleanCopy(f.text).replace(/Packaged, quality-checked and shipped directly by PoundMart/i, "Packaged and quality-checked by PoundMart"),
      ),
    }));
}

/** "a, b and c" */
export function listJoin(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/* ---------- Ratings & value ---------- */

/** The option with the most Amazon ratings (options of one listing family share a review pool). */
export function ratingVariant(p: Product): Variant {
  return [...p.variants].filter((v) => v.rating !== null).sort((a, b) => b.reviewCount - a.reviewCount)[0] ?? p.primary;
}

export function popularity(p: Product) {
  return Math.max(...p.variants.map((v) => v.reviewCount));
}

/** Amazon ratings across the range, counting each product's review pool once. */
export function ratingsCount(list: Product[] = products) {
  return list.reduce((n, p) => n + popularity(p), 0);
}

/** Average Amazon rating weighted by number of ratings. */
export function weightedRating(list: Product[] = products) {
  let sum = 0;
  let count = 0;
  for (const p of list) {
    const v = ratingVariant(p);
    if (v.rating === null || v.reviewCount === 0) continue;
    sum += v.rating * v.reviewCount;
    count += v.reviewCount;
  }
  return count ? sum / count : null;
}

export function flavourCount(list: Product[] = products) {
  return new Set(list.flatMap((p) => p.flavours)).size;
}

export function toShopItem(p: Product): ShopItem {
  const rv = ratingVariant(p);
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    type: p.type,
    isBundle: p.isBundle,
    inStock: isInStock(p),
    popularity: popularity(p),
    rating: rv.rating,
    price: fromPrice(p),
    unitPrice: bestUnitPrice(p),
  };
}

/** Keeps order but moves unavailable products to the end so they are never featured. */
export function inStockFirst(list: Product[]) {
  return [...list.filter(isInStock), ...list.filter((p) => !isInStock(p))];
}

/** Every in-stock Nice Smile option, cheapest per tube first. */
export function niceSmileValueRows() {
  return products
    .filter((p) => p.brand === "Nice Smile")
    .flatMap((p) =>
      p.variants
        .filter((v) => v.inStock && v.price !== null)
        .map((v) => ({
          product: p,
          variant: v,
          perUnit: pricePerUnit(v) as number,
        })),
    )
    .sort((a, b) => a.perUnit - b.perUnit || b.variant.units - a.variant.units);
}

/** Short display name without the brand, e.g. "12 Pack Toothpaste Bundle". */
export function shortName(p: Product) {
  return p.name.replace(/^Nice Smile\s+/, "").replace(/^XHC\s+/, "");
}

/* ---------- Flavour colours ---------- */

const FLAVOUR_COLOURS: Record<string, string> = {
  "Watermelon Fresh": "#FF5468",
  "Feelin' Grape": "#7B3FB8",
  "Peachy Clean": "#FF9B54",
  "Berry Burst": "#3D6FE8",
  "Yummy Gummy": "#E6508F",
  "Candy Clean": "#FF7EB6",
  "Cherry & Almond": "#F2765F",
  "Dragon Fruit & Vanilla": "#E562B0",
  "Mango & Coconut": "#FDB42C",
  "Moroccan Argan Oil": "#9A6A3A",
  "Rosemary & Mint": "#2FB59B",
  Coconut: "#5BB8D6",
  Banana: "#F2C94C",
  Papaya: "#FF8A3D",
};

export function flavourColour(name: string) {
  return FLAVOUR_COLOURS[name] ?? "#FCD000";
}

/* ---------- URLs & JSON-LD ---------- */

export function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${site.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

export type Crumb = { name: string; href: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href),
    })),
  };
}

export function itemListJsonLd(list: Product[], name: string) {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: list.length,
    itemListElement: list.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/shop/${p.slug}`),
      name: p.name,
    })),
  };
}

export function brandName(p: Product) {
  return p.brand === "XHC" ? "XHC Xpert Haircare" : "Nice Smile";
}

/** Product schema. Deliberately no aggregateRating or Review: the ratings belong to Amazon. */
export function productJsonLd(p: Product) {
  const offers = p.variants
    .filter((v) => v.price !== null)
    .map((v) => ({
      "@type": "Offer",
      sku: v.asin,
      name: v.label,
      price: (v.price as number).toFixed(2),
      priceCurrency: "GBP",
      availability: v.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: amazon.product(v.asin),
      seller: { "@type": "Organization", name: site.name, url: site.url },
    }));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url: absoluteUrl(`/shop/${p.slug}`),
    image: p.images.slice(0, 8).map(absoluteUrl),
    description: p.summary,
    sku: p.primary.asin,
    brand: { "@type": "Brand", name: brandName(p) },
    category: p.category === "toothpaste" ? "Toothpaste" : "Haircare",
    keywords: p.keywords.join(", "),
    ...(offers.length ? { offers: offers.length === 1 ? offers[0] : offers } : {}),
  };
}

/* ---------- Collections: art direction ---------- */

export type StageImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Packshot on white: knocked out with product-cutout on a light disc. */
  cutout: boolean;
};

export type CollectionArt = {
  soft: string;
  /** Words for the ticker under the hero. */
  ticker: string[];
  /** Floating labels on the hero composition (facts from the listings only). */
  stickers: string[];
  hero: StageImage;
  supporting: StageImage[];
  gridEyebrow: string;
  gridTitle: string;
  gridIntro: string;
  /** Blog category to pull guides from; "latest" means newest posts overall. */
  blogCategory: "oral-care" | "haircare" | "smart-saving" | "latest";
  blogTitle: string;
  ctaTitle: string;
  ctaBody: string;
  /** Lifestyle images for the parallax mosaic. */
  mosaic: { src: string; alt: string }[];
  moodTitle: string;
  moodBody: string;
  ctaImage?: { src: string; alt: string; width: number; height: number; position?: string };
};

const img = (src: string, alt: string, width: number, height: number, cutout = true): StageImage => ({ src, alt, width, height, cutout });

export const collectionArt: Record<string, CollectionArt> = {
  toothpaste: {
    soft: "#FFE3E6",
    ticker: ["Watermelon Fresh", "Feelin' Grape", "Peachy Clean", "Berry Burst", "Yummy Gummy", "Candy Clean"],
    stickers: ["Vegan & cruelty-free", "Enamel-safe", "With fluoride"],
    hero: img("/products/B0G318R9JG/g1.jpg", "Six Nice Smile toothpaste tubes in six flavours", 1000, 743),
    supporting: [
      img("/products/B0FLWZ7D6T/g2.jpg", "Feelin' Grape, Peachy Clean and Watermelon Fresh tubes on a white podium", 1000, 1000, false),
      img("/products/B0FNYGR43T/g2.jpg", "You're one in a melon: Watermelon Fresh toothpaste with watermelon slices", 844, 847, false),
      img("/products/B0FPDJXQRG/g2.jpg", "Hello sweet tooth: Candy Clean toothpaste with cotton candy", 1000, 999, false),
    ],
    gridEyebrow: "The Nice Smile range",
    gridTitle: "Pick a *flavour*, or pick them all.",
    gridIntro: "Single tubes for trying, three and six packs for mixing, and the 12 pack for the best price per tube.",
    blogCategory: "oral-care",
    blogTitle: "Brush up on *oral care*.",
    ctaTitle: "Your bathroom shelf is about to get *fruity*.",
    ctaBody: "Every Nice Smile bundle is sold by PoundMart and dispatched by Amazon, with 30-day returns through Amazon.",
    mosaic: [
      { src: "/products/B0G318R9JG/g5.jpg", alt: "Nice Smile Yummy Gummy, Berry Burst and Candy Clean tubes at a party with balloons and gifts" },
      { src: "/products/B0FLFZ2Z6C/g2.jpg", alt: "Three Nice Smile tubes on a bathroom sink: elevate your morning routine" },
      { src: "/products/B0FLFZ2Z6C/g6.jpg", alt: "Nice Smile Yummy Gummy and Berry Burst with gummy bears and blueberries" },
      { src: "/products/B0FLFZ2Z6C/g8.jpg", alt: "The complete Nice Smile bundle packed by PoundMart" },
    ],
    moodTitle: "Brushing, but make it *fun*.",
    moodBody: "Sweet, fruity flavours that encourage healthy brushing habits for the whole family, in tubes small enough for a wash bag.",
  },
  haircare: {
    soft: "#F3E8DB",
    ticker: ["No Rinse Conditioner", "Moroccan Argan Oil", "Rosemary & Mint", "2-in-1 Shampoo Bars", "Vegan friendly", "Paraben-free argan"],
    stickers: ["Vegan friendly", "Sulphate-free no rinse", "Plastic-free bars"],
    hero: img("/products/B0GBMH1N54/g1.jpg", "XHC Argan Oil shampoo and conditioner bottles", 753, 1000),
    supporting: [
      img("/products/B0GBMH1N54/a8.png", "Woman with long glossy curls beside an XHC Argan Oil conditioner", 900, 900, false),
      img("/brand/conditioner-3pack-table.jpg", "Three XHC No Rinse Conditioner tubes on a wooden shelf", 1024, 1024, false),
      img("/products/B0GKYHKMRG/g3.jpg", "XHC Coconut, Banana and Papaya shampoo bars with tropical fruit", 1000, 1000, false),
    ],
    gridEyebrow: "XHC Xpert Haircare",
    gridTitle: "Wash day, *sorted*.",
    gridIntro: "Leave-in conditioners for curls, argan oil for dry lengths, rosemary for a fresh reset and bars for the gym bag.",
    blogCategory: "haircare",
    blogTitle: "Hair guides, *minus* the jargon.",
    ctaTitle: "Good hair days, *bundled*.",
    ctaBody: "Every XHC bundle is sold by PoundMart and dispatched by Amazon, with 30-day returns through Amazon.",
    mosaic: [
      { src: "/products/B0GBMH1N54/g3.jpg", alt: "XHC Argan Oil conditioner on a bath caddy: your essential daily spa" },
      { src: "/products/B0GBMH1N54/g7.jpg", alt: "Woman with long glossy curls beside XHC Argan Oil conditioner" },
      { src: "/products/B0GKYHKMRG/g2.jpg", alt: "XHC shampoo and conditioner bars on a bathroom shelf: wash and condition in one" },
      { src: "/products/B0GMXQNCYN/g2.jpg", alt: "XHC Rosemary & Mint shampoo with fresh rosemary and mint leaves" },
    ],
    moodTitle: "Salon vibes, *bundle* prices.",
    moodBody: "Argan oil, rosemary and mint, no-rinse curl care and tropical 2-in-1 bars, all vegan friendly and all bundled for less.",
    ctaImage: {
      src: "/products/B0GBMH1N54/g7.jpg",
      alt: "Woman with long glossy curls beside XHC Argan Oil conditioner",
      width: 1000,
      height: 1000,
      position: "30% 40%",
    },
  },
  bundles: {
    soft: "#FFF3B8",
    ticker: ["More in the box", "Less per tube", "Stock up once", "Sold by PoundMart", "Dispatched by Amazon", "30-day returns"],
    stickers: ["12 tubes in one box", "Dispatched by Amazon", "Genuine brands"],
    hero: img("/products/B0HBXLVW4S/g1.jpg", "Twelve Nice Smile toothpaste tubes in three flavours", 666, 1000),
    supporting: [
      img("/products/B0G3BS11B8/g1.jpg", "Three XHC No Rinse Conditioner tubes", 1000, 918),
      img("/products/B0GNS29WY9/g1.jpg", "Three XHC Argan Oil shampoo bottles", 1000, 950),
      img("/products/B0H9YX3DG3/g1.jpg", "Six XHC shampoo and conditioner bars", 1000, 711),
    ],
    gridEyebrow: "Every multi-pack",
    gridTitle: "Bigger boxes, *smaller* unit prices.",
    gridIntro: "Toothpaste, shampoo, conditioner and bars, bundled so each tube, bottle or bar costs less.",
    blogCategory: "smart-saving",
    blogTitle: "Spend *smarter* on the everyday.",
    ctaTitle: "Stock up once. *Relax* for months.",
    ctaBody: "Browse every PoundMart bundle on Amazon. Sold by PoundMart, dispatched by Amazon, with 30-day returns.",
    mosaic: [
      { src: "/products/B0G318R9JG/g6.jpg", alt: "Nice Smile Watermelon Fresh, Peachy Clean and Feelin' Grape tubes on a teal podium" },
      { src: "/products/B0G3BS11B8/g6.jpg", alt: "Three XHC No Rinse Conditioner tubes lined up on a wooden shelf" },
      { src: "/products/B0GNS29WY9/g3.jpg", alt: "XHC Argan Oil: the ultimate 3-pack bundle" },
      { src: "/products/B0H9YX3DG3/g4.jpg", alt: "XHC Coconut, Banana and Papaya bars: three tropical scents" },
    ],
    moodTitle: "Stock up once, *stop* running out.",
    moodBody: "Multi-packs mean fewer last-minute shop runs and a lower price on every tube, bottle and bar in the box.",
  },
  "new-arrivals": {
    soft: "#DDF5EF",
    ticker: ["Just landed", "Nice Smile 12 Pack", "Rosemary & Mint", "Argan Oil 3 Pack", "Tropical shampoo bars"],
    stickers: ["Just landed", "Plastic-free bars", "Vegan friendly"],
    hero: img("/products/B0H9YX3DG3/g1.jpg", "Six XHC 2-in-1 shampoo and conditioner bars in Papaya, Banana and Coconut", 1000, 711),
    supporting: [
      img("/products/B0GMXQNCYN/g1.jpg", "Three XHC Rosemary & Mint shampoo bottles", 1000, 976),
      img("/products/B0HBXLVW4S/g1.jpg", "Twelve Nice Smile toothpaste tubes", 666, 1000),
      img("/products/B0GKYHKMRG/g4.jpg", "XHC shampoo bars packed for travel beside a vanity", 1000, 936, false),
    ],
    gridEyebrow: "Fresh stock",
    gridTitle: "The *newest* bundles in the bin.",
    gridIntro: "Our latest multi-packs, from a twelve tube toothpaste box to plastic-free haircare bars.",
    blogCategory: "latest",
    blogTitle: "Fresh off the *blog*.",
    ctaTitle: "Be first to the *new* stuff.",
    ctaBody: "See every new PoundMart bundle on Amazon. Sold by PoundMart and dispatched by Amazon.",
    mosaic: [
      {
        src: "/products/B0HBXLVW4S/g2.jpg",
        alt: "Nice Smile Watermelon Fresh key benefits: whitening and fluoride protection, vegan and enamel-safe",
      },
      { src: "/products/B0GMXQNCYN/g4.jpg", alt: "XHC Rosemary & Mint shampoo features" },
      { src: "/products/B0GNS29WY9/g6.jpg", alt: "Woman with long glossy curls beside XHC Argan Oil shampoo" },
      { src: "/products/B0H9YX3DG3/g5.jpg", alt: "XHC shampoo bars: travel and hand luggage friendly" },
    ],
    moodTitle: "Fresh drops, *same* great value.",
    moodBody: "From a twelve tube toothpaste box to plastic-free shampoo bars, here's what just joined the PoundMart range.",
    ctaImage: { src: "/products/B0GKYHKMRG/g4.jpg", alt: "XHC shampoo bars packed for travel beside a vanity", width: 1000, height: 936 },
  },
};

export function getCollectionArt(c: Collection) {
  return collectionArt[c.slug];
}

export function collectionForProduct(p: Product) {
  return getCollection(p.category) as Collection;
}

/* ---------- Bundles: per-unit savings ---------- */

export type SavingsRow = {
  title: string;
  unitNoun: string;
  small: { label: string; perUnit: number; slug: string; asin: string; units: number; price: number };
  big: { label: string; perUnit: number; slug: string; asin: string; units: number; price: number; image: string; name: string };
  saving: number;
  percent: number;
};

function option(p: Product, v: Variant) {
  return { slug: p.slug, asin: v.asin, units: v.units, price: v.price as number, perUnit: pricePerUnit(v) as number };
}

function buyable(v: Variant | undefined): v is Variant {
  return !!v && v.inStock && v.price !== null;
}

/** Bundle vs smaller option comparisons, computed from the listing prices. */
export function savingsRows(): SavingsRow[] {
  const rows: SavingsRow[] = [];
  const find = (slug: string) => products.find((p) => p.slug === slug);

  // 1. Cheapest single Nice Smile tube vs the best-value toothpaste bundle
  const singles = products
    .filter((p) => p.category === "toothpaste")
    .flatMap((p) => p.variants.filter((v) => buyable(v) && v.units === 1).map((v) => ({ p, v })))
    .sort((a, b) => (a.v.price as number) - (b.v.price as number));
  const bundles = products
    .filter((p) => p.category === "toothpaste")
    .flatMap((p) => p.variants.filter((v) => buyable(v) && v.units > 1).map((v) => ({ p, v })))
    .sort((a, b) => (pricePerUnit(a.v) as number) - (pricePerUnit(b.v) as number));
  if (singles[0] && bundles[0]) {
    rows.push(make("Nice Smile toothpaste", "tube", singles[0].p, singles[0].v, "Single tube", bundles[0].p, bundles[0].v, bundles[0].v.label));
  }

  // 2. Same flavour, bigger pack (Candy Clean single vs pack of 4)
  const candy = find("nice-smile-candy-clean-toothpaste");
  if (candy && candy.variants.length > 1) {
    const s = candy.variants.find((v) => v.units === 1);
    const b = [...candy.variants].sort((a, z) => z.units - a.units)[0];
    if (buyable(s) && buyable(b) && b.units > 1) rows.push(make("Candy Clean, same flavour", "tube", candy, s, "Single tube", candy, b, b.label));
  }

  // 3. XHC No Rinse single vs 3 pack
  const nrSingle = find("xhc-no-rinse-conditioner");
  const nrTrio = find("xhc-no-rinse-conditioner-3-pack");
  if (nrSingle && nrTrio) {
    const s = [...nrSingle.variants].filter(buyable).sort((a, b) => (a.price as number) - (b.price as number))[0];
    if (buyable(s) && buyable(nrTrio.primary))
      rows.push(make("XHC No Rinse Conditioner", "tube", nrSingle, s, "Single tube", nrTrio, nrTrio.primary, "3 pack"));
  }

  // 4. XHC bars 3 pack vs 6 pack
  const bars = find("xhc-shampoo-conditioner-bars");
  if (bars && bars.variants.length > 1) {
    const [s, b] = [...bars.variants].sort((a, z) => a.units - z.units);
    if (buyable(s) && buyable(b)) rows.push(make("XHC 2-in-1 bars", "bar", bars, s, "3 pack", bars, b, "6 pack"));
  }

  // 5. XHC argan shampoo twin pack vs 3 pack
  const twin = find("xhc-argan-oil-shampoo-twin-pack");
  const trio = find("xhc-argan-oil-shampoo-3-pack");
  if (twin && trio && buyable(twin.primary) && buyable(trio.primary)) {
    rows.push(make("XHC Argan Oil shampoo", "bottle", twin, twin.primary, "Twin pack", trio, trio.primary, "3 pack"));
  }

  return rows.filter((r) => r.big.perUnit < r.small.perUnit);
}

function make(title: string, unitNoun: string, sp: Product, sv: Variant, sLabel: string, bp: Product, bv: Variant, bLabel: string): SavingsRow {
  const small = { ...option(sp, sv), label: sLabel };
  const big = { ...option(bp, bv), label: bLabel, image: bv.image, name: bp.name };
  const saving = small.perUnit - big.perUnit;
  return { title, unitNoun, small, big, saving, percent: Math.round((saving / small.perUnit) * 100) };
}

/* ---------- Haircare: the finder ---------- */

export type FinderPick = {
  id: string;
  need: string;
  detail: string;
  icon: "curls" | "moisture" | "soft" | "fresh" | "travel" | "home";
  product: {
    slug: string;
    name: string;
    image: string;
    accent: string;
    accentSoft: string;
    rating: number | null;
    reviewCount: number;
    price: number | null;
    perUnit: number | null;
    unitNoun: string;
    units: number;
    asin: string;
    amazonHref: string;
    inStock: boolean;
  };
  why: { title: string; text: string };
  alsoTry: { slug: string; name: string } | null;
};

const FINDER: { id: string; need: string; detail: string; icon: FinderPick["icon"]; slug: string; feature: RegExp; alsoTry: string }[] = [
  {
    id: "curls",
    need: "Defined, frizz-free curls",
    detail: "Curly, afro or coily hair",
    icon: "curls",
    slug: "xhc-no-rinse-conditioner-3-pack",
    feature: /hydrates, repairs/i,
    alsoTry: "xhc-no-rinse-conditioner",
  },
  {
    id: "moisture",
    need: "Moisture for dry lengths",
    detail: "Dry or damaged hair",
    icon: "moisture",
    slug: "xhc-argan-oil-shampoo-conditioner-set",
    feature: /nourishes/i,
    alsoTry: "xhc-argan-oil-shampoo-3-pack",
  },
  {
    id: "soft",
    need: "Softer, easier detangling",
    detail: "Knots, tangles and frizz",
    icon: "soft",
    slug: "xhc-argan-oil-conditioner-twin-pack",
    feature: /manageability/i,
    alsoTry: "xhc-argan-oil-shampoo-conditioner-set",
  },
  {
    id: "fresh",
    need: "A fresh, revitalised feel",
    detail: "Hair that feels dull or heavy",
    icon: "fresh",
    slug: "xhc-rosemary-mint-shampoo-3-pack",
    feature: /revitalising/i,
    alsoTry: "xhc-argan-oil-shampoo-twin-pack",
  },
  {
    id: "travel",
    need: "Travel light, waste less",
    detail: "Gym bags and carry-ons",
    icon: "travel",
    slug: "xhc-shampoo-conditioner-bars",
    feature: /travel/i,
    alsoTry: "xhc-no-rinse-conditioner",
  },
  {
    id: "home",
    need: "Stock up for the household",
    detail: "Everyday washing for everyone",
    icon: "home",
    slug: "xhc-argan-oil-shampoo-twin-pack",
    feature: /daily cleansing|cleanses/i,
    alsoTry: "xhc-argan-oil-shampoo-3-pack",
  },
];

export function hairFinderPicks(): FinderPick[] {
  return FINDER.flatMap((f) => {
    const p = products.find((x) => x.slug === f.slug);
    if (!p || !isInStock(p)) return [];
    // For the household pick, point at the biggest in-stock option
    const v = f.id === "home" ? [...p.variants].filter((x) => x.inStock).sort((a, b) => b.units - a.units)[0] : p.primary;
    const feats = productFeatures(p);
    const why = feats.find((x) => f.feature.test(x.title)) ?? feats[0] ?? { title: p.tagline, text: p.summary };
    const also = products.find((x) => x.slug === f.alsoTry && isInStock(x));
    return [
      {
        id: f.id,
        need: f.need,
        detail: f.detail,
        icon: f.icon,
        product: {
          slug: p.slug,
          name: p.name,
          image: v.image,
          accent: p.accent,
          accentSoft: p.accentSoft,
          rating: v.rating,
          reviewCount: v.reviewCount,
          price: v.price,
          perUnit: pricePerUnit(v),
          unitNoun: p.unitNoun,
          units: v.units,
          asin: v.asin,
          amazonHref: amazon.product(v.asin),
          inStock: v.inStock,
        },
        why,
        alsoTry: also ? { slug: also.slug, name: also.name } : null,
      },
    ];
  });
}

/* ---------- Toothpaste: the flavour guide ---------- */

export type FlavourTile = {
  name: string;
  pun: string;
  line: string;
  colour: string;
  soft: string;
  image: { src: string; alt: string };
  foundIn: { slug: string; name: string }[];
};

const FLAVOURS: Omit<FlavourTile, "foundIn" | "colour">[] = [
  {
    name: "Watermelon Fresh",
    pun: "You're one in a melon.",
    line: "A fruity burst of sweetness that leaves your mouth clean and refreshed, without harsh mint.",
    soft: "#FFE3E6",
    image: { src: "/products/B0FNYGR43T/g2.jpg", alt: "You're one in a melon: Nice Smile Watermelon Fresh toothpaste with watermelon slices" },
  },
  {
    name: "Feelin' Grape",
    pun: "Brush with grape-ness.",
    line: "Fruity, fun grape toothpaste for kids and adults alike.",
    soft: "#EDE2F8",
    image: { src: "/products/B0FNYH9TFC/g2.jpg", alt: "Brush with grape-ness: Nice Smile Feelin' Grape toothpaste with grapes" },
  },
  {
    name: "Peachy Clean",
    pun: "Peach, please.",
    line: "The juicy third of our fruity trio, alongside Watermelon Fresh and Feelin' Grape.",
    soft: "#FFEBDC",
    image: { src: "/products/B0FLWZ7D6T/g5.jpg", alt: "Peach please: Nice Smile Peachy Clean toothpaste with fresh peaches" },
  },
  {
    name: "Berry Burst",
    pun: "Berry nice to meet you.",
    line: "Part of the sweet-tooth trio with Yummy Gummy and Candy Clean, our most reviewed bundle.",
    soft: "#E1E9FC",
    image: { src: "/products/B0FLFZ2Z6C/g3.jpg", alt: "Nice Smile Berry Burst toothpaste with blueberries and raspberries" },
  },
  {
    name: "Yummy Gummy",
    pun: "Un-bear-ably fresh.",
    line: "A sweet, candy-inspired flavour that makes brushing fun for kids and grown-ups.",
    soft: "#FCE1EC",
    image: { src: "/products/B0FPDJHWN8/g2.jpg", alt: "Un-bear-ably fresh: Nice Smile Yummy Gummy toothpaste with gummy bears" },
  },
  {
    name: "Candy Clean",
    pun: "Hello, sweet tooth.",
    line: "Cotton candy flavour, a firm favourite with mint haters and bedtime routines.",
    soft: "#FFE4F0",
    image: { src: "/products/B0FPDJXQRG/g2.jpg", alt: "Hello sweet tooth: Nice Smile Candy Clean toothpaste with cotton candy" },
  },
];

export function flavourTiles(): FlavourTile[] {
  return FLAVOURS.map((f) => ({
    ...f,
    colour: flavourColour(f.name),
    foundIn: products
      .filter((p) => p.category === "toothpaste" && isInStock(p) && p.flavours.includes(f.name))
      .sort((a, b) => a.primary.units - b.primary.units)
      .map((p) => ({ slug: p.slug, name: shortName(p) })),
  }));
}

/* ---------- New arrivals: the timeline ---------- */

/** Newest first. ASINs are issued in sequence, so the highest ASIN is the most recent listing. */
export function arrivals(list: Product[]) {
  const newest = (p: Product) =>
    p.variants
      .map((v) => v.asin)
      .sort()
      .at(-1) ?? p.primary.asin;
  return [...list].filter(isInStock).sort((a, b) => newest(b).localeCompare(newest(a)));
}

/* ---------- Product FAQ (listing data + brand facts only) ---------- */

export function productFaq(p: Product, facts: { soldBy: string; dispatchedBy: string; returns: string; packing: string; authenticity: string }) {
  const feats = productFeatures(p);
  const find = (re: RegExp) => feats.find((f) => re.test(`${f.title} ${f.text}`));
  const faq: { q: string; a: string }[] = [];

  const summaryListsOptions = /\b(choose|available as)\b/i.test(p.summary);
  const options = p.variants.length > 1 && !summaryListsOptions ? ` On Amazon you can choose: ${listJoin(p.variants.map((v) => v.label))}.` : "";
  faq.push({ q: "What's in the pack?", a: `${p.summary}${options}` });

  if (p.category === "toothpaste") {
    const fluoride = find(/fluoride/i);
    if (fluoride) faq.push({ q: "Does Nice Smile toothpaste contain fluoride?", a: `Yes. ${fluoride.title}: ${fluoride.text}` });
    faq.push({
      q: "Is it suitable for children?",
      a: "Nice Smile is made for kids and adults, and the sweet, fruity flavours are there to make brushing fun. Use a pea-sized amount and check the pack for age guidance before your little ones use it.",
    });
  }

  const vegan = find(/vegan/i);
  if (vegan)
    faq.push({
      q: "Is it vegan and cruelty-free?",
      a: `${/cruelty/i.test(vegan.title + vegan.text) ? "Yes." : "It's labelled vegan friendly."} ${vegan.title}: ${vegan.text}`,
    });

  if (p.type === "Leave-in conditioner") {
    const story = p.story.join(" ");
    const how = story.match(/Simply apply[^.]*\./i)?.[0];
    faq.push({
      q: "Do I need to rinse it out?",
      a: `No, it's a leave-in, rinse-free conditioner.${how ? ` ${cleanCopy(how)}` : ""}`,
    });
  }

  if (p.category === "haircare") {
    const textured = find(/curly|afro|coily/i);
    const ideal = feats.find((f) => /ideal for|for dry|damaged/i.test(f.title));
    const allTypes = find(/all hair types/i);
    const dryNote = /dry or damaged/i.test(p.summary) ? " It's made with dry or damaged hair in mind." : "";
    const answer = textured
      ? `${textured.title}: ${textured.text}`
      : ideal
        ? `${ideal.title}: ${ideal.text}`
        : allTypes
          ? `The Amazon listing describes it as suitable for all hair types.${dryNote}`
          : null;
    if (answer) faq.push({ q: "Which hair types is it for?", a: answer });
  }

  if (p.type === "Haircare bars") {
    const travel = find(/travel/i);
    const plastic = find(/plastic/i);
    if (travel || plastic)
      faq.push({
        q: "Are the bars good for travel?",
        a: [travel && `${travel.title}: ${travel.text}`, plastic && `${plastic.title}: ${plastic.text}`].filter(Boolean).join(" "),
      });
  }

  const priced = p.variants.filter((v) => v.inStock && v.price !== null);
  if (priced.length) {
    const parts = priced.map((v) => {
      const unit = pricePerUnit(v) as number;
      return `${v.label}: ${fmt(v.price as number)}${v.units > 1 ? ` (${fmt(unit)} a ${p.unitNoun})` : ""}`;
    });
    faq.push({
      q: `How much is it per ${p.unitNoun}?`,
      a: `When we checked Amazon on ${checkedDate()}: ${parts.join("; ")}. Amazon always shows the live price at checkout.`,
    });
  }

  faq.push({
    q: "Who sells and delivers it?",
    a: `${facts.soldBy} and ${lowerFirst(facts.dispatchedBy)}, so you order, track and manage it in your Amazon account like any other Amazon order.`,
  });
  faq.push({ q: "Can I return it?", a: `Yes. You get ${lowerFirst(facts.returns)}.` });
  faq.push({ q: "Is it genuine?", a: `${facts.authenticity} Every bundle is ${lowerFirst(facts.packing)} in the UK.` });

  return faq;
}

export function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
function fmt(n: number) {
  return gbp.format(n);
}

function checkedDate() {
  return new Date(`${site.catalogCheckedAt}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
