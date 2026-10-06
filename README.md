# PoundMart website

The marketing site for **PoundMart, Home of Great Value Bundles**. It exists to turn search and social traffic into Amazon sales: every page tells the story, then sends shoppers to the [PoundMart Amazon store](https://www.amazon.co.uk/stores/PoundMart/page/51710033-B61C-4A51-A8C0-6DDF028E0841).

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Motion and Lenis.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build (also validates every blog post)
npm run check:posts    # blog quality gate (frontmatter, links, components, house style)
```

## Environment variables

Set these in `.env.local` locally and in your host (e.g. Vercel project settings).

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The live domain, e.g. `https://www.yourdomain.co.uk`. Used for canonical URLs, the sitemap, Open Graph and JSON-LD. **Set this before launch.** |
| `NEXT_PUBLIC_AMAZON_ATTRIBUTION` | Optional. Query string from an **Amazon Attribution** tag, e.g. `maas=maas_adg_XXXX&ref_=aa_maas`. Appended to every Amazon link. Attribution tracks which off-Amazon traffic converts and qualifies external traffic for Amazon's **Brand Referral Bonus**. Strongly recommended. |
| `NEXT_PUBLIC_AMAZON_TAG` | Optional Amazon Associates tag, e.g. `poundmart-21`. |

Every Amazon link also fires an `amazon_click` event (to `dataLayer`, `gtag` and Plausible if installed) with the link's `placement`, so you can see which buttons drive the most outbound clicks.

## Where things live

| Path | What |
|---|---|
| `lib/site.ts` | Site config, Amazon store URLs, tracking, nav, and **verified brand facts** (the only claims copy may make). |
| `lib/products.ts` | The curated catalogue: 18 products grouped from 26 Amazon listings, with variants, value maths and styling. |
| `data/amazon-catalog.json` | Snapshot of the live listings (prices, ratings, bullets, images) taken 24 September 2026. |
| `public/products/<ASIN>/` | Product gallery (`g1…`) and A+ (`a1…`) images from the listings. |
| `public/brand/` | Logo (dark + white), cart mark, brand film + captions, family poster. |
| `content/blog/*.mdx` | Blog posts. Format, components and rules: [`content/README.md`](content/README.md). |
| `scripts/check-posts.mjs` | Blog quality gate, also used by the future daily SEO automation. |
| `components/motion/` | Animation primitives (reveals, split headlines, parallax, magnetic, marquee, tilt, count-up). |

## Updating prices and ratings

Prices, ratings and stock are a snapshot (shown on the site with a "prices checked" date). To refresh: update the numbers in `data/amazon-catalog.json`, then set `catalogCheckedAt` in `lib/site.ts`. Amazon always shows the live price at checkout.

## Adding real photography

Wherever a photo hasn't been shot yet, the site shows a branded placeholder. In development it prints the exact file path it's waiting for. Drop an image at that path in `public/` (JPG, landscape ~1600px wide unless the slot is square) and it appears automatically, no code changes needed. Blog posts without a hero photo get an auto-generated cover from their featured product; add `public/images/blog/<slug>.jpg` to replace it.

## Blog

Posts are MDX in `content/blog/` ([format and rules](content/README.md)). A post dated in the future stays hidden until that date. RSS is at `/blog/rss.xml`; every post, product, collection and category is in `/sitemap.xml`.

## Daily SEO automation

`seo-engine/` writes one new blog post every day via GitHub Actions (`.github/workflows/seo-generate.yml`, 05:00 UTC). Claude writes the article; a code quality gate then rejects anything with invented facts, prices, banned filler, broken links, a missing homepage backlink or FAQ, or a near-duplicate of an existing post. A failed post is retried once, then skipped and reported as a GitHub issue.

- **What it writes:** national topic guides (oral care, haircare, saving money, family and home) from the topic matrix in `seo-engine/data/services.json`: 27 topics × audiences × angles = 122 unique keywords (about four months of daily posts). Location pages are deliberately off: PoundMart has no local service area.
- **Facts it may state:** only the list in `seo-engine/site.config.ts` (`about`), verified against the Amazon listings. Edit that file if the business changes.
- **Every post** links back to the homepage (enforced by the gate), links to relevant product/collection pages, gets a category and featured products from its topic, and ends with the site's Amazon CTA.
- **Publishing:** by default posts collect in one rolling pull request ("SEO engine: new blog posts to review"); merging publishes them. To publish automatically instead: `gh variable set PUBLISH_MODE --body auto`.
- **Cost:** roughly $0.05 to $0.10 per post in Anthropic API usage.

One-time setup (the API key never goes in code or chat):
1. Merge the engine into `master` (scheduled workflows only run from the default branch).
2. Add the key: `gh secret set ANTHROPIC_API_KEY --repo jlindl/poundmart` (or GitHub → Settings → Secrets and variables → Actions). It needs credit at console.anthropic.com → Billing.
3. Set the live domain: `gh variable set SITE_URL --repo jlindl/poundmart --body https://www.yourdomain.co.uk`
4. Test it: `gh workflow run seo-generate.yml --repo jlindl/poundmart`

Useful commands:

```bash
npm run seo:generate -- --stats        # topics left (free)
npm run seo:generate -- --plan --all   # every upcoming keyword (free)
npm run seo:generate -- --dry-run      # write a test post to a temp folder (needs ANTHROPIC_API_KEY in .env.local)
npm run seo:check -- content/blog/<file>.mdx   # run the engine's gate on one post
```

When topics run low the engine opens a GitHub issue: add topics, audiences or angles to `seo-engine/data/services.json`. To pause, disable the "SEO generate" workflow in the Actions tab. Hand-written posts are held to `npm run check:posts`, which allows richer components (product spotlights, tables) than the automated gate.
