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

Posts are MDX with frontmatter compatible with the `seo-content-engine` automation. A post dated in the future stays hidden until that date. RSS is at `/blog/rss.xml`; every post, product, collection and category is in `/sitemap.xml`.
