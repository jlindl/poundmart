/**
 * Topic picking. A location post is a place x audience x angle; a service
 * post is a service x audience (x angle, when services.json has
 * serviceAngles).
 *
 * Rules:
 * - A topic already in the ledger as "generated" is never picked again; a
 *   topic that has failed `maxFailuresPerTopic` times is retired.
 * - Locations are worked through in rounds: every tier 1 place gets
 *   `locationRoundSize` posts before tier 2 starts, and so on, then the cycle
 *   repeats with the next round.
 * - Fresh combinations come first: a place (or service) is paired with an
 *   audience it hasn't had before one it has, and angles rotate.
 * - Primary audiences come before secondary ones.
 * - Candidates whose working title overlaps an existing post title or slug
 *   too much are skipped.
 * - Ties break on a hash of the date, so a re-run on the same day picks the
 *   same topics.
 */
import { config } from "../config";
import type { Angle, Audience, LedgerEntry, Location, Service, ServiceData } from "./data";
import { contentTokens, fill, hash, jaccard, normalise } from "./text";

export type LocationTopic = {
  type: "location";
  key: string;
  location: Location;
  audience: Audience;
  angle: Angle;
  suggestedKeyword: string;
  workingTitle: string;
};

export type ServiceTopic = {
  type: "service";
  key: string;
  service: Service;
  audience: Audience;
  angle?: Angle;
  suggestedKeyword: string;
  workingTitle: string;
};

export type Topic = LocationTopic | ServiceTopic;

type PickContext = {
  date: string;
  ledger: LedgerEntry[];
  /** Existing posts: titles and slugs to avoid near-duplicates, topic keys and keywords already covered. */
  existing: { slug: string; title: string; topicKey?: string; targetKeyword?: string }[];
};

const { locationRoundSize, secondaryAudiencePenalty, maxFailuresPerTopic } = config.topics;

export function templateVars(audience: Audience, extra: { location?: Location; service?: Service } = {}): Record<string, string> {
  return {
    name: config.site.name,
    audience: audience.name,
    singular: audience.singular,
    ...(audience.vars ?? {}),
    ...(extra.location ? { location: extra.location.name, region: extra.location.region } : {}),
    ...(extra.service ? { service: extra.service.term ?? extra.service.name.toLowerCase() } : {}),
  };
}

function blocked(key: string, ctx: PickContext): boolean {
  const entries = ctx.ledger.filter((e) => e.key === key);
  return (
    entries.some((e) => e.status === "generated") ||
    entries.filter((e) => e.status === "failed").length >= maxFailuresPerTopic ||
    // A post on disk covers its topic even if the ledger lost track of it.
    ctx.existing.some((p) => p.topicKey === key)
  );
}

/** Keywords already written about, from the ledger and from posts on disk. */
function usedKeywords(ctx: PickContext): Set<string> {
  const out = new Set<string>();
  for (const e of ctx.ledger) {
    if (e.status !== "generated") continue;
    if (e.suggestedKeyword) out.add(normalise(e.suggestedKeyword));
    if (e.targetKeyword) out.add(normalise(e.targetKeyword));
  }
  for (const p of ctx.existing) if (p.targetKeyword) out.add(normalise(p.targetKeyword));
  return out;
}

/** Best-first candidates with one topic per keyword, skipping keywords already covered. */
function finalise<T extends Topic>(scored: { topic: T; score: number[] }[], ctx: PickContext): T[] {
  const used = usedKeywords(ctx);
  const out: T[] = [];
  for (const { topic } of scored.sort((a, b) => cmp(a.score, b.score))) {
    const kw = normalise(topic.suggestedKeyword);
    if (used.has(kw)) continue;
    used.add(kw);
    out.push(topic);
  }
  return out;
}

function tooCloseToExisting(workingTitle: string, existing: PickContext["existing"]): boolean {
  const t = contentTokens(workingTitle);
  return existing.some(
    (p) =>
      jaccard(t, contentTokens(p.title)) > config.similarity.maxTopicJaccard ||
      jaccard(t, contentTokens(p.slug.replace(/-/g, " "))) > config.similarity.maxTopicJaccard,
  );
}

/** Generated posts whose topic key starts with `prefix`. */
function uses(ledger: LedgerEntry[], prefix: string): number {
  return ledger.filter((e) => e.status === "generated" && e.key.startsWith(prefix)).length;
}

