# SEO engine

Writes blog posts for this site on a schedule:
- **location posts** about a place the business serves, for example "boiler repair in Chorley"
- **service posts** about one service for one kind of customer

Every post goes through code-based checks before it's saved, and every one links to the contact page. It runs on GitHub Actions ([seo-generate.yml](../.github/workflows/seo-generate.yml)) and publishes articles only.

## Files

| File | What it is |
|---|---|
| [site.config.ts](site.config.ts) | This site: name, URL, contact page, blog folder, the facts articles may state, readers, voice. |
| [data/services.json](data/services.json) | Services, audiences (kinds of customer) and angles. |
| [data/locations.json](data/locations.json) | Places for location posts, with nearby towns and trusted local notes. |
| [data/pages.json](data/pages.json) | Site pages articles may link to. |
| [data/ledger.json](data/ledger.json) | Written by the engine: every topic tried, so nothing repeats. |
| [config.ts](config.ts) | Engine settings: model, word ranges, thresholds, banned phrases. |
| [lib/post-file.ts](lib/post-file.ts) | How a post file is written (frontmatter). |

## How a post is made

1. **Pick a topic** from `data/`, skipping anything in the ledger or too close to an existing post.
2. **Generate** with Claude as structured output: title, slug, meta description, excerpt, target keyword and body. The prompt carries the business facts from `site.config.ts`, the rules, the local notes and the list of pages that exist.
3. **Check.** The post is rejected if any of these fail:
   - word count out of range (location 900 to 1,400, service 1,200 to 1,800)
   - an em dash, or a spaced hyphen or double hyphen used as a dash
   - a banned phrase, including unverified claims like "our customers" or "in our experience"
   - title over 70 characters, meta description not 140 to 160 characters
   - target keyword missing from the title, first paragraph, a `##` heading or the meta description
   - no in-body link to the contact page, fewer than 2 other internal links, or a link to a page that doesn't exist
   - any external link
   - duplicate slug or title, or a body too similar to an existing post
   - FAQ section missing, or not 3 to 5 questions
   - location posts: the town named fewer than 3 times, or fewer than 2 nearby towns named
   - anything that isn't plain Markdown (or MDX that doesn't compile)
4. **Retry once** with the failure list. A post that fails twice is skipped, recorded as failed and reported in a GitHub issue; a topic that fails twice is retired. API problems (bad key, no credit) stop the run without counting against the topic.
5. **Save** the post to the blog folder and record the topic in the ledger.

## Publishing

`PUBLISH_MODE` is a repository variable (Settings → Secrets and variables → Actions → Variables):
- `pr` (default): posts collect in one pull request, "SEO engine: new blog posts to review". Merge it to publish; delete a post's file on the branch to drop it.
- `auto`: posts are committed straight to the default branch and go live on the next deploy.

Failures open a GitHub issue labelled `seo-engine`, including when the engine runs out of topics.

## Commands

Put `ANTHROPIC_API_KEY=...` in `.env.local` at the repo root (git-ignored) to run these locally.

| Command | What it does |
|---|---|
| `npm run seo:generate -- --plan` | Shows which topics would be picked. Free. |
| `npm run seo:generate -- --plan --all` | Lists every remaining topic and keyword. Free. |
| `npm run seo:generate -- --stats` | Counts posts written and topics left. Free. |
| `npm run seo:generate -- --dry-run` | Writes posts to a temp folder. Doesn't touch the blog, ledger or GitHub. |
| `npm run seo:generate` | Writes today's posts into the blog folder and updates the ledger. |
| `npm run seo:generate -- --only location` | Just one post type. |
| `npm run seo:generate -- --location <id> --audience <id> --angle <id>` | One location post on a chosen topic. |
| `npm run seo:generate -- --service <id> --audience <id>` | One service post on a chosen topic. |
| `npm run seo:check` | Re-checks every post and the pages list. Pass file paths to check specific posts. |

Each post costs roughly $0.05 to $0.10 in Claude usage. Run logs (including rejected drafts) go to `seo-engine/logs/`, which is git-ignored, and are attached to each Actions run.

## Adding topics

- **Places:** only places the business really serves. `notes` is trusted local context, so keep it to general, checkable facts (geography, housing, transport, weather). No statistics.
- **Services:** `summary` is what the business actually does; the writer treats it as true.
- **Audiences:** `primary` ones are picked first. `examples` gives the writer concrete situations.
- **Angles:** `locationAngles` (and optional `serviceAngles`) multiply the topics: each place x audience x angle is one post, but never two posts for the same keyword. A service can limit its angles (`angles`) or override a keyword (`keywords`).

Run `npm run seo:generate -- --stats` after changes to see how many topics there are.

## Secrets

| Name | Where | Used for |
|---|---|---|
| `ANTHROPIC_API_KEY` | Actions secret | Writing posts |
| `SITE_URL` | Actions variable (optional) | Overrides the URL in `site.config.ts` |
| `PUBLISH_MODE` | Actions variable (optional) | `pr` or `auto` |

`GITHUB_TOKEN` is provided by Actions automatically.
