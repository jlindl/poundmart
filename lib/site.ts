/**
 * Site-wide configuration. Everything a marketer might want to change
 * (URLs, Amazon tracking, nav, verified brand facts) lives here.
 */

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const site = {
  name: "PoundMart",
  tagline: "Home of Great Value Bundles",
  description:
    "Great value bundles of everyday essentials: flavoured Nice Smile toothpaste and XHC haircare multi-packs, sold on Amazon and dispatched by Amazon.",
  url: siteUrl.replace(/\/$/, ""),
  locale: "en_GB",
  /** Date the prices, ratings and stock on this site were last checked against Amazon. */
  catalogCheckedAt: "2026-09-24",
  logo: "/brand/logo-square.png",
  ogImage: "/brand/family-bundle-poster.png",
} as const;

/**
 * Amazon destinations. Store page ids come from the live PoundMart brand store.
 * Add an Amazon Attribution tag (recommended: it unlocks the Brand Referral Bonus
 * on external traffic) or an Associates tag via env vars; they are appended to
 * every outbound Amazon link.
 */
const AMAZON = "https://www.amazon.co.uk";

export const amazonStore = {
  home: `${AMAZON}/stores/PoundMart/page/51710033-B61C-4A51-A8C0-6DDF028E0841`,
  toothpaste: `${AMAZON}/stores/PoundMart/page/BF65066C-7725-45D6-AD39-5E48305AD538`,
  haircare: `${AMAZON}/stores/PoundMart/page/20A5F21E-769E-4BE6-B9CA-6E6E3E75F3A6`,
  newArrivals: `${AMAZON}/stores/PoundMart/page/065E90BC-4871-4A39-A1A1-59BD7D5A47EC`,
  shopAll: `${AMAZON}/stores/PoundMart/page/F2F6538A-824B-4B85-9361-8CA4D47252DC`,
} as const;

/** Raw query string appended to Amazon links, e.g. "maas=maas_adg_XXXX&ref_=aa_maas". */
const attribution = process.env.NEXT_PUBLIC_AMAZON_ATTRIBUTION ?? "";
/** Amazon Associates tag, e.g. "poundmart-21". */
const associateTag = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";

function withTracking(url: string) {
  const params = new URLSearchParams(attribution);
  if (associateTag) params.set("tag", associateTag);
  const qs = params.toString();
  if (!qs) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${qs}`;
}

export const amazon = {
  store: (page: keyof typeof amazonStore = "home") => withTracking(amazonStore[page]),
  product: (asin: string) => withTracking(`${AMAZON}/dp/${asin}`),
  reviews: (asin: string) => withTracking(`${AMAZON}/product-reviews/${asin}`),
};

/** Facts verified on the live Amazon listings. Copy may state these and nothing stronger. */
export const brandFacts = {
  soldBy: "Sold by PoundMart",
  dispatchedBy: "Dispatched by Amazon",
  returns: "30-day returns through Amazon",
  base: "UK-based",
  packing: "Packaged and quality-checked by PoundMart",
  authenticity: "Genuine branded products. No knockoffs, no grey-market stock.",
  brands: ["Nice Smile", "XHC Xpert Haircare"],
} as const;

export type NavItem = { label: string; href: string; description?: string };

export const mainNav: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Toothpaste", href: "/collections/toothpaste" },
  { label: "Haircare", href: "/collections/haircare" },
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
      { label: "Our Amazon store", href: amazonStore.home },
    ],
  },
];