function usesWhere(ledger: LedgerEntry[], pred: (e: LedgerEntry) => boolean): number {
  return ledger.filter((e) => e.status === "generated" && pred(e)).length;
}

/** Compare tuples lexicographically. */
function cmp(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

const penalty = (a: Audience) => (a.kind === "secondary" ? secondaryAudiencePenalty : 0);

export function locationTopic(location: Location, audience: Audience, angle: Angle): LocationTopic {
  const suggestedKeyword = fill(angle.keyword, templateVars(audience, { location }));
  return {
    type: "location",
    key: `location:${location.id}:${audience.id}:${angle.id}`,
    location,
    audience,
    angle,
    suggestedKeyword,
    workingTitle: suggestedKeyword,
  };
}

export function serviceTopic(service: Service, audience: Audience, angle?: Angle): ServiceTopic {
  const vars = templateVars(audience, { service });
  const template = angle ? (service.keywords?.[angle.id] ?? angle.keyword) : service.keyword;
  const suggestedKeyword = fill(template, vars);
  return {
    type: "service",
    key: `service:${service.id}:${audience.id}${angle ? `:${angle.id}` : ""}`,
    service,
    audience,
    ...(angle ? { angle } : {}),
    suggestedKeyword,
    workingTitle: angle ? suggestedKeyword : `${service.name} for ${audience.name}`,
  };
}

/** Every location topic still available, best first. */
export function locationCandidates(ctx: PickContext, locations: Location[], audiences: Audience[], angles: Angle[]): LocationTopic[] {
  const scored: { topic: LocationTopic; score: number[] }[] = [];
  const angleUses = (a: Angle, audienceId?: string) =>
    usesWhere(ctx.ledger, (e) => e.type === "location" && e.angle === a.id && (!audienceId || e.key.split(":")[2] === audienceId));

  for (const location of locations) {
    const locUses = uses(ctx.ledger, `location:${location.id}:`);
    for (const audience of audiences) {
      const pairUses = uses(ctx.ledger, `location:${location.id}:${audience.id}:`);
      const audUses = usesWhere(ctx.ledger, (e) => e.type === "location" && e.key.split(":")[2] === audience.id) + penalty(audience);
      for (const angle of angles) {
        const topic = locationTopic(location, audience, angle);
        if (blocked(topic.key, ctx) || tooCloseToExisting(topic.workingTitle, ctx.existing)) continue;
        scored.push({
          topic,
          score: [
            Math.floor(locUses / locationRoundSize),
            location.tier,
            locUses,
            pairUses,
            audUses,
            angleUses(angle, audience.id),
            angleUses(angle),
            hash(`${ctx.date}:${topic.key}`),
          ],
        });
      }
    }
  }
  return finalise(scored, ctx);
}

/** Every service topic still available, best first. */
export function serviceCandidates(ctx: PickContext, data: Required<ServiceData>, avoidAudienceId?: string): ServiceTopic[] {
  const scored: { topic: ServiceTopic; score: number[] }[] = [];
  for (const service of data.services) {
    const angles: (Angle | undefined)[] = data.serviceAngles.length
      ? data.serviceAngles.filter((a) => !service.angles || service.angles.includes(a.id))
      : [undefined];
    const svcUses = uses(ctx.ledger, `service:${service.id}:`);
    for (const audience of data.audiences) {
      if (data.excludePairs.includes(`${service.id}:${audience.id}`)) continue;
      const pair = `service:${service.id}:${audience.id}`;
      const pairUses = usesWhere(ctx.ledger, (e) => e.key === pair || e.key.startsWith(`${pair}:`));
      const audUses = usesWhere(ctx.ledger, (e) => e.type === "service" && e.key.split(":")[2] === audience.id) + penalty(audience);
      for (const angle of angles) {
        const topic = serviceTopic(service, audience, angle);
        if (blocked(topic.key, ctx) || tooCloseToExisting(topic.workingTitle, ctx.existing)) continue;
        const angleUses = angle ? usesWhere(ctx.ledger, (e) => e.type === "service" && e.angle === angle.id) : 0;
        scored.push({
          topic,
          score: [
            pairUses,
            svcUses + audUses,
            svcUses,
            // A tie-breaker only: with few audiences, primary ones still win.
            audience.id === avoidAudienceId ? 1 : 0,
            angleUses,
            hash(`${ctx.date}:${topic.key}`),
          ],
        });
      }
    }
  }
  return finalise(scored, ctx);
}
