/** Loaders and types for the committed topic data and the ledger. */
import fs from "node:fs";
import path from "node:path";
import { config } from "../config";

export type Location = {
  id: string;
  name: string;
  /** County, state or region, e.g. "Lancashire". */
  region: string;
  /** 1 is used first, then 2, then 3. */
  tier: number;
  nearby: string[];
  /** Trusted local context for the model: general, checkable facts only. */
  notes: string;
};

export type Service = {
  id: string;
  name: string;
  /** Lowercase noun phrase for keyword templates ({service}). Defaults to the name in lowercase. */
  term?: string;
  /** Suggested keyword when there are no service angles, e.g. "roof repairs for {audience}". */
  keyword: string;
  /** What the business actually does for this service. Facts only: the model treats it as true. */
  summary: string;
  /** Pages the article should prefer to link to (must also be in pages.json). */
  relatedPaths?: string[];
  /** Only these serviceAngles apply to this service (default: all of them). */
  angles?: string[];
  /** Keyword overrides per service angle id, when the angle's template reads badly for this service. */
  keywords?: Record<string, string>;
};

export type Audience = {
  id: string;
  /** Plural, as it reads in a sentence: "homeowners", "roofers". */
  name: string;
  /** Singular: "homeowner", "roofer". */
  singular: string;
  /** "primary" audiences are picked before "secondary" ones. */
  kind: "primary" | "secondary";
  /** Concrete examples of what this audience does or needs, used for examples in articles. */
  examples: string;
  /** Extra template variables, e.g. { "trade": "roofing" } for "{trade} leads in {location}". */
  vars?: Record<string, string>;
};

export type Angle = {
  id: string;
  /** Suggested keyword template, e.g. "roof repairs in {location}". */
  keyword: string;
  /** What the article is about, as a template. */
  angle: string;
};

export type ServiceData = {
  services: Service[];
  audiences: Audience[];
  locationAngles: Angle[];
  /** Optional. With angles, each service x audience pair yields one post per angle. */
  serviceAngles?: Angle[];
  /** "service-id:audience-id" pairs to skip. */
  excludePairs?: string[];
};

export type LinkTarget = { path: string; label: string };

export type LedgerEntry = {
  date: string;
  type: "location" | "service";
  /** Stable topic key, e.g. "location:chorley:homeowners:repairs". */
  key: string;
  status: "generated" | "failed";
  slug?: string;
  title?: string;
  targetKeyword?: string;
  /** The keyword the topic suggested, so no other topic suggests it again. */
  suggestedKeyword?: string;
  angle?: string;
  reasons?: string[];
};

type Ledger = { _readme?: string; entries: LedgerEntry[] };

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export function loadLocations(): Location[] {
  return readJson<{ locations: Location[] }>(path.join(config.paths.data, "locations.json")).locations;
}

export function loadServiceData(): Required<ServiceData> {
  const d = readJson<ServiceData>(path.join(config.paths.data, "services.json"));
  return { serviceAngles: [], excludePairs: [], ...d };
}

/** Site pages (besides blog posts) that articles may link to, with labels for the prompt. */
export function loadPages(): LinkTarget[] {
  return readJson<{ pages: LinkTarget[] }>(path.join(config.paths.data, "pages.json")).pages;
}

export function loadLedger(): Ledger {
  return readJson<Ledger>(config.paths.ledger);
}

export function saveLedger(ledger: Ledger): void {
  fs.writeFileSync(config.paths.ledger, JSON.stringify(ledger, null, 2) + "\n");
}
