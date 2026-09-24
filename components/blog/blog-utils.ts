/**
 * Pure helpers for the blog routes: pagination, search text, topics, FAQ
 * extraction for structured data and product picks. Used by Server Components.
 */
import type { Post } from "@/lib/blog";
import { getCollection, getProduct, isInStock, products, productsIn, type Product } from "@/lib/products";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import type { ArchiveEntry, Topic } from "@/components/blog/types";

export const POSTS_PER_PAGE = 12;

export function blogPageHref(page: number) {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

export function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${site.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * The lead story shown large on /blog (newest featured post, else the newest post)
 * and everything else, which is what paginates.
 */
export function splitLead(posts: Post[]) {
  const lead = posts.find((p) => p.featured) ?? posts[0];
  return { lead, rest: lead ? posts.filter((p) => p.slug !== lead.slug) : [] };
}

export function pageCount(total: number) {
  return Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
}

export function pageSlice<T>(items: T[], page: number) {
  return items.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
}

/** Lower-cased text the client-side search matches against. */
export function searchText(post: Post) {
  return [post.title, post.excerpt, post.category, post.targetKeyword ?? "", ...post.tags].join(" ").toLowerCase();
}

export function archiveIndex(posts: Post[], accentFor: (categorySlug: string) => string): ArchiveEntry[] {
  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    categorySlug: p.categorySlug,
    accent: accentFor(p.categorySlug),
    dateLabel: formatDate(p.date, { day: "numeric", month: "short", year: "numeric" }),
    readMinutes: p.readMinutes,
    // Titles, tags and keywords keep the archive index light as the blog grows.
    search: [p.title, p.category, p.targetKeyword ?? "", ...p.tags].join(" ").toLowerCase(),
  }));
}

const ACRONYMS: Record<string, string> = { nhs: "NHS", uk: "UK", loc: "LOC", lco: "LCO", diy: "DIY" };

/** "nhs guidance" -> "NHS guidance", "curly hair" -> "Curly hair". */
export function formatTag(tag: string) {
  const words = tag
    .trim()
    .split(/\s+/)
    .map((w) => ACRONYMS[w.toLowerCase()] ?? w);
  const first = words[0] ?? "";
  if (first && first === first.toLowerCase()) words[0] = first.charAt(0).toUpperCase() + first.slice(1);
  return words.join(" ");
}

/** Most-used tags across posts, weighted into three sizes for the topic cloud. */
export function topTopics(posts: Post[], limit = 26): Topic[] {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const p of posts) {
    for (const raw of p.tags) {
      const key = raw.trim().toLowerCase();
      if (!key) continue;
      const hit = counts.get(key);
      if (hit) hit.count += 1;
      else counts.set(key, { tag: raw.trim(), count: 1 });
    }
  }
  const sorted = [...counts.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)).slice(0, limit);
  const max = sorted[0]?.count ?? 1;
  return sorted.map(({ tag, count }) => ({
    tag,
    label: formatTag(tag),
    count,
    weight: count >= max * 0.66 && count > 1 ? 3 : count >= max * 0.33 && count > 1 ? 2 : 1,
  }));
}

/* ---------- FAQ extraction (for FAQPage structured data) ---------- */

/** Markdown/MDX fragment to plain text. */
export function markdownToText(src: string) {
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/<[A-Z][A-Za-z]*\b[^>]*\/>/g, " ")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,;:!?]|$)/g, "$1$2")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*\|?\s*:?-{3,}.*$/gm, " ")
    .replace(/\|/g, " ")
    .replace(/\\([{}<>*_`[\]#|])/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const FAQ_HEADING = /^(frequently asked questions|faqs?|your questions answered|common questions)\b/i;

/**
 * Questions and answers from the post's "## Frequently asked questions" section:
 * each "### Question?" heading and the paragraphs after it, up to the next heading.
 */
export function extractFaq(body: string): { question: string; answer: string }[] {
  const out: { question: string; answer: string }[] = [];
  let inFaq = false;
  let inFence = false;
  let current: { question: string; lines: string[] } | null = null;

  const flush = () => {
    if (current) {
      const answer = markdownToText(current.lines.join("\n"));
      if (answer) out.push({ question: current.question, answer });
    }
    current = null;
  };

  for (const line of body.split(/\r?\n/)) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const depth = heading[1].length;
      const text = markdownToText(heading[2]);
      flush();
      if (depth <= 2) inFaq = FAQ_HEADING.test(text);
      else if (depth === 3 && inFaq) current = { question: text, lines: [] };
      continue;
    }
    if (inFaq && current) current.lines.push(line);
  }
  flush();
  return out;
}

/* ---------- Product picks ---------- */

function reviews(p: Product) {
  return p.variants.reduce((n, v) => n + v.reviewCount, 0);
}

/** Bundles first (that's where the value is), then the most reviewed. In stock only. */
function rank(list: Product[]) {
  return list
    .filter(isInStock)
    .sort((a, b) => Number(b.isBundle) - Number(a.isBundle) || reviews(b) - reviews(a));
}

function interleave<T>(a: T[], b: T[]) {
  const out: T[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

/** Best sellers for a blog category, used when a post names no products and on category pages. */
export function productsForCategory(categorySlug: string, limit = 4): Product[] {
  const toothpaste = rank(productsIn(getCollection("toothpaste")!));
  const haircare = rank(productsIn(getCollection("haircare")!));
  let pool: Product[];
  switch (categorySlug) {
    case "oral-care":
      pool = toothpaste;
      break;
    case "haircare":
      pool = haircare;
      break;
    case "smart-saving":
      pool = rank(productsIn(getCollection("bundles")!));
      break;
    default:
      pool = interleave(toothpaste.filter((p) => p.isBundle), haircare.filter((p) => p.isBundle));
  }
  return (pool.length ? pool : rank(products)).slice(0, limit);
}

/** Products named in the post (in stock only), topped up with category best sellers. */
export function productsForPost(post: Pick<Post, "products" | "categorySlug">, limit = 3): Product[] {
  const named = post.products.map(getProduct).filter((p): p is Product => Boolean(p && isInStock(p)));
  const picks = [...named];
  for (const p of productsForCategory(post.categorySlug, limit + named.length)) {
    if (picks.length >= limit) break;
    if (!picks.some((x) => x.slug === p.slug)) picks.push(p);
  }
  return picks.slice(0, Math.max(limit, Math.min(named.length, 4)));
}

/** The image used for social cards and structured data: the hero photo if it exists, else the lead product shot. */
export function shareImage(post: Pick<Post, "heroImage" | "products">, heroExists: boolean) {
  if (heroExists) return post.heroImage;
  const product = post.products.map(getProduct).find(Boolean);
  return product?.primary.image ?? site.ogImage;
}
