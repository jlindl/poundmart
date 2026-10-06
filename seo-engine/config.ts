/**
 * SEO engine configuration: the engine's tunables (model, word ranges,
 * thresholds, banned phrases, publish mode). Site-specific settings live in
 * site.config.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { site as siteConfig } from "./site.config";

/**
 * Defaults for every optional site setting, so a site.config.ts written for an
 * older engine keeps working after `install.mjs --upgrade` adds new settings.
 */
const defaults = {
  format: "mdx" as "mdx" | "md",
  ctaComponent: null as string | null,
  timeZone: "Europe/London",
  language: "en-GB" as "en-GB" | "en-US",
  postTypes: { location: true, service: true },
  categories: { location: "Local guides", service: "Guides" },
  locationPitch: "Where it fits, explain how {name} can help {audience} in and around {location}.",
  voice: [] as string[],
  rules: [] as string[],
  bannedPhrases: [] as string[],
  forbiddenPatterns: [] as { pattern: RegExp; name: string }[],
};
type Defaulted = keyof typeof defaults;
const site = {
  ...defaults,
  ...(siteConfig as Omit<typeof siteConfig, Defaulted> & Partial<typeof defaults>),
};

const ROOT = process.cwd();

// Local runs read keys from .env.local (git-ignored). Variables already set in
// the environment, e.g. GitHub Actions secrets, take precedence.
const envFile = path.join(ROOT, ".env.local");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const DEFAULT_BANNED_PHRASES = [
  "in today's fast-paced world",
  "in today's digital age",
  "in today's competitive landscape",
  "in the ever-evolving",
  "ever-changing landscape",
  "navigating the landscape",
  "navigate the complexities",
  "delve",
  "delves",
  "delving",
  "game-changer",
  "game changer",
  "unlock",
  "unlocking",
  "elevate",
  "elevating",
  "look no further",
  "supercharge",
  "revolutionise",
  "revolutionize",
  "cutting-edge",
  "seamless",
  "seamlessly",
  "leverage the power",
  "harness the power",
  "take it to the next level",
  "next level",
  "it's no secret",
  "at the end of the day",
  "a testament to",
  "tapestry",
  "embark",
  "realm",
  "robust",
  "synergy",
  "paradigm",
  "whether you're a",
  "in conclusion",
  "in summary",
  "ultimately,",
  "rest assured",
  "without further ado",
  "stand out from the crowd",
  "one-stop shop",
  "best-kept secret",
  // Claims of first-hand experience or a track record that nobody has verified.
  "our clients",
  "our customers",
  "clients tell us",
  "customers tell us",
  "we speak to",
  "we've seen",
  "we have seen",
  "in our experience",
];

export const config = {
  site: {
    ...site,
    url: (process.env.SITE_URL || site.url).replace(/\/$/, ""),
  },

  paths: {
    root: ROOT,
    engine: path.join(ROOT, "seo-engine"),
    data: path.join(ROOT, "seo-engine", "data"),
    ledger: path.join(ROOT, "seo-engine", "data", "ledger.json"),
    blog: path.join(ROOT, site.contentDir),
    logs: path.join(ROOT, "seo-engine", "logs"),
  },

  /** File extension for new posts. */
  postExtension: site.format === "mdx" ? ".mdx" : ".md",

  /** Claude settings for article generation. */
  model: {
    id: "claude-sonnet-5",
    effort: "high" as const,
    maxTokens: 16000,
    /** USD per million tokens, for the run log's cost estimate. */
    pricing: { inputPerMTok: 2, outputPerMTok: 10, cacheReadPerMTok: 0.2, cacheWritePerMTok: 2.5 },
  },

  topics: {
    /** Each place in a tier gets this many posts before the next tier starts; then the cycle repeats. */
    locationRoundSize: 3,
    /** Extra "uses" counted against secondary audiences, so primary audiences are picked first. */
    secondaryAudiencePenalty: 2,
    /** A topic that fails the gate this many times is retired. */
    maxFailuresPerTopic: 2,
  },

  /** Retries after a failed quality gate. */
  maxRetries: 1,

  article: {
    location: { minWords: 900, maxWords: 1400 },
    service: { minWords: 1200, maxWords: 1800 },
    title: { maxLength: 70 },
    metaDescription: { min: 140, max: 160 },
    excerpt: { max: 220 },
    slug: { maxLength: 70 },
    /** Links to other pages besides the contact link (blog posts or site pages). */
    minInternalLinks: 2,
    minH2: 3,
    faq: { heading: "Frequently asked questions", minQuestions: 3, maxQuestions: 5 },
    /** External links can't be verified at generation time, so they're off by default. */
    allowExternalLinks: false,
    /** Location posts must mention at least this many nearby towns from locations.json. */
    minNearbyTownMentions: 2,
    /** ...and the town name itself at least this many times in the body. */
    minLocationMentions: 3,
  },

  similarity: {
    /** Word n-gram size for shingling post bodies. */
    shingleSize: 5,
    /** Reject a post whose body shingle Jaccard with any existing post exceeds this. */
    maxBodyJaccard: 0.3,
    /** Reject a post whose title token Jaccard with any existing title exceeds this. */
    maxTitleJaccard: 0.75,
    /** Skip a topic candidate whose working title overlaps an existing title/slug this much. */
    maxTopicJaccard: 0.7,
  },

  /** Characters that must never appear in generated text. */
  forbiddenChars: [
    { char: "\u2014", name: "em dash" },
    { char: "\u2015", name: "horizontal bar" },
  ],
  /** Patterns that sneak an em dash in by another route. */
  forbiddenPatterns: [
    { pattern: / \u2013 /, name: "spaced en dash used as a dash" },
    { pattern: / -- /, name: "double hyphen used as a dash" },
    { pattern: /\S - \S/, name: "spaced hyphen used as a dash" },
    ...site.forbiddenPatterns,
  ],

  /** Case-insensitive. Matched on word boundaries against every generated field. */
  bannedPhrases: [...DEFAULT_BANNED_PHRASES, ...site.bannedPhrases],

  /** Publishing mode for the scheduled job: "pr" opens a pull request, "auto" commits to main. */
  publishMode: (process.env.PUBLISH_MODE === "auto" ? "auto" : "pr") as "pr" | "auto",

  /** GitHub issue settings for failures. */
  issues: { label: "seo-engine" },
} as const;

export type EngineConfig = typeof config;
