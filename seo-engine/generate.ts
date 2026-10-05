/**
 * Article generation.
 *
 *   npm run seo:generate                      picks and writes today's posts
 *   npm run seo:generate -- --dry-run         writes to a temp folder, no ledger, no issues
 *   npm run seo:generate -- --plan            prints the topics it would pick, then stops (free)
 *   npm run seo:generate -- --plan --all      prints every remaining topic in pick order (free)
 *   npm run seo:generate -- --stats           counts the topics left, then stops (free)
 *   npm run seo:generate -- --only service    just one of the two post types
 *   npm run seo:generate -- --location <id> --audience <id> [--angle <id>]
 *   npm run seo:generate -- --service <id> --audience <id> [--angle <id>]
 *   npm run seo:generate -- --date 2026-10-01
 *
 * Each post is generated, run through the quality gate, and retried once with
 * the failure reasons if it fails. A post that fails twice is skipped, logged
 * in the ledger and reported in a GitHub issue.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config";
import { addUsage, costUsd, emptyUsage, generateArticle, GenerationError, type Article, type Usage } from "./lib/claude";
import { loadLedger, loadLocations, loadServiceData, saveLedger, type LedgerEntry } from "./lib/data";
import { runGate, type GateResult } from "./lib/gate";
import { openIssue } from "./lib/github";
import { buildPostFile } from "./lib/post-file";
import { retryPrompt, userPrompt } from "./lib/prompts";
import { listedSections, loadExistingPosts, sitePages, validPaths, type ExistingPost } from "./lib/site";
import { today } from "./lib/text";
import { locationCandidates, locationTopic, serviceCandidates, serviceTopic, type Topic } from "./lib/topics";

type PostType = Topic["type"];

type PostResult = {
  type: PostType;
  topicKey: string;
  status: "generated" | "failed";
  slug?: string;
  title?: string;
  targetKeyword?: string;
  file?: string;
  /** One entry per attempt; rejected drafts are kept so failures can be inspected in the run log. */
  attempts: { failures: string[]; stats?: GateResult["stats"]; rejectedDraft?: Article }[];
  /** Claude tokens for the article, including retries. */
  usage: Usage;
  costUsd: number;
  error?: string;
};

const { values: args } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    plan: { type: "boolean", default: false },
    stats: { type: "boolean", default: false },
    all: { type: "boolean", default: false },
    only: { type: "string" },
    location: { type: "string" },
    service: { type: "string" },
    audience: { type: "string" },
    angle: { type: "string" },
    date: { type: "string" },
  },
});

function fail(msg: string): never {
  console.error(`seo:generate: ${msg}`);
  process.exit(2);
}

function byId<T extends { id: string }>(list: T[], id: string | undefined, what: string): T {
  const hit = list.find((x) => x.id === id);
  if (!hit) fail(`unknown ${what} "${id ?? ""}". Valid: ${list.map((x) => x.id).join(", ") || "(none)"}`);
  return hit;
}

/** Refuse to write about a placeholder business. */
function assertConfigured(): void {
  const todo = [config.site.name, config.site.author, config.site.readers, ...config.site.about].some((s) => /\bTODO\b/.test(s));
  if (todo) fail("seo-engine/site.config.ts still has TODO placeholders. Fill it in before generating.");
  const data = loadServiceData();
  const ids = [
    ...loadLocations().map((x) => x.id),
    ...data.services.map((x) => x.id),
    ...data.audiences.map((x) => x.id),
    ...data.locationAngles.map((x) => x.id),
    ...data.serviceAngles.map((x) => x.id),
  ];
  const examples = ids.filter((id) => id.startsWith("example-"));
  if (examples.length) fail(`seo-engine/data still has example entries (${examples.join(", ")}). Replace them with real data first.`);
}

/** Post types the daily run writes: enabled in site.config.ts, narrowed by --only. */
function activeTypes(): PostType[] {
  const enabled = (["location", "service"] as const).filter((t) => config.site.postTypes[t]);
  if (!args.only) return enabled;
  if (args.only !== "location" && args.only !== "service") fail(`--only must be "location" or "service"`);
  return enabled.filter((t) => t === args.only);
}

/** Every remaining topic of one type, best first. */
type Picker = Record<PostType, (ledger: LedgerEntry[], existing: ExistingPost[], date: string, avoidAudienceId?: string) => Topic[]>;

function pickers(): Picker {
  const locations = loadLocations();
  const data = loadServiceData();
  return {
    location: (ledger, existing, date) => locationCandidates({ date, ledger, existing }, locations, data.audiences, data.locationAngles),
    service: (ledger, existing, date, avoid) => serviceCandidates({ date, ledger, existing }, data, avoid),
  };
}

