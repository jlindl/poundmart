import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export function formatPrice(value: number) {
  return gbp.format(value);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

/** Split "Great value, *bundled* beautifully" into plain and accent segments. */
export function parseAccent(text: string) {
  return text.split("*").map((part, i) => ({ text: part, accent: i % 2 === 1 }));
}

/**
 * Page <title> for metadata. Keeps the " | PoundMart" template suffix when the
 * result fits Google's ~60 character display, otherwise drops it so the
 * meaningful part of the title isn't truncated in search results.
 */
export function seoTitle(title: string, suffix = " | PoundMart", max = 60): string | { absolute: string } {
  return title.length + suffix.length <= max ? title : { absolute: title };
}

/**
 * Meta description capped at Google's ~160 character display limit. Cuts at
 * the last full sentence that fits, otherwise at a word boundary.
 */
export function seoDescription(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (lastStop > 90) return cut.slice(0, lastStop + 1);
  return `${cut.slice(0, cut.lastIndexOf(" ", max - 1)).replace(/[,;:\s]+$/, "")}.`;
}
