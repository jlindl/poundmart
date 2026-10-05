/**
 * Prints the pull request description for the pending-posts PR: every post
 * added on this branch (compared with main), so the whole batch can be
 * reviewed from the PR page.
 *
 *   npx tsx seo-engine/pr-body.ts [--base origin/main] [--log seo-engine/logs/generate-<date>.json]
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import matter from "gray-matter";
import { config } from "./config";
import { postPath } from "./lib/site";
import { countWords } from "./lib/text";

const { values: args } = parseArgs({
  options: { base: { type: "string", default: "origin/main" }, log: { type: "string" } },
});

const added = execFileSync("git", ["diff", "--name-only", "--diff-filter=A", `${args.base}...HEAD`, "--", config.site.contentDir], { encoding: "utf8" })
  .split("\n")
  .map((f) => f.trim())
  .filter((f) => /\.(mdx|md)$/.test(f));

const posts = added
  .map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(config.paths.root, file), "utf8"));
    return { file, data, words: countWords(content) };
  })
  .sort((a, b) => String(a.data.date).localeCompare(String(b.data.date)) || String(a.data.type).localeCompare(String(b.data.type)));

const out: string[] = [];
out.push(`## ${posts.length} new blog post${posts.length === 1 ? "" : "s"} from the SEO engine`, "");
out.push(
  "Merging publishes these on the site.",
  "",
  "To drop a post, delete its file from this branch before merging. " +
    "To change wording, edit the files here. A preview deployment on this PR (if the host makes one) shows the posts as they'll appear.",
  "",
);

posts.forEach((p, i) => {
  const d = p.data;
  const where = d.type === "location" ? `${d.location}, ${d.region}` : d.service;
  out.push(`### ${i + 1}. ${d.title}`);
  out.push(
    `- **${d.type === "location" ? "Location" : "Service"} post** · ${where} · ${d.audience} · ${d.date}`,
    `- Keyword: \`${d.targetKeyword}\` · ${p.words.toLocaleString("en-GB")} words`,
    `- Meta description (${String(d.description).length} chars): ${d.description}`,
    `- File: \`${p.file}\` · page: \`${postPath(String(d.slug))}\``,
    "",
    `> ${d.excerpt}`,
    "",
  );
});

if (args.log && fs.existsSync(args.log)) {
  const log = JSON.parse(fs.readFileSync(args.log, "utf8")) as {
    date: string;
    costUsd: number;
    posts: { topicKey: string; status: string; attempts: unknown[] }[];
  };
  out.push("---", `**Latest run (${log.date}):** approx cost $${log.costUsd.toFixed(3)}`);
  for (const p of log.posts) out.push(`- \`${p.topicKey}\`: ${p.status} after ${p.attempts.length} attempt(s)`);
}

process.stdout.write(out.join("\n") + "\n");
