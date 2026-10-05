/**
 * The quality gate. Pure code: every rule here is checked mechanically and a
 * post that fails any of them is rejected. Failure messages are written to be
 * fed straight back to the model on a retry.
 */
import { config } from "../config";
import type { Article } from "./claude";
import type { ExistingPost } from "./site";
import { contentTokens, countWords, escapeRegExp, jaccard, normalise, plainText, shingles } from "./text";

/** The parts of a topic the gate needs. Any `Topic` fits; so does a hand-written post. */
export type GateTopic =
  | { type: "location"; location: { name: string; nearby: string[] } }
  | { type: "service" };

export type GateContext = {
  /** Posts the new one must not duplicate (existing site posts plus earlier posts from this run). */
  existing: ExistingPost[];
  /** Slugs already used, including ones recorded in the ledger but not yet merged. */
  takenSlugs: Set<string>;
  /** Internal paths that resolve to real pages. */
  validPaths: Set<string>;
  /** Section links from the link list ("/#services"), each counted as a separate link. */
  sections?: Set<string>;
};

export type GateResult = {
  pass: boolean;
  failures: string[];
  stats: {
    words: number;
    metaLength: number;
    internalLinks: string[];
    contactLinks: number;
    faqQuestions: number;
    maxBodySimilarity: { slug: string; score: number } | null;
  };
};

const { site } = config;
const COMPONENT = site.format === "mdx" && site.ctaComponent ? site.ctaComponent : null;
const ALLOWED_COMPONENT = COMPONENT ? new RegExp(`<${escapeRegExp(COMPONENT)}\\s*/>`, "g") : null;
const LINK_RE = /\[([^\]]+)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;

/** Every text field the model produced, for rules that apply everywhere. */
function textFields(a: Article): [string, string][] {
  return [
    ["title", a.title],
    ["slug", a.slug],
    ["metaDescription", a.metaDescription],
    ["excerpt", a.excerpt],
    ["targetKeyword", a.targetKeyword],
    ["body", a.body],
  ];
}

