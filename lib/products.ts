/**
 * Product catalogue. Raw listing data (prices, ratings, bullets, images) is a
 * snapshot of the live Amazon listings in data/amazon-catalog.json; this file
 * adds the curated layer: grouping variants, naming, value maths and styling.
 *
 * To refresh prices/ratings, re-scrape into data/amazon-catalog.json.
 * To add a product, add its ASIN(s) to the snapshot and a `define()` entry below.
 */
import catalog from "@/data/amazon-catalog.json";

type RawListing = {
  asin: string;
  title: string;
  price: number | null;
  listPrice: number | null;
  rating: number | null;
  reviewCount: number;
  category: string[];
  bullets: { title: string; text: string }[];
  aplusText: string[];
  images: string[];
  aplusImages: string[];
};

const listings = catalog.products as Record<string, RawListing>;

export type CategorySlug = "toothpaste" | "haircare" | "essentials";
export type Brand = "Nice Smile" | "XHC" | "XBC" | "Mucky Pup" | "Medex" | "Clear & Simple" | "Super Bright" | "CloudKicks";
export type ProductType =
  | "Toothpaste"
  | "Leave-in conditioner"
  | "Conditioner"
  | "Shampoo"
  | "Shampoo & conditioner"
  | "Haircare bars"
  | "Dog shampoo"
  | "Liquid talc"
  | "Cotton buds"
  | "Breath spray"
  | "Pregnancy tests"
  | "Car sponges"
  | "Slippers";

/** Full brand names, for product schema and "in their own words" copy. */
export const brandNames: Record<Brand, string> = {
  "Nice Smile": "Nice Smile",
  XHC: "XHC Xpert Haircare",
  XBC: "XBC Xpel Body Care",
  "Mucky Pup": "Mucky Pup",
  Medex: "Medex",
  "Clear & Simple": "Clear & Simple",
  "Super Bright": "Super Bright",
  CloudKicks: "CloudKicks",
};

/** Copy and routing that differ by category. */
export const categoryInfo: Record<
  CategorySlug,
  {
    label: string;
    /** Blog category whose guides sit under products in this category. */
    blogCategory: "oral-care" | "haircare" | "family-home";
    featuresTitle: string;
    storyTitle: string;
    bestForTitle: string;
    closingTitle: string;
  }
> = {
  toothpaste: {
    label: "Toothpaste",
    blogCategory: "oral-care",
    featuresTitle: "Small tube, *big* personality.",
    storyTitle: "The *story* behind the tube.",
    bestForTitle: "Made for *real* routines.",
    closingTitle: "Brighter brushing is *one tap* away.",
  },
  haircare: {
    label: "Haircare",
    blogCategory: "haircare",
    featuresTitle: "Good hair days, *on repeat*.",
    storyTitle: "The *good stuff*, explained.",
    bestForTitle: "Made for *your* wash day.",
    closingTitle: "Your next wash day, *sorted*.",
  },
  essentials: {
    label: "Everyday essentials",
    blogCategory: "family-home",
    featuresTitle: "The everyday, *sorted*.",
    storyTitle: "The *details*, explained.",
    bestForTitle: "Made for *real* homes.",
    closingTitle: "One less thing to *run out of*.",
  },
};

export type Variant = {
  asin: string;
  /** Option label shown in the variant picker, e.g. "Pack of 2". */
  label: string;
  /** Units in this option (tubes, bottles, bars). */
  units: number;
  price: number | null;
  listPrice: number | null;
  rating: number | null;
  reviewCount: number;
  inStock: boolean;
  image: string;
  title: string;
};

export type Product = {
  slug: string;
  name: string;
  /** Shorter name for the <title> tag when `name` is over ~60 characters. */
  seoName?: string;
  brand: Brand;
  category: CategorySlug;
  type: ProductType;
  /** Short punchy line for cards. */
  tagline: string;
  /** 1-2 sentence description for product pages and meta descriptions. */
  summary: string;
  /** Flavours or scents inside (or colours, key ingredients: see flavourLabel). */
  flavours: string[];
  /** Heading for `flavours` on the product page when "Flavour" or "Scent" doesn't fit, e.g. "Colour". */
  flavourLabel?: string;
  /** Size of a single unit, e.g. "60g tube". */
  unitSize: string;
  /** Noun for one unit: "tube", "bottle", "bar". */
  unitNoun: string;
  accent: string;
  accentSoft: string;
  badges: string[];
  isBundle: boolean;
  isNew: boolean;
  bestFor: string[];
  variants: Variant[];
  primary: Variant;
  images: string[];
  aplusImages: string[];
  features: { title: string; text: string }[];
  story: string[];
  keywords: string[];
};

type Definition = Omit<Product, "variants" | "primary" | "images" | "aplusImages" | "features" | "story"> & {
  variants: { asin: string; label: string; units: number; inStock?: boolean }[];
};

function define(def: Definition): Product {
  const variants: Variant[] = def.variants.map((v) => {
    const l = listings[v.asin];
    if (!l) throw new Error(`[products] ASIN ${v.asin} missing from data/amazon-catalog.json`);
    return {
      asin: v.asin,
      label: v.label,
      units: v.units,
      price: l.price,
      listPrice: l.listPrice && l.price && l.listPrice > l.price ? l.listPrice : null,
      rating: l.rating,
      reviewCount: l.reviewCount,
      inStock: v.inStock ?? l.price !== null,
      image: l.images[0],
      title: l.title,
    };
  });
  const primary = variants[0];
  const main = listings[primary.asin];
  const images = [...new Set([...main.images, ...variants.slice(1).map((v) => v.image)])];
  const aplusImages = [...new Set(def.variants.flatMap((v) => listings[v.asin].aplusImages))];
  return {
    ...def,
    variants,
    primary,
    images,
    aplusImages,
    features: main.bullets.filter((b) => b.text.length > 0),
    story: main.aplusText.filter((t) => t.length > 60).slice(0, 6),
  };
}

