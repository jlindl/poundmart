/**
 * Shop filtering and sorting. Pure functions shared by the server (initial
 * render / Suspense fallback) and the client filter UI, so both always agree
 * on the order of the grid.
 */

export const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "toothpaste", label: "Toothpaste" },
  { value: "haircare", label: "Haircare" },
] as const;

export type CategoryFilter = (typeof CATEGORY_OPTIONS)[number]["value"];

export const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "price", label: "Price: low to high" },
  { value: "value", label: "Best value per unit" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

/** The lightweight product shape the client filter needs. */
export type ShopItem = {
  slug: string;
  name: string;
  category: "toothpaste" | "haircare";
  type: string;
  isBundle: boolean;
  inStock: boolean;
  /** Most Amazon ratings on any of the product's options. */
  popularity: number;
  rating: number | null;
  /** Lowest in-stock price. */
  price: number | null;
  /** Lowest in-stock price per tube / bottle / bar. */
  unitPrice: number | null;
};

export type ShopFilters = {
  category: CategoryFilter;
  /** Product type slug, e.g. "leave-in-conditioner". */
  type: string | null;
  bundles: boolean;
  sort: SortKey;
};

/** Grid used by the shop browser and its server-rendered fallback, so the swap is seamless. */
export const GRID_CLASS = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4";

export const DEFAULT_FILTERS: ShopFilters = { category: "all", type: null, bundles: false, sort: "popular" };

export function typeSlug(type: string) {
  return type
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Reads filters from a query string, ignoring anything unknown. */
export function parseFilters(params: { get(key: string): string | null }, items: ShopItem[]): ShopFilters {
  const category = CATEGORY_OPTIONS.find((o) => o.value === params.get("category"))?.value ?? DEFAULT_FILTERS.category;
  const sort = SORT_OPTIONS.find((o) => o.value === params.get("sort"))?.value ?? DEFAULT_FILTERS.sort;
  const rawType = params.get("type");
  const type = rawType && typesFor(items, category).some((t) => typeSlug(t) === rawType) ? rawType : null;
  return { category, type, bundles: params.get("bundles") === "1", sort };
}

/** Query string for the filters, leaving defaults out so shared URLs stay short. */
export function filtersToQuery(f: ShopFilters) {
  const q = new URLSearchParams();
  if (f.category !== DEFAULT_FILTERS.category) q.set("category", f.category);
  if (f.type) q.set("type", f.type);
  if (f.bundles) q.set("bundles", "1");
  if (f.sort !== DEFAULT_FILTERS.sort) q.set("sort", f.sort);
  return q.toString();
}

/** Product types present in a category, in catalogue order. */
export function typesFor(items: ShopItem[], category: CategoryFilter) {
  return [...new Set(items.filter((i) => category === "all" || i.category === category).map((i) => i.type))];
}

function nullsLast(a: number | null, b: number | null, dir: 1 | -1) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * dir;
}

const comparators: Record<SortKey, (a: ShopItem, b: ShopItem) => number> = {
  popular: (a, b) => b.popularity - a.popularity,
  rating: (a, b) => nullsLast(a.rating, b.rating, -1) || b.popularity - a.popularity,
  price: (a, b) => nullsLast(a.price, b.price, 1),
  value: (a, b) => nullsLast(a.unitPrice, b.unitPrice, 1),
};

/** Filters and sorts. Unavailable products always sink to the bottom. */
export function applyFilters(items: ShopItem[], f: ShopFilters) {
  const indexed = items.map((item, index) => ({ item, index }));
  return indexed
    .filter(({ item }) => f.category === "all" || item.category === f.category)
    .filter(({ item }) => !f.type || typeSlug(item.type) === f.type)
    .filter(({ item }) => !f.bundles || item.isBundle)
    .sort((a, b) => {
      if (a.item.inStock !== b.item.inStock) return a.item.inStock ? -1 : 1;
      return comparators[f.sort](a.item, b.item) || a.index - b.index;
    })
    .map(({ item }) => item);
}

export function isDefaultFilters(f: ShopFilters) {
  return filtersToQuery(f) === "";
}
