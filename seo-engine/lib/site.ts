/**
 * What the engine knows about the live site: existing posts (read straight
 * from the content folder) and every internal path a post may link to.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { config } from "../config";
import { loadPages, type LinkTarget } from "./data";
import { routeExists } from "./routes";

export type ExistingPost = {
  slug: string;
  title: string;
  body: string;
  type: "location" | "service" | "other";
  /** From frontmatter, when the engine wrote the post. */
  topicKey?: string;
  targetKeyword?: string;
};

export type { LinkTarget };

const POST_FILE = /\.(mdx|md)$/;

export function postFiles(dir = config.paths.blog): string[] {
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => POST_FILE.test(f)).map((f) => path.join(dir, f))
    : [];
}

/** Every post in the content folder, including hand-written ones. */
export function loadExistingPosts(): ExistingPost[] {
  return postFiles().map((file) => {
    const { data, content } = matter(fs.readFileSync(file, "utf8"));
    const type = data.type === "location" || data.type === "service" ? data.type : "other";
    return {
      slug: String(data.slug ?? path.basename(file).replace(POST_FILE, "")),
      title: String(data.title ?? ""),
      body: content,
      type,
      ...(typeof data.topicKey === "string" ? { topicKey: data.topicKey } : {}),
      ...(typeof data.targetKeyword === "string" ? { targetKeyword: data.targetKeyword } : {}),
    };
  });
}

export const postPath = (slug: string) => `${config.site.blogPath}/${slug}`;

let pagesCache: LinkTarget[] | null = null;

/** Pages from pages.json that still exist, plus the contact page and blog index. */
export function sitePages(): LinkTarget[] {
  if (pagesCache) return pagesCache;
  const pages: LinkTarget[] = [];
  const add = (p: LinkTarget) => {
    if (!pages.some((x) => x.path === p.path)) pages.push(p);
  };
  add({ path: config.site.contactPath, label: "Contact (how readers get in touch)" });
  for (const p of loadPages()) {
    if (routeExists(p.path)) add(p);
    else console.warn(`[pages] ${p.path} is in pages.json but no matching route exists; leaving it out.`);
  }
  add({ path: config.site.blogPath, label: "Blog index" });
  return (pagesCache = pages);
}

/** Every internal path that resolves to a real page (hash fragments stripped). */
export function validPaths(posts: { slug: string }[]): Set<string> {
  const strip = (p: string) => p.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return new Set(["/", ...sitePages().map((p) => strip(p.path)), ...posts.map((p) => postPath(p.slug))]);
}

/**
 * Link-list entries that point at a section ("/#services"). Each counts as its
 * own internal link, so a one-page site can meet the link minimum.
 */
export function listedSections(): Set<string> {
  return new Set(sitePages().map((p) => p.path).filter((p) => p.includes("#")));
}