function forcedTopic(): Topic | null {
  if (!args.location && !args.service) return null;
  const data = loadServiceData();
  const audience = byId(data.audiences, args.audience, "audience");
  if (args.location) {
    const angle = args.angle ? byId(data.locationAngles, args.angle, "location angle") : data.locationAngles[0];
    if (!angle) fail("services.json has no locationAngles.");
    return locationTopic(byId(loadLocations(), args.location, "location"), audience, angle);
  }
  const angle = args.angle ? byId(data.serviceAngles, args.angle, "service angle") : data.serviceAngles[0];
  return serviceTopic(byId(data.services, args.service, "service"), audience, angle);
}

async function main() {
  const dryRun = args["dry-run"];
  const date = args.date ?? today(config.site.timeZone);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`--date must be YYYY-MM-DD`);
  assertConfigured();

  const ledger = loadLedger();
  const existing = loadExistingPosts();
  const pick = pickers();
  const types = activeTypes();

  if (args.stats) {
    for (const type of ["location", "service"] as const) {
      const left = config.site.postTypes[type] ? pick[type](ledger.entries, existing, date).length : 0;
      const done = ledger.entries.filter((e) => e.type === type && e.status === "generated").length;
      console.log(`${type.padEnd(8)} ${config.site.postTypes[type] ? "on " : "off"}  ${String(done).padStart(4)} written  ${String(left).padStart(5)} topics left`);
    }
    return;
  }

  if (args.plan && args.all) {
    for (const type of types) {
      const all = pick[type](ledger.entries, existing, date);
      console.log(`${type}: ${all.length} topics left, in pick order`);
      for (const t of all) console.log(`  ${t.key.padEnd(48)} "${t.suggestedKeyword}"`);
    }
    return;
  }

  // Choose topics: one forced topic, or one of each active type not already done today (safe re-runs).
  const topics: Topic[] = [];
  const exhausted: PostType[] = [];
  const forced = forcedTopic();
  if (forced) topics.push(forced);
  else {
    const doneToday = (type: PostType) => ledger.entries.some((e) => e.date === date && e.type === type && e.status === "generated");
    for (const type of types) {
      if (doneToday(type)) continue;
      const [first] = pick[type](ledger.entries, existing, date, topics[0]?.audience.id);
      if (first) topics.push(first);
      else exhausted.push(type);
    }
  }

  if (args.plan) {
    for (const t of topics) console.log(`${t.type.padEnd(8)} ${t.key.padEnd(48)} "${t.suggestedKeyword}"`);
    for (const t of exhausted) console.log(`${t.padEnd(8)} (no topics left)`);
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) fail("ANTHROPIC_API_KEY is not set.");

  // Dry runs go to a per-site temp folder, so output from different sites never mixes.
  const outDir = dryRun ? path.join(os.tmpdir(), "seo-engine", path.basename(config.paths.root), date) : config.paths.blog;
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`seo:generate ${date}${dryRun ? " (dry run)" : ""}, mode ${config.publishMode}, model ${config.model.id}`);
  if (topics.length === 0) console.log("Nothing to generate.");

  for (const type of exhausted) {
    const where = type === "location" ? "places to data/locations.json or angles to locationAngles" : "services, audiences or serviceAngles";
    console.warn(`No ${type} topics left. Add ${where} in seo-engine/data.`);
    if (!dryRun) {
      await openIssue(
        `SEO engine: no ${type} topics left`,
        `Every ${type} topic has been written (or retired after failing). Until more are added, the daily run skips ${type} posts.\n\n` +
          `Add ${where} in \`seo-engine/data/\`, or turn ${type} posts off in \`seo-engine/site.config.ts\` (\`postTypes\`). ` +
          `Run \`npm run seo:generate -- --stats\` to see how many topics are left.`,
        { dedupe: true },
      );
    }
  }

  const takenSlugs = new Set([
    ...existing.map((p) => p.slug),
    ...ledger.entries.filter((e) => e.slug).map((e) => e.slug!),
  ]);
  const results: PostResult[] = [];

  for (const topic of topics) {
    console.log(`\n[${topic.type}] ${topic.key}  (keyword: "${topic.suggestedKeyword}")`);
    const { result, article } = await generateOne(topic, existing, takenSlugs);
    results.push(result);

    if (article) {
      const file = path.join(outDir, `${article.slug}${config.postExtension}`);
      fs.writeFileSync(file, buildPostFile(article, topic, date));
      result.file = path.relative(config.paths.root, file);
      console.log(`  wrote ${result.file}`);

      // Later posts in this run must not duplicate this one, and may link to it.
      existing.push({ slug: article.slug, title: article.title, body: article.body, type: topic.type });
      takenSlugs.add(article.slug);
    } else if (!dryRun) {
      const last = result.attempts.at(-1)?.failures ?? [];
      await openIssue(
        `SEO engine: ${topic.type} post skipped on ${date} (${topic.key})`,
        `The ${topic.type} post for **${topic.key}** failed the quality gate ${result.attempts.length} time(s) and was skipped.\n\n` +
          `**Final failures:**\n${last.map((f) => `- ${f}`).join("\n")}\n\n` +
          `The topic stays available and will be retried on a later day (it is retired after ${config.topics.maxFailuresPerTopic} failures).\n\n` +
          `Approximate cost of the attempts: $${costUsd(result.usage).toFixed(3)}`,
      );
    }

    if (!dryRun) {
      ledger.entries.push({
        date,
        type: topic.type,
        key: topic.key,
        status: result.status,
        suggestedKeyword: topic.suggestedKeyword,
        ...(topic.angle ? { angle: topic.angle.id } : {}),
        ...(result.slug ? { slug: result.slug, title: result.title, targetKeyword: result.targetKeyword } : {}),
        ...(result.status === "failed" ? { reasons: result.attempts.at(-1)?.failures ?? [] } : {}),
      });
      saveLedger(ledger);
    }
  }

  for (const r of results) r.costUsd = costUsd(r.usage);
  const total = results.reduce((u, r) => addUsage(u, r.usage), emptyUsage());
  const summary = {
    date,
    dryRun,
    mode: config.publishMode,
    model: config.model.id,
    posts: results,
    usage: total,
    costUsd: Number(results.reduce((sum, r) => sum + r.costUsd, 0).toFixed(4)),
  };
  const logDir = dryRun ? outDir : config.paths.logs;
  fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `generate-${date}.json`);
  fs.writeFileSync(logFile, JSON.stringify(summary, null, 2) + "\n");

  console.log(
    `\nDone: ${results.filter((r) => r.status === "generated").length} generated, ` +
      `${results.filter((r) => r.status === "failed").length} skipped. ` +
      `Tokens in ${total.inputTokens + total.cacheReadTokens + total.cacheWriteTokens}, out ${total.outputTokens}. ` +
      `Approx cost $${summary.costUsd.toFixed(3)}. Log: ${logFile}`,
  );
}

