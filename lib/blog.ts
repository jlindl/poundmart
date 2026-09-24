/**
 * Blog content loader. Every post is an MDX file in content/blog/<slug>.mdx
 * with YAML frontmatter. The keys are a superset of what the SEO content
 * engine writes (seo-engine/lib/post-file.ts), so automated posts drop in
 * with no mapping. Server-only (reads the filesystem).
 *
 * Frontmatter is validated at build time: a malformed post fails the build
 * rather than shipping a broken page. See content/README.md for the schema.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

export const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export const blogCategories = [
  {
    name: "Oral Care",
    slug: "oral-care",
    description: "Brushing routines, flavoured toothpaste, kids' teeth and keeping smiles bright without overspending.",
    accent: "#FF5468",
  },
  {
    name: "Haircare",
    slug: "haircare",
    description: "Leave-in conditioner, curly hair routines, argan oil, rosemary and low-waste shampoo bars, explained simply.",
    accent: "#9A6A3A",
  },
  {
    name: "Smart Saving",
    slug: "smart-saving",
    description: "How to buy everyday essentials for less: bundles, unit prices, stocking up and shopping Amazon smartly.",
    accent: "#E6B800",
  },
  {
    name: "Family & Home",
    slug: "family-home",
    description: "Bathroom organisation, travel wash bags, gifting and routines that make busy family life easier.",
    accent: "#2FB59B",
  },
] as const;

export type BlogCategory = (typeof blogCategories)[number];

export type Heading = { depth: 2 | 3; text: string; id: string };

export type Post = {
  slug: string;
  title: string;
  /** Meta description (150-160 chars). */
  description: string;
  /** Short summary for cards. */
  excerpt: string;
  /** YYYY-MM-DD */
  date: string;
  updated?: string;
  category: string;
  categorySlug: string;
  targetKeyword?: string;
  tags: string[];
  /** Product slugs from lib/products.ts to feature alongside the post. */
  products: string[];
  heroImage: string;
  heroImageAlt: string;
  author: string;
  featured: boolean;
  /** Set by the SEO engine; hand-written posts may leave these out. */
  type?: "location" | "service";
  audience?: string;
  service?: string;
  readMinutes: number;
  wordCount: number;
  headings: Heading[];
  body: string;
};

const WORDS_PER_MINUTE = 230;
const POST_FILE = /\.(mdx|md)$/;

function fail(file: string, msg: string): never {
  throw new Error(`[blog] ${file}: ${msg}`);
}

function str(data: Record<string, unknown>, key: string, file: string, required = true): string | undefined {
  const v = data[key];
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (v === undefined || v === null || v === "") {
    if (required) fail(file, `missing "${key}"`);
    return undefined;
  }
  if (typeof v !== "string") fail(file, `"${key}" must be a string`);
  return v;
}

function list(data: Record<string, unknown>, key: string, file: string): string[] {
  const v = data[key];
  if (v === undefined || v === null) return [];
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) fail(file, `"${key}" must be a list of strings`);
  return v as string[];
}

export function categorySlug(name: string) {
  return new GithubSlugger().slug(name.replace(/&/g, "and")).replace(/-and-/g, "-");
}

function countWords(src: string): number {
  return src
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** h2/h3 headings with the same ids rehype-slug will generate. */
function extractHeadings(src: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let inFence = false;
  for (const line of src.split(/\r?\n/)) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = m[2].replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").trim();
    out.push({ depth: m[1].length as 2 | 3, text, id: slugger.slug(text) });
  }
  return out;
}

function parsePost(file: string): Post {
  const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
  const fileSlug = file.replace(POST_FILE, "");
  const slug = str(data, "slug", file, false) ?? fileSlug;
  if (slug !== fileSlug) fail(file, `slug "${slug}" must match the filename`);

  const date = str(data, "date", file)!;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(file, `"date" must be YYYY-MM-DD`);

  const type = str(data, "type", file, false);
  if (type !== undefined && type !== "location" && type !== "service") fail(file, `"type" must be "location" or "service"`);

  const category = str(data, "category", file, false) ?? "Smart Saving";
  const catSlug = categorySlug(category);
  if (!blogCategories.some((c) => c.slug === catSlug)) {
    fail(file, `unknown category "${category}". Use one of: ${blogCategories.map((c) => c.name).join(", ")}`);
  }

  const wordCount = countWords(content);
  return {
    slug,
    title: str(data, "title", file)!,
    description: str(data, "description", file)!,
    excerpt: str(data, "excerpt", file, false) ?? str(data, "description", file)!,
    date,
    updated: str(data, "updated", file, false),
    category: blogCategories.find((c) => c.slug === catSlug)!.name,
    categorySlug: catSlug,
    targetKeyword: str(data, "targetKeyword", file, false),
    tags: list(data, "tags", file),
    products: list(data, "products", file),
    heroImage: str(data, "heroImage", file, false) ?? `/images/blog/${slug}.jpg`,
    heroImageAlt: str(data, "heroImageAlt", file, false) ?? str(data, "title", file)!,
    author: str(data, "author", file, false) ?? "The PoundMart Team",
    featured: data.featured === true,
    type: type as Post["type"],
    audience: str(data, "audience", file, false),
    service: str(data, "service", file, false),
    readMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
    wordCount,
    headings: extractHeadings(content),
    body: content,
  };
}

let cache: Post[] | null = null;

/** All published posts, newest first. Posts dated in the future are held back. */
export function getAllPosts(): Post[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs.existsSync(BLOG_DIR) ? fs.readdirSync(BLOG_DIR).filter((f) => POST_FILE.test(f)) : [];
  const today = new Date().toISOString().slice(0, 10);
  cache = files
    .map(parsePost)
    .filter((p) => p.date <= today)
    .sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));
  return cache;
}

export function getPost(slug: string) {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getCategory(slug: string) {
  return blogCategories.find((c) => c.slug === slug);
}

export function postsInCategory(slug: string) {
  return getAllPosts().filter((p) => p.categorySlug === slug);
}

export function featuredPosts(limit = 3) {
  const all = getAllPosts();
  const featured = all.filter((p) => p.featured);
  return [...featured, ...all.filter((p) => !p.featured)].slice(0, limit);
}

/** Posts that mention a product, for product pages. */
export function postsForProduct(productSlug: string, limit = 3) {
  return getAllPosts()
    .filter((p) => p.products.includes(productSlug))
    .slice(0, limit);
}

/** Related posts: shared products and tags score highest, then category, then recency. */
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      p,
      score:
        p.products.filter((x) => post.products.includes(x)).length * 3 +
        p.tags.filter((t) => post.tags.includes(t)).length * 2 +
        (p.categorySlug === post.categorySlug ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, limit)
    .map(({ p }) => p);
}
