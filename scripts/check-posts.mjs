#!/usr/bin/env node
/**
 * Blog quality gate. Validates posts in content/blog against content/README.md.
 *
 *   node scripts/check-posts.mjs                 # all posts
 *   node scripts/check-posts.mjs a.mdx b.mdx     # specific files (names or paths)
 *   node scripts/check-posts.mjs --strict        # unknown /blog/ links are errors, not warnings
 *
 * Exits 1 if any post has errors.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

const ROOT = process.cwd();
const BLOG = path.join(ROOT, "content", "blog");
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const targets = args.filter((a) => !a.startsWith("--"));

const CATEGORIES = ["Oral Care", "Haircare", "Smart Saving", "Family & Home"];
const COLLECTIONS = ["toothpaste", "haircare", "bundles", "new-arrivals"];
const STATIC_ROUTES = ["/", "/shop", "/blog", "/about", "/faq"];
const productSlugs = [...fs.readFileSync(path.join(ROOT, "lib", "products.ts"), "utf8").matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);
const blogCats = ["oral-care", "haircare", "smart-saving", "family-home"];
const existingPosts = fs.existsSync(BLOG) ? fs.readdirSync(BLOG).filter((f) => /\.mdx?$/.test(f)).map((f) => f.replace(/\.mdx?$/, "")) : [];
const ALLOWED_COMPONENTS = ["AmazonCta", "ProductSpotlight", "Callout"];
const BANNED = [
  /—/, // em dash
  /\s–\s/, // spaced en dash used as a dash
  /\bdelve\b/i,
  /\bin today's (fast-paced|busy) world\b/i,
  /\blook no further\b/i,
  /\bgame[- ]changer\b/i,
  /\bunlock the (power|secret)/i,
  /\bnavigat(e|ing) the (world|landscape)\b/i,
  /\btapestry\b/i,
  /\bit's important to note\b/i,
  /\bour customers (say|love|tell)\b/i,
  /\bin our experience\b/i,
];

const files = (targets.length ? targets : existingPosts.map((s) => s + ".mdx")).map((f) =>
  fs.existsSync(f) ? f : path.join(BLOG, path.basename(f).endsWith(".mdx") || path.basename(f).endsWith(".md") ? path.basename(f) : path.basename(f) + ".mdx"),
);

let failed = 0;
for (const file of files) {
  const errors = [];
  const warnings = [];
  const name = path.basename(file);
  if (!fs.existsSync(file)) {
    console.log(`✗ ${name}\n    - file not found`);
    failed++;
    continue;
  }
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const slug = name.replace(/\.mdx?$/, "");

  // Frontmatter
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
  if (!data.title) errors.push('missing "title"');
  else if (data.title.length > 70) warnings.push(`title is ${data.title.length} chars (aim for ≤ 65)`);
  if (!data.description) errors.push('missing "description"');
  else if (data.description.length < 120 || data.description.length > 165) warnings.push(`description is ${data.description.length} chars (aim for 140-160)`);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('"date" must be YYYY-MM-DD');
  if (data.slug && data.slug !== slug) errors.push(`slug "${data.slug}" must match filename`);
  if (!CATEGORIES.includes(data.category)) errors.push(`category must be one of ${CATEGORIES.join(", ")}`);
  for (const p of data.products ?? []) if (!productSlugs.includes(p)) errors.push(`unknown product slug in frontmatter: ${p}`);
  if (data.targetKeyword) {
    const kw = String(data.targetKeyword).toLowerCase();
    const first = content.split(/\s+/).slice(0, 120).join(" ").toLowerCase();
    const words = kw.split(/\s+/).filter((w) => w.length > 3);
    if (!words.every((w) => first.includes(w.replace(/s$/, "")))) warnings.push(`target keyword "${kw}" not clearly in the first ~100 words`);
  }

  // Body structure
  const words = content.replace(/<[^>]+>/g, " ").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").split(/\s+/).filter(Boolean).length;
  if (words < 1100) errors.push(`only ${words} words (minimum 1100)`);
  const h2 = (content.match(/^## /gm) ?? []).length;
  if (h2 < 4) errors.push(`only ${h2} "##" sections (minimum 4)`);
  if (!/^## Frequently asked questions\s*$/m.test(content)) errors.push('missing "## Frequently asked questions" section');
  else {
    const faq = content.split(/^## Frequently asked questions\s*$/m)[1] ?? "";
    const qs = (faq.match(/^### .+\?\s*$/gm) ?? []).length;
    if (qs < 3) errors.push(`FAQ has ${qs} "### question?" items (minimum 3)`);
  }
  if (/^# /m.test(content)) errors.push('don\'t use "#" (h1) in the body; the title is the h1');

  // Components
  const comps = [...content.matchAll(/<([A-Z][A-Za-z]+)/g)].map((m) => m[1]);
  for (const c of comps) if (!ALLOWED_COMPONENTS.includes(c)) errors.push(`component <${c}> is not allowed`);
  const ctas = comps.filter((c) => c === "AmazonCta").length;
  // Posts written by the SEO engine (they carry a topicKey) may omit the CTA: the article template always ends with one.
  const automated = Boolean(data.topicKey);
  if (automated ? ctas > 1 : ctas !== 1) errors.push(`needs ${automated ? "at most" : "exactly"} one <AmazonCta /> (found ${ctas})`);
  const spots = [...content.matchAll(/<ProductSpotlight\s+slug="([^"]+)"/g)].map((m) => m[1]);
  if (spots.length > 2) errors.push(`at most two <ProductSpotlight /> (found ${spots.length})`);
  for (const s of spots) if (!productSlugs.includes(s)) errors.push(`<ProductSpotlight slug="${s}"> is not a product`);
  if (/^\s*(import|export)\s/m.test(content)) errors.push("import/export statements are not allowed");

  // Links
  const links = [...content.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]);
  if (!links.some((l) => l === "/")) errors.push("no link to the homepage [..](/)");
  const commerce = links.filter((l) => l.startsWith("/shop/") || l.startsWith("/collections/") || l === "/shop");
  if (commerce.length < 1) (automated ? warnings : errors).push("no link to a product (/shop/<slug>) or collection (/collections/<slug>)");
  for (const l of links) {
    if (!l.startsWith("/")) continue;
    const clean = l.split("#")[0].replace(/\/$/, "") || "/";
    if (STATIC_ROUTES.includes(clean)) continue;
    const [, section, a, b] = clean.split("/");
    if (section === "shop" && productSlugs.includes(a) && !b) continue;
    if (section === "collections" && COLLECTIONS.includes(a) && !b) continue;
    if (section === "blog" && a === "category" && blogCats.includes(b)) continue;
    if (section === "blog" && a && !b) {
      if (a === slug) warnings.push(`links to itself: ${l}`);
      else if (!existingPosts.includes(a)) (strict ? errors : warnings).push(`blog link to a post that doesn't exist (yet): ${l}`);
      continue;
    }
    errors.push(`broken internal link: ${l}`);
  }

  // House style
  for (const re of BANNED) {
    const m = content.match(re) ?? String(data.title ?? "").match(re) ?? String(data.description ?? "").match(re);
    if (m) errors.push(`house style: avoid "${m[0].trim() || "em dash"}"`);
  }

  // MDX must compile
  try {
    await compile(content, { remarkPlugins: [remarkGfm] });
  } catch (e) {
    errors.push(`MDX does not compile: ${String(e.message ?? e).split("\n")[0]}`);
  }

  if (errors.length) failed++;
  const mark = errors.length ? "✗" : "✓";
  console.log(`${mark} ${name}  (${words} words, ${h2} sections)`);
  for (const e of errors) console.log(`    ERROR  ${e}`);
  for (const w of warnings) console.log(`    warn   ${w}`);
}

console.log(`\n${files.length - failed}/${files.length} posts pass${failed ? `; ${failed} with errors` : ""}.`);
process.exit(failed ? 1 : 0);
