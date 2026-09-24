/**
 * Plain, serialisable shapes passed from blog Server Components into the
 * client widgets. Nothing here imports lib/blog (which reads the filesystem).
 */
import type { ReactNode } from "react";

export type BlogCategoryLite = {
  slug: string;
  name: string;
  accent: string;
  count: number;
};

/** A server-rendered card plus the text the client filter searches. */
export type FilterItem = {
  slug: string;
  categorySlug: string;
  /** Lower-cased title, excerpt, tags, category and keyword. */
  search: string;
  card: ReactNode;
};

/** Lightweight index of every post so search reaches beyond the current page. */
export type ArchiveEntry = {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  accent: string;
  dateLabel: string;
  readMinutes: number;
  search: string;
};

export type Topic = {
  tag: string;
  label: string;
  count: number;
  weight: 1 | 2 | 3;
};

export type TocHeading = {
  id: string;
  text: string;
  depth: 2 | 3;
};

export type CollageTile = {
  src: string;
  alt: string;
  /** Absolute positioning and size inside the collage, e.g. "left-0 top-0 w-[58%] aspect-square". */
  className: string;
  sizes: string;
  /** Pixels the tile travels upward across the hero's scroll. */
  speed?: number;
  rotate?: number;
  /** "contain" places a white-background packshot on a tinted disc. */
  fit?: "cover" | "contain";
  tint?: string;
  objectPosition?: string;
  priority?: boolean;
};
