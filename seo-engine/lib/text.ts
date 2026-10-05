/** Small text helpers shared by topic picking and the quality gate. */

const STOPWORDS = new Set(
  "a an and are as at be but by can do for from get how in into is it its more of on or our the their this to what when where why with your you".split(" "),
);

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Lowercase, straighten quotes, strip punctuation, collapse whitespace. */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\p{L}\p{N}'\s-]/gu, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Content tokens (stopwords removed), for title/topic comparison. */
export function contentTokens(s: string): Set<string> {
  return new Set(normalise(s).split(" ").filter((t) => t && !STOPWORDS.has(t)));
}

export function jaccard<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/** Strip MDX/markdown syntax down to plain prose. */
export function plainText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`>]/g, " ");
}

/** Word n-gram shingles of a body, for near-duplicate detection. */
export function shingles(mdx: string, size: number): Set<string> {
  const words = normalise(plainText(mdx)).split(" ").filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + size <= words.length; i++) out.add(words.slice(i, i + size).join(" "));
  return out;
}

/** Fill {placeholders} from a record. Unknown keys are left as-is. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}

/** Deterministic 32-bit FNV-1a hash, for stable tie-breaking. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Today's date in a timezone, as YYYY-MM-DD. */
export function today(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

/** Words in a markdown/MDX body, ignoring syntax. */
export function countWords(mdx: string): number {
  return mdx
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}