async function generateOne(
  topic: Topic,
  existing: ExistingPost[],
  takenSlugs: Set<string>,
): Promise<{ result: PostResult; article?: Article }> {
  const result: PostResult = { type: topic.type, topicKey: topic.key, status: "failed", attempts: [], usage: emptyUsage(), costUsd: 0 };
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userPrompt(topic, sitePages(), existing) }];
  const ctx = { existing, takenSlugs, validPaths: validPaths(existing), sections: listedSections() };

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const { article, usage, assistant } = await generateArticle(messages);
      result.usage = addUsage(result.usage, usage);
      const gate = await runGate(article, topic, ctx);
      result.attempts.push({ failures: gate.failures, stats: gate.stats, ...(gate.pass ? {} : { rejectedDraft: article }) });
      console.log(
        `  attempt ${attempt + 1}: ${gate.pass ? "PASS" : `FAIL (${gate.failures.length})`}, ` +
          `${gate.stats.words} words, meta ${gate.stats.metaLength} chars, ` +
          `${gate.stats.internalLinks.length} internal links, ${usage.outputTokens} output tokens`,
      );
      for (const f of gate.failures) console.log(`    - ${f}`);

      if (gate.pass) {
        Object.assign(result, { status: "generated", slug: article.slug, title: article.title, targetKeyword: article.targetKeyword });
        return { result, article };
      }
      messages.push(assistant, { role: "user", content: retryPrompt(gate.failures) });
    } catch (e) {
      // API problems (bad key, no credit, outage, network) aren't the topic's fault:
      // stop the run instead of recording failures that would retire good topics.
      if (!(e instanceof GenerationError)) throw e;
      result.usage = addUsage(result.usage, e.usage);
      result.attempts.push({ failures: [e.message] });
      result.error = e.message;
      console.log(`  attempt ${attempt + 1}: ERROR ${e.message}`);
    }
  }
  return { result };
}

/** A plain-English explanation for errors that stop the run. */
function explain(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) {
    return "Anthropic rejected the API key (401). Check ANTHROPIC_API_KEY in .env.local (locally) or the repository secret (in GitHub Actions). Anthropic keys start with sk-ant-.";
  }
  if (e instanceof Anthropic.PermissionDeniedError) return `Anthropic refused access (403): ${e.message}`;
  if (e instanceof Anthropic.RateLimitError) return `Anthropic rate limit or spend limit hit (429), even after retries: ${e.message}`;
  if (e instanceof Anthropic.BadRequestError) return `Anthropic rejected the request (400). If this mentions credit balance, top up at console.anthropic.com. ${e.message}`;
  if (e instanceof Anthropic.APIError) return `Anthropic API error ${e.status ?? ""}: ${e.message}`;
  return e instanceof Error ? (e.stack ?? e.message) : String(e);
}

main().catch((e) => {
  console.error(`\nseo:generate stopped: ${explain(e)}`);
  console.error("Nothing was recorded for the post that was in progress. Posts finished before this point are saved.");
  process.exit(1);
});
