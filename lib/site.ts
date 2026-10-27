/**
 * Site-wide configuration. Everything a marketer might want to change
 * (URLs, Amazon tracking, nav, verified brand facts) lives here.
 */

import { productAttribution, storeAttribution } from "./attribution";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const site = {
  name: "PoundMart",
  tagline: "Home of Great Value Bundles",
  description:
    "Great value bundles of everyday essentials: flavoured Nice Smile toothpaste, XHC haircare, Mucky Pup dog shampoo and more multi-packs, sold on Amazon and dispatched by Amazon.",
  url: siteUrl.replace(/\/$/, ""),
  locale: "en_GB",
  /** Date the prices, ratings and stock on this site were last checked against Amazon. */
  catalogCheckedAt: "2026-10-27",
  logo: "/brand/logo-square.png",
  ogImage: "/brand/family-bundle-poster.png",
} as const;

/**
 * Amazon destinations. Store page ids come from the live PoundMart brand store.
 * Every outbound Amazon link carries its own Amazon Attribution tag from
 * lib/attribution.ts, which unlocks the Brand Referral Bonus on the sales this
 * site sends to Amazon. A destination without a tag there falls back to the
 * NEXT_PUBLIC_AMAZON_ATTRIBUTION / NEXT_PUBLIC_AMAZON_TAG env vars.
 */
const AMAZON = "https://www.amazon.co.uk";

export const amazonStore = {
  home: `${AMAZON}/stores/PoundMart/page/51710033-B61C-4A51-A8C0-6DDF028E0841`,
  toothpaste: `${AMAZON}/stores/PoundMart/page/BF65066C-7725-45D6-AD39-5E48305AD538`,
  haircare: `${AMAZON}/stores/PoundMart/page/20A5F21E-769E-4BE6-B9CA-6E6E3E75F3A6`,
  newArrivals: `${AMAZON}/stores/PoundMart/page/065E90BC-4871-4A39-A1A1-59BD7D5A47EC`,
  shopAll: `${AMAZON}/stores/PoundMart/page/F2F6538A-824B-4B85-9361-8CA4D47252DC`,
} as const;

type StorePage = keyof typeof amazonStore;

/** Fallback query string for links with no tag of their own, e.g. "maas=maas_adg_XXXX&ref_=aa_maas&tag=maas". */
const attribution = process.env.NEXT_PUBLIC_AMAZON_ATTRIBUTION ?? "";
/** Amazon Associates tag, e.g. "poundmart-21". */
const associateTag = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";

function fallbackQuery() {
  const params = new URLSearchParams(attribution);
  // An Attribution tag carries its own tag=maas, which an Associates tag would overwrite.
  if (associateTag && !params.has("maas")) params.set("tag", associateTag);
  return params.toString();
}

/** Appends the destination's own Attribution tag, exactly as Amazon issued it, or the fallback. */
function withTracking(url: string, ownTag?: string) {
  const qs = ownTag || fallbackQuery();
  if (!qs) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${qs}`;
}

function storeUrl(page: StorePage = "home") {
  return withTracking(amazonStore[page], storeAttribution[page]);
}

function productUrl(asin: string) {
  return withTracking(`${AMAZON}/dp/${asin}`, productAttribution[asin]);
}

const storeByPageId = Object.fromEntries(
  Object.entries(amazonStore).map(([page, url]) => [url.slice(url.lastIndexOf("/") + 1), page as StorePage]),
) as Record<string, StorePage>;

/** Tags a hand-written Amazon URL (e.g. a link inside a blog post) with the matching product or store page tag. */
function trackUrl(href: string) {
  const asin = href.match(/\/(?:dp|gp\/product)\/(B0[A-Z0-9]{8})/i)?.[1];
  if (asin) return productUrl(asin.toUpperCase());
  const pageId = href.match(/\/stores\/[^/?#]+\/page\/([0-9A-F-]{36})/i)?.[1]?.toUpperCase();
  if (pageId && storeByPageId[pageId]) return storeUrl(storeByPageId[pageId]);
  return withTracking(href);
}

export const amazon = {
  store: storeUrl,
  product: productUrl,
  /**
   * Attribution tags are made for product and store page URLs, so review links open the
   * tagged product page at its customer reviews section.
   */
  reviews: (asin: string) => `${productUrl(asin)}#customerReviews`,
  track: trackUrl,
};

/** Facts verified on the live Amazon listings. Copy may state these and nothing stronger. */
export const brandFacts = {
  soldBy: "Sold by PoundMart",
  dispatchedBy: "Dispatched by Amazon",
  returns: "30-day returns through Amazon",
  base: "UK-based",
  packing: "Packaged and quality-checked by PoundMart",
  authenticity: "Genuine branded products. No knockoffs, no grey-market stock.",
  brands: ["Nice Smile", "XHC Xpert Haircare", "XBC", "Mucky Pup", "Medex", "Clear & Simple", "CloudKicks"],
} as const;

export type NavItem = { label: string; href: string; description?: string };

export const mainNav: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Toothpaste", href: "/collections/toothpaste" },
  { label: "Haircare", href: "/collections/haircare" },
  { label: "Essentials", href: "/collections/essentials" },
  { label: "Bundles", href: "/collections/bundles" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export const footerNav: { title: string; links: NavItem[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Value bundles", href: "/collections/bundles" },
      { label: "Toothpaste", href: "/collections/toothpaste" },
      { label: "Haircare", href: "/collections/haircare" },
      { label: "Everyday essentials", href: "/collections/essentials" },
      { label: "New arrivals", href: "/collections/new-arrivals" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "The blog", href: "/blog" },
      { label: "Oral care guides", href: "/blog/category/oral-care" },
      { label: "Haircare guides", href: "/blog/category/haircare" },
      { label: "Smart saving", href: "/blog/category/smart-saving" },
    ],
  },
  {
    title: "PoundMart",
    links: [
      { label: "About us", href: "/about" },
      { label: "FAQs", href: "/faq" },
      { label: "Newsletter", href: "/newsletter" },
      { label: "Our Amazon store", href: amazon.store() },
    ],
  },
];
