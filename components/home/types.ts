/**
 * Plain, serialisable shapes passed from the homepage (server) into its
 * client components. Keeping them here (no runtime imports) means client
 * bundles never pull in the product catalogue.
 */

export type HeroPackshot = {
  slug: string;
  name: string;
  image: string;
  accent: string;
  accentSoft: string;
};

export type HeroData = {
  storeHref: string;
  rating: number;
  ratingCount: number;
  packshots: HeroPackshot[];
  sticker: { perUnit: string; units: number };
  priceNote: string;
};

export type BundleStep = {
  id: string;
  label: string;
  title: string;
  note: string;
  units: number;
  price: string;
  perUnit: number;
  perUnitLabel: string;
  /** Percentage cheaper per tube than the single tube (0 for the single). */
  saving: number;
  image: string;
  accentSoft: string;
};

export type BundleMathsData = {
  steps: BundleStep[];
  finalHref: string;
  finalAsin: string;
  finalSlug: string;
  finalName: string;
  finalLabel: string;
  priceNote: string;
};

export type TickerItem = { name: string; color: string };

export type FlavourOption = {
  id: string;
  name: string;
  pun: string;
  accent: string;
  soft: string;
  description: string;
  productName: string;
  productSlug: string;
  asin: string;
  amazonHref: string;
  priceLabel: string | null;
  packLabel: string;
  rating: number | null;
  reviewCount: number;
  panel: string;
  panelAlt: string;
  /** White-background packshot: a single tube, or the multi-pack the flavour lives in. */
  pack: string;
  packWide: boolean;
};

export type FaqItem = { q: string; a: string };
