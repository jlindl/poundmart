/**
 * Route discovery for Next.js sites (App Router `app/` or `src/app/`, and
 * Pages Router `pages/` or `src/pages/`), so pages.json can be checked
 * against pages that really exist. Other frameworks return null and the
 * check is skipped.
 */
import fs from "node:fs";
import path from "node:path";
import { config } from "../config";

const PAGE_FILE = /^page\.(tsx|ts|jsx|js|mdx|md)$/;
const PAGES_ROUTER_FILE = /\.(tsx|ts|jsx|js|mdx|md)$/;

function segmentPattern(seg: string): string {
  if (/^\[\[\.\.\.\w+\]\]$/.test(seg)) return "(?:/.*)?";
  if (/^\[\.\.\.\w+\]$/.test(seg)) return "/.+";
  if (/^\[\w+\]$/.test(seg)) return "/[^/]+";
  return `/${seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
}

function toRegex(segments: string[]): RegExp {
  return new RegExp(`^${segments.map(segmentPattern).join("") || ""}/?$`);
}

function walkApp(dir: string, segments: string[], out: RegExp[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && PAGE_FILE.test(entry.name)) out.push(toRegex(segments));
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    // Private folders, parallel-route slots and intercepting routes aren't URLs of their own.
    if (name.startsWith("_") || name.startsWith("@") || name.startsWith("(.")) continue;
    // Route groups don't add a URL segment.
    const next = /^\(.+\)$/.test(name) ? segments : [...segments, name];
    walkApp(path.join(dir, name), next, out);
  }
}

function walkPages(dir: string, segments: string[], out: RegExp[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = entry.name;
    if (entry.isDirectory()) {
      if (segments.length === 0 && name === "api") continue;
      walkPages(path.join(dir, name), [...segments, name], out);
    } else if (PAGES_ROUTER_FILE.test(name) && !name.startsWith("_")) {
      const base = name.replace(PAGES_ROUTER_FILE, "");
      out.push(toRegex(base === "index" ? segments : [...segments, base]));
    }
  }
}

let cached: RegExp[] | null | undefined;

/** Patterns for every page route in the repo, or null if this isn't a Next.js site. */
export function discoverRoutes(): RegExp[] | null {
  if (cached !== undefined) return cached;
  const root = config.paths.root;
  const out: RegExp[] = [];
  let found = false;
  for (const rel of ["app", "src/app"]) {
    const dir = path.join(root, rel);
    if (fs.existsSync(dir)) {
      found = true;
      walkApp(dir, [], out);
    }
  }
  for (const rel of ["pages", "src/pages"]) {
    const dir = path.join(root, rel);
    if (fs.existsSync(dir)) {
      found = true;
      walkPages(dir, [], out);
    }
  }
  cached = found ? out : null;
  return cached;
}

/** True if the path matches a discovered route, or if routes can't be discovered. */
export function routeExists(pathname: string): boolean {
  const routes = discoverRoutes();
  if (!routes) return true;
  const p = pathname.split(/[?#]/)[0] || "/";
  return routes.some((r) => r.test(p));
}
