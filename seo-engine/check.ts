/**
 * Runs the quality gate over existing posts (e.g. after hand-editing one) and
 * checks that every page in data/pages.json still exists.
 *
 *   npm run seo:check                         every post in the content folder
 *   npm run seo:check -- path/to/post.mdx     specific files (also works for dry-run output)
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { config } from "./config";
import { loadLocations, loadPages } from "./lib/data";
import { runGate, type GateTopic } from "./lib/gate";
import { discoverRoutes, routeExists } from "./lib/routes";
import { listedSections, loadExistingPosts, postFiles, validPaths } from "./lib/site";

const POST_FILE = /\.(mdx|md)$/;

function checkPages(): number {
  if (!discoverRoutes()) {
    console.log("pages.json: not a Next.js site, so page paths weren't checked against routes.");
    return 0;
  }
  const missing = [config.site.contactPath, ...loadPages().map((p) => p.path)].filter((p) => !routeExists(p));
  for (const p of missing) console.log(`FAIL  pages.json / contactPath: no route for ${p}`);
  if (!missing.length) console.log("PASS  every page in pages.json (and the contact page) has a route");
  return missing.length;
}

async function main() {
  let failed = checkPages();

  const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const targets = files.length ? files : postFiles();
  if (targets.length === 0) {
    console.log("No posts to check.");
    process.exit(failed ? 1 : 0);
  }

  const all = loadExistingPosts();
  // Posts checked together (e.g. one dry run's output) may link to each other.
  const checkedSlugs = targets.map((f) => ({ slug: path.basename(f).replace(POST_FILE, "") }));
  const locations = loadLocations();

  for (const file of targets) {
    const { data, content } = matter(fs.readFileSync(file, "utf8"));
    const slug = String(data.slug ?? path.basename(file).replace(POST_FILE, ""));
    const others = all.filter((p) => p.slug !== slug);
    const place = locations.find((l) => l.name === data.location);
    const topic: GateTopic =
      data.type === "location"
        ? { type: "location", location: { name: String(data.location ?? ""), nearby: place?.nearby ?? [] } }
        : { type: "service" };

    const result = await runGate(
      {
        title: String(data.title ?? ""),
        slug,
        metaDescription: String(data.description ?? ""),
        excerpt: String(data.excerpt ?? ""),
        targetKeyword: String(data.targetKeyword ?? ""),
        body: content,
      },
      topic,
      {
        existing: others,
        takenSlugs: new Set(others.map((p) => p.slug)),
        validPaths: validPaths([...all, ...checkedSlugs]),
        sections: listedSections(),
      },
    );

    const s = result.stats;
    console.log(
      `${result.pass ? "PASS" : "FAIL"}  ${path.relative(config.paths.root, file)}  ` +
        `(${s.words} words, meta ${s.metaLength}, ${s.internalLinks.length} internal links, ` +
        `${s.faqQuestions} FAQs, max similarity ${s.maxBodySimilarity ? s.maxBodySimilarity.score.toFixed(2) : "n/a"})`,
    );
    for (const f of result.failures) console.log(`  - ${f}`);
    if (!result.pass) failed++;
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
