# Blog content

Every post is one MDX file: `content/blog/<slug>.mdx`. The filename is the URL:
`content/blog/how-to-choose-kids-toothpaste.mdx` → `/blog/how-to-choose-kids-toothpaste`.

The loader (`lib/blog.ts`) validates frontmatter at build time, so a broken post
fails the build instead of shipping. Posts dated in the future are held back until
that date (handy for scheduling).

## Frontmatter

```yaml
---
title: "How to Choose a Kids' Toothpaste They'll Actually Use"   # required, ≤ 65 chars ideally
slug: how-to-choose-kids-toothpaste                              # optional, must match filename
description: "Meta description, 140-160 characters, includes the target keyword."  # required
excerpt: "One or two sentences for blog cards."                     # optional (falls back to description)
date: 2026-09-01                                                  # required, YYYY-MM-DD
updated: 2026-09-20                                               # optional
category: Oral Care            # required: Oral Care | Haircare | Smart Saving | Family & Home
targetKeyword: kids toothpaste                                    # optional but recommended
tags: [kids, flavoured toothpaste, brushing routine]              # optional
products: [nice-smile-3-pack-berry-gummy-candy]                   # optional product slugs (lib/products.ts)
heroImage: /images/blog/how-to-choose-kids-toothpaste.jpg         # optional; defaults to /images/blog/<slug>.jpg
heroImageAlt: "Child brushing teeth with a pink toothbrush"       # optional
author: The PoundMart Team                                        # optional
featured: false                                                   # optional, pins to the top of /blog
---
```

Keys written by the SEO content engine (`type`, `audience`, `service`, `location`,
`region`, `topicKey`) are accepted and ignored where unused.

**Images:** if the hero image file doesn't exist yet, the site shows a branded
placeholder that prints the expected path. Drop a 1600×1000 JPG at that path and
it appears automatically.

## Body

Standard Markdown (GFM tables supported). Start with an intro paragraph, then `##`
sections (these build the table of contents), `###` for sub-sections.

Components you can use (and nothing else, no `import`/`export`):

```mdx
<ProductSpotlight slug="nice-smile-12-pack-toothpaste-bundle" />
<ProductSpotlight slug="xhc-no-rinse-conditioner-3-pack" note="Our pick for curls" />

<Callout type="tip" title="Optional title">Short, useful aside.</Callout>   {/* type: tip | note | warning */}

<AmazonCta />
<AmazonCta title="Custom headline" text="Custom line." button="Button label" />
```

MDX gotchas: escape a literal `<` as `&lt;` and `{` as `\{` in prose.

## Linking rules (SEO)

Every post must include:
- At least one link to the homepage: `[PoundMart](/)` or similar natural anchor.
- At least one link to a product page (`/shop/<product-slug>`) or collection
  (`/collections/toothpaste`, `/collections/haircare`, `/collections/bundles`, `/collections/new-arrivals`).
- One or two links to related posts (`/blog/<slug>`) where relevant.
- Exactly one `<AmazonCta />` near the end, and at most two `<ProductSpotlight />`.

## Facts

Only state product facts that appear on the Amazon listings (see `lib/products.ts`
and `data/amazon-catalog.json`). Verified brand facts: sold by PoundMart, dispatched
by Amazon, 30-day returns through Amazon, UK-based, packaged and quality-checked by
PoundMart, genuine branded products. Never invent reviews, testimonials, statistics,
fluoride ppm values or medical claims. Health guidance should follow the NHS and be
framed generally ("the NHS recommends…").