const TOOTHPASTE_KEYWORDS = ["flavoured toothpaste", "kids toothpaste", "fluoride toothpaste", "vegan toothpaste", "toothpaste bundle"];
const NO_RINSE_KEYWORDS = ["leave-in conditioner", "no rinse conditioner", "curly hair conditioner", "vegan conditioner"];
const ARGAN_KEYWORDS = ["argan oil shampoo", "argan oil conditioner", "shampoo for dry hair", "paraben-free shampoo"];
const CAFFEINE_KEYWORDS = ["caffeine shampoo", "caffeine conditioner", "menopause shampoo", "shampoo for fine hair"];
const BAR_KEYWORDS = ["shampoo bar", "shampoo and conditioner bar", "2 in 1 shampoo bar", "plastic free shampoo"];

export const products: Product[] = [
  define({
    slug: "nice-smile-12-pack-toothpaste-bundle",
    name: "Nice Smile 12 Pack Toothpaste Bundle",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "Twelve tubes. One very organised bathroom.",
    summary:
      "Twelve 60g tubes: four each of Watermelon Fresh, Feelin' Grape and Peachy Clean. Whitening fluoride toothpaste for kids and adults, vegan, cruelty-free and enamel-safe.",
    flavours: ["Watermelon Fresh", "Feelin' Grape", "Peachy Clean"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#FF5468",
    accentSoft: "#FFE3E6",
    badges: ["Best value per tube", "12 tubes"],
    isBundle: true,
    isNew: true,
    bestFor: ["Big families", "Stocking up", "Multi-bathroom homes"],
    keywords: [...TOOTHPASTE_KEYWORDS, "toothpaste 12 pack", "bulk toothpaste"],
    variants: [{ asin: "B0HBXLVW4S", label: "12 × 60g", units: 12 }],
  }),
  define({
    slug: "nice-smile-6-pack-toothpaste-bundle",
    name: "Nice Smile 6 Pack Toothpaste Bundle",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "The fruity trio, two of each.",
    summary:
      "Six 60g tubes, two each of Watermelon Fresh, Feelin' Grape and Peachy Clean. Whitening fluoride toothpaste for kids and adults, vegan, cruelty-free and enamel-safe.",
    flavours: ["Watermelon Fresh", "Feelin' Grape", "Peachy Clean"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#8E4BC4",
    accentSoft: "#EFE3FA",
    badges: ["6 tubes"],
    isBundle: true,
    isNew: false,
    bestFor: ["Families", "Fruit fans", "Gifting"],
    keywords: [...TOOTHPASTE_KEYWORDS, "toothpaste 6 pack"],
    // The All Flavours (B0G318R9JG) and Berry, Gummy & Candy (B0GTWGV3Q5) 6 packs were delisted in Oct 2026.
    variants: [{ asin: "B0GTW7L1FM", label: "Watermelon, Peach & Grape (6 pack)", units: 6 }],
  }),
  define({
    slug: "nice-smile-3-pack-berry-gummy-candy",
    name: "Nice Smile 3 Pack: Berry Burst, Yummy Gummy & Candy Clean",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "The sweet-tooth trio. Our most reviewed bundle.",
    summary:
      "Three 60g tubes of flavoured whitening fluoride toothpaste in Berry Burst, Yummy Gummy and Candy Clean. Vegan, cruelty-free and enamel-safe, for kids and adults.",
    flavours: ["Berry Burst", "Yummy Gummy", "Candy Clean"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#3D6FE8",
    accentSoft: "#E1E9FC",
    badges: ["Most reviewed", "3 tubes"],
    isBundle: true,
    isNew: false,
    bestFor: ["Kids who hate mint", "Travel kits", "Gifting"],
    keywords: [...TOOTHPASTE_KEYWORDS, "candy flavoured toothpaste", "bubblegum toothpaste"],
    variants: [{ asin: "B0FLFZ2Z6C", label: "3 × 60g", units: 3 }],
  }),
  define({
    slug: "nice-smile-3-pack-watermelon-grape-peach",
    name: "Nice Smile 3 Pack: Watermelon Fresh, Feelin' Grape & Peachy Clean",
    seoName: "Nice Smile 3 Pack: Watermelon, Grape & Peach Toothpaste",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "A fruit bowl for your toothbrush.",
    summary:
      "Three 60g tubes of fruity whitening fluoride toothpaste in Watermelon Fresh, Feelin' Grape and Peachy Clean. Vegan, cruelty-free and enamel-safe.",
    flavours: ["Watermelon Fresh", "Feelin' Grape", "Peachy Clean"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#FF9B54",
    accentSoft: "#FFEBDC",
    badges: ["3 tubes"],
    isBundle: true,
    isNew: false,
    bestFor: ["Fruit fans", "First flavoured toothpaste", "Gym bags"],
    keywords: [...TOOTHPASTE_KEYWORDS, "fruit flavoured toothpaste", "watermelon toothpaste"],
    variants: [{ asin: "B0FLWZ7D6T", label: "3 × 60g", units: 3 }],
  }),
  define({
    slug: "nice-smile-watermelon-fresh-toothpaste",
    name: "Nice Smile Watermelon Fresh Toothpaste",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "You're one in a melon.",
    summary: "A 60g tube of watermelon flavoured whitening toothpaste with fluoride. Gentle, enamel-safe, vegan and cruelty-free.",
    flavours: ["Watermelon Fresh"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#FF5468",
    accentSoft: "#FFE3E6",
    badges: ["Top rated"],
    isBundle: false,
    isNew: false,
    bestFor: ["Trying a flavour", "Handbags", "Travel"],
    keywords: [...TOOTHPASTE_KEYWORDS, "watermelon toothpaste"],
    variants: [{ asin: "B0FNYGR43T", label: "Single 60g", units: 1 }],
  }),
  define({
    slug: "nice-smile-yummy-gummy-toothpaste",
    name: "Nice Smile Yummy Gummy Toothpaste",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "Un-bear-ably fresh.",
    summary: "Gummy bear flavoured whitening toothpaste with fluoride in a 60g tube. Gentle, enamel-safe, vegan and cruelty-free.",
    flavours: ["Yummy Gummy"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#E6508F",
    accentSoft: "#FCE1EC",
    badges: [],
    isBundle: false,
    isNew: false,
    bestFor: ["Little brushers", "Sweet tooths"],
    keywords: [...TOOTHPASTE_KEYWORDS, "gummy bear toothpaste"],
    variants: [
      { asin: "B0FPDJHWN8", label: "Single 60g", units: 1 },
      { asin: "B0H34VYVVM", label: "Pack of 2", units: 2 },
    ],
  }),
  define({
    slug: "nice-smile-feelin-grape-toothpaste",
    name: "Nice Smile Feelin' Grape Toothpaste",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "Brush with grape-ness.",
    summary: "Grape flavoured whitening toothpaste with fluoride in a 60g tube. Gentle, enamel-safe, vegan and cruelty-free.",
    flavours: ["Feelin' Grape"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#7B3FB8",
    accentSoft: "#EDE2F8",
    badges: [],
    isBundle: false,
    isNew: false,
    bestFor: ["Grape lovers", "Kids' first flavour"],
    keywords: [...TOOTHPASTE_KEYWORDS, "grape toothpaste"],
    variants: [
      { asin: "B0FNYH9TFC", label: "Single 60g", units: 1 },
      { asin: "B0H34WYZB2", label: "Pack of 2", units: 2 },
    ],
  }),
  // Candy Clean single (B0FPDJXQRG) and pack of 4 (B0H34TJ7QT) were delisted in Oct 2026; its old page
  // redirects to the Berry, Gummy & Candy 3 pack (next.config.ts).
  define({
    slug: "nice-smile-peachy-clean-toothpaste",
    name: "Nice Smile Peachy Clean Toothpaste",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "Peach, please.",
    summary: "Peach flavoured whitening toothpaste with fluoride in a 60g tube. Gentle, enamel-safe, vegan and cruelty-free, for kids and adults.",
    flavours: ["Peachy Clean"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#FF9B54",
    accentSoft: "#FFEBDC",
    badges: [],
    isBundle: false,
    isNew: false,
    bestFor: ["Peach fans", "Trying a flavour", "Travel"],
    keywords: [...TOOTHPASTE_KEYWORDS, "peach toothpaste"],
    variants: [{ asin: "B0FNY3JP8L", label: "Single 60g", units: 1 }],
  }),
  define({
    slug: "nice-smile-2-pack-grape-peach",
    name: "Nice Smile 2 Pack: Feelin' Grape & Peachy Clean",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "A grape and a peach walk into a bathroom.",
    summary:
      "Two 60g tubes of flavoured whitening fluoride toothpaste, one Feelin' Grape and one Peachy Clean. Vegan, cruelty-free and enamel-safe, for kids and adults.",
    flavours: ["Feelin' Grape", "Peachy Clean"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#C0569F",
    accentSoft: "#F9E1EF",
    badges: ["2 tubes"],
    isBundle: true,
    isNew: false,
    bestFor: ["Mint haters", "Sharing", "Wash bags"],
    keywords: [...TOOTHPASTE_KEYWORDS, "grape toothpaste", "peach toothpaste"],
    variants: [{ asin: "B0FNZ7BHH9", label: "2 × 60g", units: 2 }],
  }),
  define({
    slug: "nice-smile-2-pack-watermelon-peach",
    name: "Nice Smile 2 Pack: Watermelon Fresh & Peachy Clean",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "Summer fruits, all year round.",
    summary:
      "Two 60g tubes of flavoured whitening fluoride toothpaste, one Watermelon Fresh and one Peachy Clean. Vegan, cruelty-free and enamel-safe, for kids and adults.",
    flavours: ["Watermelon Fresh", "Peachy Clean"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#FF7A5C",
    accentSoft: "#FFE6DE",
    badges: ["2 tubes"],
    isBundle: true,
    isNew: false,
    bestFor: ["Fruit fans", "Sharing", "Wash bags"],
    keywords: [...TOOTHPASTE_KEYWORDS, "watermelon toothpaste", "peach toothpaste"],
    variants: [{ asin: "B0FSBKNHNC", label: "2 × 60g", units: 2 }],
  }),
  define({
    slug: "nice-smile-3-pack-single-flavour",
    name: "Nice Smile Single Flavour 3 Pack",
    brand: "Nice Smile",
    category: "toothpaste",
    type: "Toothpaste",
    tagline: "Found your favourite? Triple it.",
    summary:
      "Three 60g tubes of one Nice Smile flavour: Yummy Gummy, Peachy Clean or Feelin' Grape. Whitening fluoride toothpaste, vegan, cruelty-free and enamel-safe.",
    flavours: ["Yummy Gummy", "Peachy Clean", "Feelin' Grape"],
    unitSize: "60g tube",
    unitNoun: "tube",
    accent: "#E6508F",
    accentSoft: "#FCE1EC",
    badges: ["3 tubes"],
    isBundle: true,
    isNew: false,
    bestFor: ["Fussy brushers", "Stocking up on a favourite"],
    keywords: [...TOOTHPASTE_KEYWORDS, "toothpaste 3 pack"],
    variants: [
      { asin: "B0HBQLWB9J", label: "Triple Yummy Gummy", units: 3 },
      { asin: "B0H2B9N4TP", label: "Triple Peachy Clean", units: 3 },
      { asin: "B0G62MSX9T", label: "Triple Feelin' Grape", units: 3 },
    ],
  }),
  define({
    slug: "xhc-no-rinse-conditioner-3-pack",
    name: "XHC No Rinse Conditioner 3 Pack",
    brand: "XHC",
    category: "haircare",
    type: "Leave-in conditioner",
    tagline: "Three scents. Zero rinsing.",
    summary:
      "Three 250ml vegan leave-in conditioners in Cherry & Almond, Dragon Fruit & Vanilla and Mango & Coconut. Made for curly, afro and damaged hair, sulphate-free and cruelty-free.",
    flavours: ["Cherry & Almond", "Dragon Fruit & Vanilla", "Mango & Coconut"],
    unitSize: "250ml tube",
    unitNoun: "tube",
    accent: "#F2765F",
    accentSoft: "#FDE6E1",
    badges: ["3 tubes", "Vegan"],
    isBundle: true,
    isNew: false,
    bestFor: ["Curly & afro hair", "Wash-day skippers", "Gym bags"],
    keywords: [...NO_RINSE_KEYWORDS, "leave-in conditioner bundle"],
    variants: [
      { asin: "B0G3BS11B8", label: "3 pack (1 of each)", units: 3 },
      { asin: "B0HLXX21N5", label: "6 pack (2 of each)", units: 6 },
    ],
  }),
  define({
    slug: "xhc-no-rinse-conditioner",
    name: "XHC Vegan No Rinse Conditioner",
    brand: "XHC",
    category: "haircare",
    type: "Leave-in conditioner",
    tagline: "Pick your scent. Skip the rinse.",
    summary:
      "A 250ml vegan leave-in conditioner for curly, afro and damaged hair. Sulphate-free and cruelty-free. Choose Mango & Coconut, Dragon Fruit & Vanilla or Cherry & Almond.",
    flavours: ["Mango & Coconut", "Dragon Fruit & Vanilla", "Cherry & Almond"],
    unitSize: "250ml tube",
    unitNoun: "tube",
    accent: "#FDB42C",
    accentSoft: "#FFF1D2",
    badges: ["Vegan", "Sulphate-free"],
    isBundle: false,
    isNew: false,
    bestFor: ["Frizz control", "Refreshing curls", "Detangling"],
    keywords: NO_RINSE_KEYWORDS,
    variants: [
      { asin: "B0G3Y4NC1Y", label: "Mango & Coconut", units: 1 },
      { asin: "B0G3XM5FWJ", label: "Dragon Fruit & Vanilla", units: 1 },
      { asin: "B0G3Y49RX7", label: "Cherry & Almond", units: 1 },
    ],
  }),
  define({
    slug: "xhc-no-rinse-conditioner-twin-pack",
    name: "XHC No Rinse Conditioner Twin Pack",
    brand: "XHC",
    category: "haircare",
    type: "Leave-in conditioner",
    tagline: "Cherry & Almond meets Dragon Fruit & Vanilla.",
    summary:
      "Two 250ml vegan leave-in conditioners in Cherry & Almond and Dragon Fruit & Vanilla, for curly, afro and damaged hair.",
    flavours: ["Cherry & Almond", "Dragon Fruit & Vanilla"],
    unitSize: "250ml tube",
    unitNoun: "tube",
    accent: "#E562B0",
    accentSoft: "#FBE0F0",
    badges: ["2 tubes"],
    isBundle: true,
    isNew: false,
    bestFor: ["Curly & afro hair", "Sharing"],
    keywords: NO_RINSE_KEYWORDS,
    variants: [{ asin: "B0GK9LFDFX", label: "2 × 250ml", units: 2 }],
  }),
  define({
    slug: "xhc-argan-oil-shampoo-conditioner-set",
    name: "XHC Argan Oil Shampoo & Conditioner Set",
    brand: "XHC",
    category: "haircare",
    type: "Shampoo & conditioner",
    tagline: "The whole wash-day ritual, sorted.",
    summary:
      "One 300ml argan oil shampoo and one 300ml argan oil conditioner. Nourishing, moisturising, vegan friendly and paraben-free, for all hair types.",
    flavours: ["Moroccan Argan Oil"],
    unitSize: "300ml bottle",
    unitNoun: "bottle",
    accent: "#9A6A3A",
    accentSoft: "#F3E8DB",
    badges: ["Complete routine"],
    isBundle: true,
    isNew: false,
    bestFor: ["Dry hair", "A simple routine", "Gifting"],
    keywords: [...ARGAN_KEYWORDS, "shampoo and conditioner set"],
    variants: [{ asin: "B0GBMH1N54", label: "Shampoo + conditioner", units: 2 }],
  }),
  define({
    slug: "xhc-argan-oil-shampoo-3-pack",
    name: "XHC Argan Oil Shampoo 3 Pack",
    brand: "XHC",
    category: "haircare",
    type: "Shampoo",
    tagline: "Moroccan argan oil, times three.",
    summary:
      "Three 300ml Moroccan argan oil shampoos for dry or damaged hair. Nourishing, moisturising and shine boosting.",
    flavours: ["Moroccan Argan Oil"],
    unitSize: "300ml bottle",
    unitNoun: "bottle",
    accent: "#B07A3E",
    accentSoft: "#F5EADC",
    badges: ["3 bottles"],
    isBundle: true,
    isNew: true,
    bestFor: ["Dry or damaged hair", "Stocking up"],
    keywords: ARGAN_KEYWORDS,
    variants: [{ asin: "B0GNS29WY9", label: "3 × 300ml", units: 3 }],
  }),
  define({
    slug: "xhc-argan-oil-shampoo-twin-pack",
    name: "XHC Argan Oil Shampoo Twin Pack",
    brand: "XHC",
    category: "haircare",
    type: "Shampoo",
    tagline: "Salon-style shine for everyday washing.",
    summary:
      "Nourishing and moisturising Moroccan argan oil shampoo in 300ml bottles. Vegan friendly and paraben-free. Available as a twin pack or a single bottle.",
    flavours: ["Moroccan Argan Oil"],
    unitSize: "300ml bottle",
    unitNoun: "bottle",
    accent: "#8C5A2E",
    accentSoft: "#F1E5D8",
    badges: ["Twin or single"],
    isBundle: true,
    isNew: false,
    bestFor: ["Everyday washing", "Households who share"],
    keywords: ARGAN_KEYWORDS,
    // The 6 bottle stock-up (B0H34SJXPD) was delisted in Oct 2026.
    variants: [
      { asin: "B0GG7J6QCM", label: "Twin pack (2 × 300ml)", units: 2 },
      { asin: "B0HB199B8W", label: "Single 300ml", units: 1 },
    ],
  }),
  define({
    slug: "xhc-argan-oil-conditioner-twin-pack",
    name: "XHC Argan Oil Conditioner Twin Pack",
    brand: "XHC",
    category: "haircare",
    type: "Conditioner",
    tagline: "Soft, smooth and our highest rated.",
    summary:
      "Moroccan argan oil conditioner in 300ml tubes for soft, smooth hair. Vegan friendly and paraben-free. Available as a twin pack or a single tube.",
    flavours: ["Moroccan Argan Oil"],
    unitSize: "300ml bottle",
    unitNoun: "bottle",
    accent: "#A8743F",
    accentSoft: "#F4E9DD",
    badges: ["Highest rated"],
    isBundle: true,
    isNew: false,
    bestFor: ["Frizz", "Softness", "Pairing with the shampoo"],
    keywords: [...ARGAN_KEYWORDS, "argan oil conditioner"],
    variants: [
      { asin: "B0GG7YNXRZ", label: "Twin pack (2 × 300ml)", units: 2 },
      { asin: "B0HB122VYS", label: "Single 300ml", units: 1 },
    ],
  }),
  define({
    slug: "xhc-argan-oil-conditioner-3-pack",
    name: "XHC Argan Oil Conditioner 3 Pack",
    brand: "XHC",
    category: "haircare",
    type: "Conditioner",
    tagline: "Three bottles of silky.",
    summary: "Three 300ml nourishing and moisturising Moroccan argan oil conditioners. Vegan friendly and paraben-free.",
    flavours: ["Moroccan Argan Oil"],
    unitSize: "300ml bottle",
    unitNoun: "bottle",
    accent: "#946233",
    accentSoft: "#F2E6D9",
    badges: ["3 bottles"],
    isBundle: true,
    isNew: false,
    bestFor: ["Dry hair", "Stocking up"],
    keywords: [...ARGAN_KEYWORDS, "argan oil conditioner"],
    variants: [{ asin: "B0GBMTMS6T", label: "3 × 300ml", units: 3 }],
  }),
  define({
    slug: "xhc-rosemary-mint-shampoo-3-pack",
    name: "XHC Rosemary & Mint Shampoo 3 Pack",
    brand: "XHC",
    category: "haircare",
    type: "Shampoo",
    tagline: "A cool, clean reset for your scalp.",
    summary:
      "Three 300ml revitalising rosemary and mint shampoos for dry or damaged hair. Cleanses, refreshes and enhances shine. Vegan and cruelty-free.",
    flavours: ["Rosemary & Mint"],
    unitSize: "300ml bottle",
    unitNoun: "bottle",
    accent: "#2FB59B",
    accentSoft: "#DDF5EF",
    badges: ["3 bottles", "Vegan"],
    isBundle: true,
    isNew: true,
    bestFor: ["Refreshing scalps", "Rosemary routines"],
    keywords: ["rosemary shampoo", "rosemary and mint shampoo", "vegan shampoo", "shampoo 3 pack"],
    variants: [{ asin: "B0GMXQNCYN", label: "3 × 300ml", units: 3 }],
  }),
  define({
    slug: "xhc-shampoo-conditioner-bars",
    name: "XHC 2-in-1 Shampoo & Conditioner Bars",
    brand: "XHC",
    category: "haircare",
    type: "Haircare bars",
    tagline: "Plastic-free, carry-on friendly, tropical.",
    summary:
      "Solid 2-in-1 shampoo and conditioner bars in Coconut, Banana and Papaya. Plastic-free, vegan friendly and travel-friendly. Choose a 3 pack or a 6 pack.",
    flavours: ["Coconut", "Banana", "Papaya"],
    unitSize: "60g bar",
    unitNoun: "bar",
    accent: "#F4A52B",
    accentSoft: "#FEEFD6",
    badges: ["Most reviewed haircare", "Plastic-free"],
    isBundle: true,
    isNew: true,
    bestFor: ["Travel", "Low-waste bathrooms", "Gym bags"],
    keywords: BAR_KEYWORDS,
    variants: [
      { asin: "B0GKYHKMRG", label: "3 pack (Coconut, Banana, Papaya)", units: 3 },
      { asin: "B0H9YX3DG3", label: "6 pack (2 of each)", units: 6 },
    ],
  }),
  define({
    slug: "xhc-2-in-1-shampoo-bar",
    name: "XHC 2-in-1 Shampoo & Conditioner Bar",
    brand: "XHC",
    category: "haircare",
    type: "Haircare bars",
    tagline: "One bar, one scent, zero bottles.",
    summary:
      "A single 60g solid shampoo and conditioner bar, 97% plant based and suitable for vegans, with cocoa and shea butter. Choose Banana, Coconut or Papaya.",
    flavours: ["Banana", "Coconut", "Papaya"],
    unitSize: "60g bar",
    unitNoun: "bar",
    accent: "#F2C94C",
    accentSoft: "#FDF3D3",
    badges: ["Plastic-free", "Vegan"],
    isBundle: false,
    isNew: true,
    bestFor: ["Trying a bar", "Wash bags", "Gym bags"],
    keywords: BAR_KEYWORDS,
    variants: [
      { asin: "B0H9YYTF42", label: "Banana", units: 1 },
      { asin: "B0H9YYNF25", label: "Coconut", units: 1 },
      { asin: "B0H9Z4FVN4", label: "Papaya", units: 1 },
    ],
  }),
  define({
    slug: "xhc-silver-shampoo-3-pack",
    name: "XHC Shimmer of Silver Purple Shampoo 3 Pack",
    seoName: "XHC Purple Silver Shampoo 3 Pack",
    brand: "XHC",
    category: "haircare",
    type: "Shampoo",
    tagline: "Bright blondes, silver greys.",
    summary:
      "Three 400ml bottles of XHC Shimmer of Silver purple shampoo, made to lighten blonde, grey and white hair. For women and men, for daily use.",
    flavours: ["Blonde", "Grey", "White"],
    flavourLabel: "Made for",
    unitSize: "400ml bottle",
    unitNoun: "bottle",
    accent: "#8B6FC6",
    accentSoft: "#ECE6F7",
    badges: ["3 bottles", "1.2 litres"],
    isBundle: true,
    isNew: false,
    bestFor: ["Blonde hair", "Grey and silver hair", "Brassy tones"],
    keywords: ["purple shampoo", "silver shampoo", "shampoo for grey hair", "blonde shampoo"],
    variants: [{ asin: "B0GFXSFDY3", label: "3 × 400ml", units: 3 }],
  }),
  define({
    slug: "xhc-caffeine-shampoo-3-pack",
    name: "XHC Plant Essence Caffeine Shampoo 3 Pack",
    seoName: "XHC Caffeine Shampoo 3 Pack for Men & Women",
    brand: "XHC",
    category: "haircare",
    type: "Shampoo",
    tagline: "Caffeine and zinc for everyday washing.",
    summary:
      "Three 300ml bottles of XHC Plant Essence caffeine shampoo, infused with caffeine and zinc to help boost hair and scalp health. For men and women, fine or dry hair, and menopausal hair.",
    flavours: ["Caffeine", "Zinc", "Vitamin C"],
    flavourLabel: "Key ingredients",
    unitSize: "300ml bottle",
    unitNoun: "bottle",
    accent: "#1E9E7E",
    accentSoft: "#DDF3EC",
    badges: ["3 bottles", "Men & women"],
    isBundle: true,
    isNew: false,
    bestFor: ["Fine, dry hair", "Menopausal hair", "Scalp care routines"],
    keywords: CAFFEINE_KEYWORDS,
    variants: [{ asin: "B0GG8DF2RB", label: "3 × 300ml", units: 3 }],
  }),
  define({
    slug: "xhc-caffeine-conditioner-3-pack",
    name: "XHC Plant Essence Caffeine Conditioner 3 Pack",
    seoName: "XHC Caffeine Conditioner 3 Pack for Men & Women",
    brand: "XHC",
    category: "haircare",
    type: "Conditioner",
    tagline: "The other half of the caffeine routine.",
    summary:
      "Three 200ml tubes of XHC Plant Essence caffeine conditioner, infused with caffeine and zinc to help boost hair and scalp health. For men and women, fine or dry hair, and menopausal hair.",
    flavours: ["Caffeine", "Zinc", "Vitamin C"],
    flavourLabel: "Key ingredients",
    unitSize: "200ml tube",
    unitNoun: "tube",
    accent: "#17A589",
    accentSoft: "#D9F2EC",
    badges: ["3 tubes", "Men & women"],
    isBundle: true,
    isNew: false,
    bestFor: ["Fine, dry hair", "Menopausal hair", "Pairing with the shampoo"],
    keywords: CAFFEINE_KEYWORDS,
    variants: [{ asin: "B0GGC9W86R", label: "3 × 200ml", units: 3 }],
  }),

  /* ---------- Everyday essentials ---------- */

  define({
    slug: "mucky-pup-flea-repellent-dog-shampoo",
    name: "Mucky Pup Flea Repellent Dog Shampoo",
    brand: "Mucky Pup",
    category: "essentials",
    type: "Dog shampoo",
    tagline: "Every bath does two jobs.",
    summary:
      "Flea repellent dog shampoo made with the insect repellent IR3535. Lifts mud and dirt, helps reduce tangles and leaves a shiny coat. A grooming shampoo, not a flea treatment. Choose a 3 pack or a 6 pack.",
    flavours: [],
    unitSize: "475ml bottle",
    unitNoun: "bottle",
    accent: "#2E9E6B",
    accentSoft: "#DFF3E9",
    badges: ["Flea repellent", "3 or 6 bottles"],
    isBundle: true,
    isNew: true,
    bestFor: ["Muddy walks", "Multi-dog homes", "Regular bath time"],
    keywords: ["flea shampoo for dogs", "dog shampoo", "flea repellent dog shampoo", "dog shampoo multipack"],
    variants: [
      { asin: "B0GJQ4H9GM", label: "3 pack", units: 3 },
      { asin: "B0H6TRBT99", label: "6 pack", units: 6 },
    ],
  }),
  define({
    slug: "xbc-liquid-talc",
    name: "XBC Liquid Talc Bundle",
    brand: "XBC",
    category: "essentials",
    type: "Liquid talc",
    tagline: "The feel of talc, without the cloud.",
    summary:
      "Talc free liquid talc in 200ml flip cap tubes. Goes on like a lotion and dries to a soft, powdery finish, helping keep skin soft and prevent chafing. Made with cornstarch, for the whole family. Choose 5 or 12 tubes.",
    flavours: [],
    unitSize: "200ml tube",
    unitNoun: "tube",
    accent: "#5AA9E6",
    accentSoft: "#E3F1FC",
    badges: ["Talc free", "5 or 12 tubes"],
    isBundle: true,
    isNew: true,
    bestFor: ["Nappy changes", "After the bath", "Chafing"],
    keywords: ["liquid talc", "talc free powder", "baby powder lotion", "anti chafing"],
    variants: [
      { asin: "B0GL9KRBLS", label: "5 pack", units: 5 },
      { asin: "B0HCCR1P9M", label: "12 pack", units: 12 },
    ],
  }),
  define({
    slug: "xbc-bamboo-cotton-buds-3-pack",
    name: "XBC Bamboo Cotton Buds 3 Pack",
    brand: "XBC",
    category: "essentials",
    type: "Cotton buds",
    tagline: "900 buds, zero plastic stems.",
    summary:
      "Three tubs of 300 bamboo cotton buds, 900 in total. Biodegradable bamboo stems with 100% cotton tips, for beauty, personal care and household jobs.",
    flavours: [],
    unitSize: "tub of 300",
    unitNoun: "tub",
    accent: "#A47E5B",
    accentSoft: "#F1E9E0",
    badges: ["900 buds", "Plastic-free stems"],
    isBundle: true,
    isNew: false,
    bestFor: ["Make-up touch-ups", "Low-waste bathrooms", "Household cleaning"],
    keywords: ["bamboo cotton buds", "plastic free cotton buds", "biodegradable cotton buds"],
    variants: [{ asin: "B0GL9H92HP", label: "3 tubs (900 buds)", units: 3 }],
  }),
  define({
    slug: "medex-minty-fresh-breath-spray",
    name: "Medex Minty Fresh Breath Spray",
    brand: "Medex",
    category: "essentials",
    type: "Breath spray",
    tagline: "Fresh breath, pocket-sized.",
    summary: "A compact, sugar free mint breath spray that gives a quick burst of freshness at work, after meals or on the go.",
    flavours: ["Mint"],
    unitSize: "spray",
    unitNoun: "spray",
    accent: "#2D7FD3",
    accentSoft: "#E0EDFA",
    badges: ["Sugar free", "Travel size"],
    isBundle: false,
    isNew: false,
    bestFor: ["Pockets and handbags", "After meals", "Meetings and dates"],
    keywords: ["breath spray", "mouth spray", "fresh breath spray"],
    variants: [
      { asin: "B0GNSCTDVJ", label: "Single spray", units: 1 },
      { asin: "B0GFFLZZ1R", label: "2 pack", units: 2 },
    ],
  }),
  define({
    slug: "clear-and-simple-pregnancy-tests-3-pack",
    name: "Clear & Simple Pregnancy Test Sticks 3 Pack",
    brand: "Clear & Simple",
    category: "essentials",
    type: "Pregnancy tests",
    tagline: "Six tests, clear lines.",
    summary:
      "Three boxes of two Clear & Simple pregnancy test sticks, six tests in total. Urine test sticks with 20 mIU/mL hCG sensitivity and results in 5 minutes, each in a sealed pouch.",
    flavours: [],
    unitSize: "test stick",
    unitNoun: "test",
    accent: "#3D6FE8",
    accentSoft: "#E1E9FC",
    badges: ["6 tests"],
    isBundle: true,
    isNew: false,
    bestFor: ["Testing again", "Keeping spares at home"],
    keywords: ["pregnancy test", "pregnancy test sticks", "early pregnancy test"],
    variants: [{ asin: "B0GG8GRWQ7", label: "3 boxes (6 tests)", units: 6 }],
  }),
  define({
    slug: "jumbo-car-wash-sponges-6-pack",
    name: "Jumbo Car Wash Sponges 6 Pack",
    brand: "Super Bright",
    category: "essentials",
    type: "Car sponges",
    tagline: "Big, soft and ready for wash day.",
    summary:
      "Six large, thick foam car wash sponges with an easy grip shape. Soft on paintwork, glass and wheels, and handy around the house and garage too.",
    flavours: [],
    unitSize: "jumbo sponge",
    unitNoun: "sponge",
    accent: "#F2B705",
    accentSoft: "#FFF4CC",
    badges: ["6 sponges"],
    isBundle: true,
    isNew: false,
    bestFor: ["Car wash day", "Wheels and windows", "Household jobs"],
    keywords: ["car wash sponge", "car sponges", "jumbo sponge"],
    variants: [{ asin: "B0H3789PPL", label: "6 sponges", units: 6 }],
  }),
  define({
    slug: "cloudkicks-air-110-sneaker-slippers",
    name: "CloudKicks Air 110 Sneaker Slippers",
    brand: "CloudKicks",
    category: "essentials",
    type: "Slippers",
    tagline: "Sneaker style for the sofa.",
    summary:
      "Oversized plush house slippers with a sneaker-inspired look and a chunky cushioned sole. One size fits most adults (UK 3 to 11). Choose Hyper Turquoise or OG Neon.",
    flavours: ["Hyper Turquoise", "OG Neon"],
    flavourLabel: "Colours",
    unitSize: "pair",
    unitNoun: "pair",
    accent: "#16A3A3",
    accentSoft: "#DAF3F3",
    badges: ["One size fits most"],
    isBundle: false,
    isNew: false,
    bestFor: ["Lounging at home", "Working from home", "Gifting"],
    keywords: ["sneaker slippers", "house slippers", "plush slippers"],
    variants: [
      { asin: "B0GSSL287J", label: "Hyper Turquoise", units: 1 },
      { asin: "B0GSS5MXNG", label: "OG Neon", units: 1 },
    ],
  }),
];

/* ---------- Helpers ---------- */

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductByAsin(asin: string) {
  return products.find((p) => p.variants.some((v) => v.asin === asin));
}

export function pricePerUnit(v: Variant) {
  return v.price ? v.price / v.units : null;
}

/** Cheapest per-unit price across a product's in-stock variants. */
export function bestUnitPrice(p: Product) {
  const prices = p.variants.filter((v) => v.inStock).map(pricePerUnit).filter((n): n is number => n !== null);
  return prices.length ? Math.min(...prices) : null;
}

/** Lowest in-stock price, for "from £x" labels. */
export function fromPrice(p: Product) {
  const prices = p.variants.filter((v) => v.inStock && v.price !== null).map((v) => v.price as number);
  return prices.length ? Math.min(...prices) : null;
}

export function isInStock(p: Product) {
  return p.variants.some((v) => v.inStock);
}

/**
 * Distinct Amazon rating pools for a product. Variants under one Amazon parent
 * listing report the same shared ratings, so each pool is counted once.
 * This is the single source for every ratings figure on the site.
 */
function ratingPools(p: Product) {
  const pools = new Map<string, { rating: number; count: number }>();
  for (const v of p.variants) {
    if (v.rating !== null && v.reviewCount > 0) pools.set(`${v.rating}|${v.reviewCount}`, { rating: v.rating, count: v.reviewCount });
  }
  return [...pools.values()];
}

/** Total Amazon ratings across products. Site-wide figures use in-stock products. */
export function totalReviews(list: Product[] = products.filter(isInStock)) {
  return list.reduce((n, p) => n + ratingPools(p).reduce((m, x) => m + x.count, 0), 0);
}

/** Average Amazon star rating, weighted by number of ratings. */
export function averageRating(list: Product[] = products.filter(isInStock)) {
  let sum = 0;
  let count = 0;
  for (const p of list) {
    for (const x of ratingPools(p)) {
      sum += x.rating * x.count;
      count += x.count;
    }
  }
  return count ? sum / count : null;
}

export function relatedProducts(p: Product, limit = 4) {
  return products
    .filter((x) => x.slug !== p.slug && isInStock(x))
    .map((x) => ({ x, score: (x.category === p.category ? 2 : 0) + (x.brand === p.brand ? 1 : 0) + (x.isBundle ? 0.5 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ x }) => x);
}

/* ---------- Collections ---------- */

export type Collection = {
  slug: string;
  title: string;
  eyebrow: string;
  headline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  accent: string;
  image: string;
  amazonPage: "toothpaste" | "haircare" | "newArrivals" | "shopAll";
  /** Short label for counts and filters, e.g. "Essentials". */
  shortTitle?: string;
  filter: (p: Product) => boolean;
};

export const collections: Collection[] = [
  {
    slug: "toothpaste",
    title: "Toothpaste",
    eyebrow: "Nice Smile",
    headline: "Flavoured toothpaste that makes *brushing* the best bit.",
    description:
      "Nice Smile whitening fluoride toothpaste in six fruity and sweet flavours. Vegan, cruelty-free, enamel-safe and loved by kids and grown-ups alike.",
    seoTitle: "Flavoured Toothpaste Bundles for Kids & Adults",
    seoDescription:
      "Shop Nice Smile flavoured fluoride toothpaste: Watermelon, Grape, Peach, Berry, Gummy and Candy. Vegan, enamel-safe multi-packs sold on Amazon by PoundMart.",
    accent: "#FF5468",
    image: "/products/B0G318R9JG/g1.jpg",
    amazonPage: "toothpaste",
    filter: (p) => p.category === "toothpaste",
  },
  {
    slug: "haircare",
    title: "Haircare",
    eyebrow: "XHC Xpert Haircare",
    headline: "Haircare for *every* hair type, bundled for less.",
    description:
      "No-rinse conditioners for curls, Moroccan argan oil shampoo and conditioner, rosemary and mint, and plastic-free 2-in-1 bars.",
    seoTitle: "Vegan Haircare Bundles: Leave-In, Argan Oil & Bars",
    seoDescription:
      "XHC haircare bundles: vegan no-rinse conditioner for curly and afro hair, argan oil shampoo and conditioner, rosemary shampoo and plastic-free bars.",
    accent: "#9A6A3A",
    image: "/products/B0GBMH1N54/g1.jpg",
    amazonPage: "haircare",
    filter: (p) => p.category === "haircare",
  },
  {
    slug: "essentials",
    title: "Everyday Essentials",
    shortTitle: "Essentials",
    eyebrow: "Around the house",
    headline: "The rest of the house, *bundled* too.",
    description:
      "Mucky Pup dog shampoo, XBC liquid talc and bamboo cotton buds, Medex breath spray, pregnancy tests, car sponges and CloudKicks slippers.",
    seoTitle: "Everyday Essentials: Dog Shampoo, Liquid Talc & More",
    seoDescription:
      "PoundMart everyday essentials on Amazon: Mucky Pup flea repellent dog shampoo, XBC liquid talc and bamboo cotton buds, Medex breath spray and more.",
    accent: "#2E9E6B",
    image: "/products/B0GJQ4H9GM/g1.jpg",
    amazonPage: "shopAll",
    filter: (p) => p.category === "essentials",
  },
  {
    slug: "bundles",
    title: "Value Bundles",
    eyebrow: "The PoundMart way",
    headline: "More in the box, *less* per tube.",
    description:
      "Our multi-packs are where the value lives. Stock up once, pay less per item, and stop running out on a Tuesday night.",
    seoTitle: "Value Bundles & Multi-Packs of Everyday Essentials",
    seoDescription:
      "Great value multi-packs of toothpaste, shampoo and conditioner. Pay less per item with PoundMart bundles, sold on Amazon and dispatched by Amazon.",
    accent: "#FCD000",
    image: "/products/B0HBXLVW4S/g1.jpg",
    amazonPage: "shopAll",
    filter: (p) => p.isBundle,
  },
  {
    slug: "new-arrivals",
    title: "New Arrivals",
    eyebrow: "Just landed",
    headline: "Fresh *in* the bundle bin.",
    description: "The newest PoundMart bundles, from the 12 pack Nice Smile box to tropical haircare bars, Mucky Pup dog shampoo and XBC liquid talc.",
    seoTitle: "New Arrivals: The Latest PoundMart Bundles",
    seoDescription: "Discover the newest PoundMart bundles on Amazon: Nice Smile 12 pack, XHC shampoo bars and argan oil, Mucky Pup dog shampoo and XBC liquid talc.",
    accent: "#2FB59B",
    image: "/products/B0H9YX3DG3/g1.jpg",
    amazonPage: "newArrivals",
    filter: (p) => p.isNew,
  },
];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function productsIn(c: Collection) {
  return products.filter(c.filter);
}
