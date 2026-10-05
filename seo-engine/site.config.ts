/**
 * Everything specific to this website. The engine code reads this file and
 * never needs editing per site; topics live in data/*.json.
 *
 * Only put verifiable facts in `about`. The model is told it may state facts
 * about the business from that list and nothing else, so an empty or vague
 * list gives careful, generic articles, and an invented fact here becomes an
 * invented fact in every post.
 *
 * PoundMart notes: this is a UK brand selling on Amazon, not a local service
 * business, so location posts are switched off and every article is a
 * national topic guide. The "contact" path is the homepage, which makes the
 * quality gate require a backlink to the homepage in every article.
 */
export const site = {
  /** Business or brand name, as articles should write it. */
  name: "PoundMart",
  /** Canonical origin, no trailing slash. The SITE_URL environment variable (GitHub repo variable) overrides it. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /**
   * Where every article must link. For PoundMart this is the homepage: every
   * automated post must link back to it (the site's backlink requirement).
   */
  contactPath: "/",
  /** URL prefix for posts: a post lives at `${blogPath}/${slug}`. */
  blogPath: "/blog",
  /** Folder the site reads posts from, relative to the repo root. */
  contentDir: "content/blog",
  /** MDX: posts may use the AmazonCta component once and must compile as MDX. */
  format: "mdx" as "mdx" | "md",
  /** The store-level call to action rendered by components/blog/mdx.tsx. */
  ctaComponent: "AmazonCta" as string | null,
  /** Frontmatter `author`. */
  author: "The PoundMart Team",
  /** "Today" and post dates use this timezone. */
  timeZone: "Europe/London",
  /** Spelling and usage for every article. */
  language: "en-GB" as "en-GB" | "en-US",
  /** National topic guides only: PoundMart has no local service area. */
  postTypes: { location: false, service: true },
  /**
   * Fallback frontmatter `category` per post type. Service posts normally take
   * their category from the service's `category` in data/services.json (see
   * lib/post-file.ts), which must be one of the blog's four categories.
   */
  categories: { location: "Smart Saving", service: "Smart Saving" },

  /** Facts about the business that articles may state. Verified against the live Amazon listings. */
  about: [
    "PoundMart is a UK-based brand that sells great value multi-pack bundles of everyday essentials on Amazon UK. Its tagline is 'Home of Great Value Bundles'.",
    "PoundMart products are sold by PoundMart and dispatched by Amazon. Shoppers buy through Amazon, so delivery options, Prime eligibility and order tracking are shown by Amazon at checkout and in Your Orders.",
    "Items can be returned within 30 days through Amazon's returns process.",
    "Every bundle is packaged and quality-checked by PoundMart. Products are genuine branded stock: no knockoffs and no grey-market products.",
    "PoundMart currently sells two brands: Nice Smile flavoured toothpaste and XHC Xpert Haircare.",
    "Nice Smile toothpaste comes in 60g tubes in six flavours: Watermelon Fresh, Feelin' Grape, Peachy Clean, Berry Burst, Yummy Gummy and Candy Clean. The listings describe it as whitening toothpaste with fluoride for kids and adults, vegan, cruelty-free and enamel-safe. The fluoride ppm is not published in PoundMart's data, so readers should check the pack.",
    "Nice Smile is sold as single tubes, twin packs and multi-packs of 3, 4, 6 and 12 tubes. Bigger bundles cost less per tube.",
    "XHC Vegan No Rinse Conditioner is a 250ml leave-in conditioner for curly, afro and damaged hair, described as vegan, sulphate-free and cruelty-free, in Cherry & Almond, Dragon Fruit & Vanilla and Mango & Coconut. It is sold singly and in a 3 pack.",
    "XHC Argan Oil shampoo and conditioner come in 300ml bottles with Moroccan argan oil, described as nourishing, moisturising, vegan friendly and paraben-free. They are sold as a shampoo and conditioner set, twin packs, 3 packs and a 6 bottle stock-up.",
    "XHC Rosemary & Mint Shampoo is sold as a 3 pack of 300ml bottles, described as revitalising, vegan and cruelty-free.",
    "XHC 2-in-1 Shampoo & Conditioner Bars come in Coconut, Banana and Papaya, described as plastic-free, vegan friendly and travel-friendly, in 3 packs and 6 packs.",
  ],
  /** Who reads the blog and what they care about. */
  readers:
    "UK households who buy everyday toiletries: parents trying to get children brushing, people with curly, afro, dry or frizzy hair, students setting up on a budget, and anyone who wants to spend less on essentials without buying rubbish. They want clear, practical, honest answers they can act on today, and an easy way to find a good-value product on Amazon. Not sales talk.",
  /** Unused: location posts are off. Kept for the engine's type. */
  locationPitch: "Show how {name}'s bundles fit {audience} in and around {location}.",
  /** Extra voice notes, added to the defaults (plain, practical, no hype). */
  voice: [
    "Warm, confident and a little playful. The brand likes gentle puns (for example 'You're one in a melon', 'Brush with grape-ness'); use at most one light touch per article and never at the expense of clarity.",
    "British English and UK context: the NHS, pounds sterling, UK school terms, UK airports.",
    "Lead with the direct answer in the first paragraph, then explain.",
  ],
  /** Extra hard rules, enforced by the prompt. */
  rules: [
    "Do not state prices or price-per-unit figures: prices change on Amazon. Say bigger bundles cost less per item and let readers check the live price on Amazon.",
    "Do not claim PoundMart sells any product or brand other than Nice Smile toothpaste and XHC Xpert Haircare.",
    "Do not invent statistics, studies, survey results, awards, expert names, reviews, ratings, testimonials or customer quotes.",
    "Oral health guidance must follow the NHS: brush twice a day for about two minutes, last thing at night and at one other time; spit, don't rinse; children under 3 use a smear of toothpaste with no less than 1,000ppm fluoride; children aged 3 to 6 use a pea-sized amount with more than 1,000ppm; adults use toothpaste with 1,350 to 1,500ppm; replace a toothbrush every 3 months; see a dentist regularly. Never state Nice Smile's fluoride ppm.",
    "Whitening toothpaste removes surface stains and does not change natural tooth colour. Never promise hair growth from rosemary (the evidence is limited). Keep argan oil claims cosmetic: softness, shine, less frizz.",
    "For medical concerns, suggest a dentist, pharmacist or GP. Airline liquid rules vary by airport and change, so tell readers to check their airport's current rules.",
    "Link to at least one product page (/shop/...) or collection page (/collections/...) from the link list, where it genuinely helps the reader.",
  ],
  /** Extra banned words or phrases for this site, added to the defaults in config.ts. */
  bannedPhrases: ["delve", "tapestry", "look no further", "game-changer", "game changer"],
  /** Prices go stale on Amazon, so code keeps them out of automated posts. */
  forbiddenPatterns: [{ pattern: /£\s?\d/, name: "price in pounds" }] as { pattern: RegExp; name: string }[],
};