export function findForbiddenText(fields: [string, string][]): string[] {
  const failures: string[] = [];
  for (const [name, value] of fields) {
    for (const { char, name: what } of config.forbiddenChars) {
      if (value.includes(char)) failures.push(`${name} contains an ${what} ("${char}"). Rewrite those sentences with commas, colons, full stops or brackets.`);
    }
    for (const { pattern, name: what } of config.forbiddenPatterns) {
      if (pattern.test(value)) failures.push(`${name} contains a ${what}. Rewrite those sentences without it.`);
    }
    const straight = value.replace(/[\u2018\u2019]/g, "'");
    const hits = config.bannedPhrases.filter((p) =>
      // Plurals count too: "free quote" also catches "free quotes".
      new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(p)}(?:e?s)?(?![\\p{L}\\p{N}])`, "iu").test(straight),
    );
    if (hits.length) failures.push(`${name} uses banned phrase(s): ${hits.map((h) => `"${h}"`).join(", ")}.`);
  }
  return failures;
}

/** Root-relative href with the site origin removed, or null if it is external. */
function localHref(href: string): string | null {
  let h = href.trim();
  if (h.startsWith(site.url)) h = h.slice(site.url.length) || "/";
  return h.startsWith("/") ? h : null;
}

/** Path part of a local href: no query or fragment, no trailing slash. */
function pathOf(h: string): string {
  return h.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
}

/** "/#services" or "/services#pricing" for a local href with a fragment, else null. */
function sectionKey(h: string): string | null {
  const i = h.indexOf("#");
  if (i === -1 || i === h.length - 1) return null;
  return `${pathOf(h)}#${h.slice(i + 1)}`;
}

/** Does this href point at the contact page (or contact section, when contactPath has a #fragment)? */
function isContactHref(h: string): boolean {
  const target = site.contactPath;
  if (target.includes("#")) {
    const [tPath, tHash] = target.split("#");
    const hash = h.includes("#") ? h.slice(h.indexOf("#") + 1) : "";
    return pathOf(h) === (pathOf(tPath || "/")) && hash === tHash;
  }
  return pathOf(h) === pathOf(target);
}

function blocks(body: string): string[] {
  return body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
}

/** Checks that the body is plain markdown plus the one allowed component, then that it compiles. */
async function checkMarkup(body: string): Promise<string[]> {
  const failures: string[] = [];
  const withoutAllowed = ALLOWED_COMPONENT ? body.replace(ALLOWED_COMPONENT, "") : body;
  const allowedNote = COMPONENT ? ` other than <${COMPONENT} />` : "";
  if (/^\s*(import|export)\s/m.test(body)) failures.push("body contains an import or export statement. Remove it.");
  if (/[{}]/.test(body)) failures.push("body contains curly braces. Remove them.");
  if (/<!--/.test(body)) failures.push("body contains an HTML comment. Remove it.");
  if (/<[A-Za-z/!]/.test(withoutAllowed)) failures.push(`body contains an HTML tag or component${allowedNote}. Use plain markdown only.`);
  if (ALLOWED_COMPONENT && (body.match(ALLOWED_COMPONENT) ?? []).length > 1) failures.push(`body uses <${COMPONENT} /> more than once. Use it at most once.`);
  if (/^```/m.test(body)) failures.push("body contains a code block. Remove it.");
  if (/!\[[^\]]*\]\(/.test(body)) failures.push("body contains an image. Remove it.");
  if (/^\s*\|.*\|\s*$/m.test(body)) failures.push("body contains a table. Use a list instead.");
  if (failures.length === 0 && site.format === "mdx") {
    try {
      // Loaded lazily so plain-Markdown sites don't need the MDX compiler installed.
      const { compile } = await import("@mdx-js/mdx");
      await compile(body);
    } catch (e) {
      failures.push(`body is not valid MDX: ${(e as Error).message.split("\n")[0]}`);
    }
  }
  return failures;
}

export async function runGate(a: Article, topic: GateTopic, ctx: GateContext): Promise<GateResult> {
  const failures: string[] = [];
  const range = topic.type === "location" ? config.article.location : config.article.service;
  const rules = config.article;

  // Dashes and banned phrases, everywhere.
  failures.push(...findForbiddenText(textFields(a)));

  // Word count.
  const words = countWords(a.body);
  if (words < range.minWords || words > range.maxWords) {
    failures.push(`body is ${words} words; it must be ${range.minWords} to ${range.maxWords}.`);
  }

  // Meta description and excerpt.
  const metaLength = a.metaDescription.trim().length;
  if (metaLength < rules.metaDescription.min || metaLength > rules.metaDescription.max) {
    failures.push(`metaDescription is ${metaLength} characters; it must be ${rules.metaDescription.min} to ${rules.metaDescription.max}.`);
  }
  if (!a.excerpt.trim() || a.excerpt.length > rules.excerpt.max) {
    failures.push(`excerpt must be 1 to ${rules.excerpt.max} characters (it is ${a.excerpt.length}).`);
  }

  // Title length, slug and title uniqueness.
  if (a.title.length > rules.title.maxLength) {
    failures.push(`title is ${a.title.length} characters; the maximum is ${rules.title.maxLength}.`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug)) failures.push(`slug "${a.slug}" must be lowercase words separated by single hyphens.`);
  if (a.slug.length > rules.slug.maxLength) failures.push(`slug is ${a.slug.length} characters; the maximum is ${rules.slug.maxLength}.`);
  if (ctx.takenSlugs.has(a.slug)) failures.push(`slug "${a.slug}" is already used by another post. Choose a different title and slug.`);
  const titleTokens = contentTokens(a.title);
  for (const p of ctx.existing) {
    if (normalise(p.title) === normalise(a.title)) {
      failures.push(`title duplicates the existing post "${p.title}".`);
    } else if (jaccard(titleTokens, contentTokens(p.title)) > config.similarity.maxTitleJaccard) {
      failures.push(`title is too similar to the existing post "${p.title}". Take a clearly different angle.`);
    }
  }

  // Target keyword placement.
  const kw = normalise(a.targetKeyword);
  const has = (s: string) => ` ${normalise(s)} `.includes(` ${kw} `);
  const bodyBlocks = blocks(a.body);
  const firstParagraph = bodyBlocks.find((b) => !b.startsWith("#") && !b.startsWith("<")) ?? "";
  const h2s = a.body.split("\n").filter((l) => /^##\s/.test(l));
  if (!kw) failures.push("targetKeyword is empty.");
  else {
    if (!has(a.title)) failures.push(`title must contain the target keyword "${a.targetKeyword}" exactly.`);
    if (!has(plainText(firstParagraph))) failures.push(`the first paragraph must contain the target keyword "${a.targetKeyword}" exactly.`);
    if (!h2s.some(has)) failures.push(`at least one "## " heading must contain the target keyword "${a.targetKeyword}" exactly.`);
    if (!has(a.metaDescription)) failures.push(`metaDescription must contain the target keyword "${a.targetKeyword}" exactly.`);
  }

  // A body cut off mid-sentence usually means a straight double quote ended the JSON string early.
  const lastLine = a.body.trim().split(/\r?\n/).at(-1) ?? "";
  if (!/[.!?)'"\u2019\u201d*]$/.test(lastLine.trim())) {
    failures.push(
      `body is cut off mid-sentence (it ends with "${lastLine.trim().slice(-40)}"). This happens when a straight double quotation mark ends the text early: use single quotation marks ('like this') for all quotes, and write the full article again.`,
    );
  }

  // Structure: headings and FAQ.
  if (/^#\s/m.test(a.body)) failures.push('body must not use "# " headings; start sections at "## ".');
  const faqIndex = h2s.findIndex((h) => normalise(h).startsWith(normalise(rules.faq.heading)));
  if (h2s.length - (faqIndex === -1 ? 0 : 1) < rules.minH2) {
    failures.push(`body needs at least ${rules.minH2} "## " sections before the FAQ.`);
  }
  let faqQuestions = 0;
  if (faqIndex === -1) {
    failures.push(`body must end with a "## ${rules.faq.heading}" section.`);
  } else if (faqIndex !== h2s.length - 1) {
    failures.push(`the "## ${rules.faq.heading}" section must be the last section.`);
  } else {
    const faqText = a.body.slice(a.body.lastIndexOf(h2s[faqIndex]));
    const questions = faqText.split("\n").filter((l) => /^###\s/.test(l));
    faqQuestions = questions.length;
    if (faqQuestions < rules.faq.minQuestions || faqQuestions > rules.faq.maxQuestions) {
      failures.push(`the FAQ has ${faqQuestions} questions; it needs ${rules.faq.minQuestions} to ${rules.faq.maxQuestions}, each as a "### " heading.`);
    }
    if (questions.some((q) => !q.trim().endsWith("?"))) failures.push("every FAQ question heading must end with a question mark.");
  }

  // Links.
  const internal = new Set<string>();
  let contactLinks = 0;
  for (const m of a.body.matchAll(LINK_RE)) {
    const href = m[2];
    if (href.startsWith("#")) {
      failures.push(`link "${href}" points at a section of this post. Link only to paths from the link list.`);
      continue;
    }
    const local = localHref(href);
    if (local === null) {
      if (!rules.allowExternalLinks) failures.push(`external link "${href}" is not allowed. Link only to paths from the link list.`);
      continue;
    }
    if (isContactHref(local)) {
      contactLinks++;
      continue;
    }
    const path = pathOf(local);
    if (!ctx.validPaths.has(path)) {
      failures.push(`link "${href}" does not resolve to a real page. Use only paths from the link list.`);
      continue;
    }
    // A listed section ("/#services") is its own link target; other fragments count as their page.
    const section = sectionKey(local);
    const listed = section !== null && [...(ctx.sections ?? [])].some((s) => sectionKey(s) === section);
    internal.add(listed ? section : path);
  }
  if (contactLinks === 0) failures.push(`body must include at least one contextual link to ${site.contactPath}.`);
  if (internal.size < rules.minInternalLinks) {
    failures.push(`body has ${internal.size} internal link(s) to other pages; it needs at least ${rules.minInternalLinks} (blog posts or site pages from the link list, not counting ${site.contactPath}).`);
  }

  // Local specificity for location posts.
  if (topic.type === "location") {
    const prose = ` ${normalise(plainText(a.body))} `;
    const count = (name: string) => prose.split(` ${normalise(name)} `).length - 1;
    const townMentions = count(topic.location.name);
    if (townMentions < rules.minLocationMentions) {
      failures.push(`body mentions ${topic.location.name} ${townMentions} time(s); it needs at least ${rules.minLocationMentions} and must be specific to the place.`);
    }
    const nearby = topic.location.nearby.filter((n) => count(n) > 0);
    if (nearby.length < rules.minNearbyTownMentions) {
      failures.push(`body names ${nearby.length} nearby town(s); it needs at least ${rules.minNearbyTownMentions} of: ${topic.location.nearby.join(", ")}.`);
    }
  }

  // Near-duplicate content.
  const mine = shingles(a.body, config.similarity.shingleSize);
  let maxBodySimilarity: GateResult["stats"]["maxBodySimilarity"] = null;
  for (const p of ctx.existing) {
    const score = jaccard(mine, shingles(p.body, config.similarity.shingleSize));
    if (!maxBodySimilarity || score > maxBodySimilarity.score) maxBodySimilarity = { slug: p.slug, score };
    if (score > config.similarity.maxBodyJaccard) {
      failures.push(`body is too similar to the existing post "${p.title}" (similarity ${score.toFixed(2)}, limit ${config.similarity.maxBodyJaccard}). Write it fresh with a different structure and examples.`);
    }
  }

  // Markup safety (and MDX validity).
  failures.push(...(await checkMarkup(a.body)));

  return {
    pass: failures.length === 0,
    failures,
    stats: { words, metaLength, internalLinks: [...internal], contactLinks, faqQuestions, maxBodySimilarity },
  };
}
