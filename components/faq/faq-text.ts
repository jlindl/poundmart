/**
 * FAQ answers are plain strings with Markdown-style links: "[label](href)".
 * These helpers are pure so both the server (JSON-LD) and the client
 * (rendering + search highlighting) can use them.
 */

export type FaqItem = {
  /** Stable, URL-safe id used for deep links (#id). Don't change once published. */
  id: string;
  question: string;
  /** Paragraphs. Links use [label](href); internal hrefs start with "/". */
  answer: string[];
};

export type FaqGroupId = "ordering" | "returns" | "products" | "bundles" | "about";

export type FaqGroup = {
  id: FaqGroupId;
  title: string;
  blurb: string;
  items: FaqItem[];
};

export type RichPart = { type: "text"; text: string } | { type: "link"; text: string; href: string };

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Splits a paragraph into text and link parts. */
export function parseRich(paragraph: string): RichPart[] {
  const parts: RichPart[] = [];
  let last = 0;
  for (const m of paragraph.matchAll(LINK)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ type: "text", text: paragraph.slice(last, i) });
    parts.push({ type: "link", text: m[1], href: m[2] });
    last = i + m[0].length;
  }
  if (last < paragraph.length) parts.push({ type: "text", text: paragraph.slice(last) });
  return parts;
}

/** Paragraph with link markup removed (labels kept). */
export function plainText(paragraph: string) {
  return paragraph.replace(LINK, "$1");
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Answer as simple HTML (paragraphs + absolute links) for FAQPage structured data. */
export function answerHtml(answer: string[], baseUrl: string) {
  return answer
    .map((p) => {
      const inner = parseRich(p)
        .map((part) =>
          part.type === "text"
            ? escapeHtml(part.text)
            : `<a href="${escapeHtml(part.href.startsWith("/") ? `${baseUrl}${part.href}` : part.href)}">${escapeHtml(part.text)}</a>`,
        )
        .join("");
      return `<p>${inner}</p>`;
    })
    .join("");
}

/** Lower-cased search terms (2+ characters) with curly quotes normalised. */
export function searchTerms(query: string) {
  return normalise(query)
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function normalise(s: string) {
  return s.toLowerCase().replace(/[‘’]/g, "'");
}

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
