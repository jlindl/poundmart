/**
 * Builds the imagery for product pages from the Amazon snapshot:
 * gallery metadata (with real pixel sizes read from /public), and an
 * editorial "story" that pairs the A+ copy with the A+ and gallery photos.
 * Server only (reads the filesystem).
 */
import fs from "node:fs";
import path from "node:path";
import catalog from "@/data/amazon-catalog.json";
import { products, type Product } from "@/lib/products";
import { cleanCopy } from "@/components/shop/shop-data";

export type Media = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** A packshot on a white background: knock it out onto a tinted stage. */
  packshot: boolean;
};

const PUBLIC_DIR = path.join(process.cwd(), "public");
const sizeCache = new Map<string, { width: number; height: number } | null>();

function readSize(buf: Buffer): { width: number; height: number } | null {
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  // JPEG: walk the markers to the first start-of-frame
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      if (marker === 0xff) {
        i++;
        continue;
      }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  return null;
}

/** Pixel size of an image in /public (cached). */
export function imageSize(src: string) {
  if (sizeCache.has(src)) return sizeCache.get(src) ?? null;
  let size: { width: number; height: number } | null = null;
  try {
    size = readSize(fs.readFileSync(path.join(PUBLIC_DIR, decodeURIComponent(src))));
  } catch {
    size = null;
  }
  sizeCache.set(src, size);
  return size;
}

function toMedia(src: string, alt: string): Media {
  const size = imageSize(src) ?? { width: 1000, height: 1000 };
  const ratio = size.width / size.height;
  return { src, alt, ...size, packshot: /\/g1\.jpg$/.test(src) || ratio < 0.8 || ratio > 1.3 };
}

/** Every gallery image with alt text and its real size. */
export function galleryMedia(p: Product): Media[] {
  const total = p.images.length;
  return p.images.map((src, i) => {
    const variant = p.variants.find((v) => v.image === src);
    const alt = i === 0 ? `${p.name}, product photo` : variant ? `${p.name}, ${variant.label} option` : `${p.name}, image ${i + 1} of ${total}`;
    return toMedia(src, alt);
  });
}

/* ---------- The A+ story ---------- */

type RawListing = { aplusText: string[] };
const listings = catalog.products as Record<string, RawListing>;

const FRUITY_TRIO = ["Watermelon Fresh", "Feelin' Grape", "Peachy Clean"];

/** Which A+ images (by file number) are editorial photos, and which heading each one illustrates. */
const APLUS_EDITORIAL: { match: (p: Product) => boolean; photos: { n: number; alt: string; heading?: RegExp }[] }[] = [
  {
    // The shared Nice Smile A+ photo shows the fruity trio, so only use it on packs that contain all three.
    match: (p) => p.category === "toothpaste" && FRUITY_TRIO.every((f) => p.flavours.includes(f)),
    photos: [
      { n: 2, alt: "Feelin' Grape, Peachy Clean and Watermelon Fresh toothpaste tubes on a white podium", heading: /signature|flavour variety/i },
    ],
  },
  {
    match: (p) => p.type === "Leave-in conditioner",
    photos: [
      { n: 9, alt: "Smiling woman with curly hair and three XHC No Rinse Conditioner tubes", heading: /curly hair/i },
      {
        n: 3,
        alt: "XHC Dragon Fruit & Vanilla No Rinse Conditioner key benefits: no rinse formula, hydrates, quick detangling",
        heading: /rinse free/i,
      },
      { n: 6, alt: "XHC Cherry & Almond No Rinse Conditioner with cherries and almonds", heading: /repair/i },
      { n: 7, alt: "XHC Dragon Fruit & Vanilla No Rinse Conditioner with dragon fruit", heading: /texturi[sz]er|afro/i },
      { n: 8, alt: "XHC Mango & Coconut No Rinse Conditioner with mango and coconut", heading: /daily/i },
      { n: 4, alt: "Why you'll love XHC No Rinse Conditioner: water-saving haircare in three formulas" },
      { n: 5, alt: "XHC No Rinse Conditioner active ingredients: argan, olive and avocado oils" },
    ],
  },
  {
    match: (p) => p.flavours.includes("Moroccan Argan Oil"),
    photos: [
      { n: 2, alt: "XHC Argan Oil conditioner beside a swirl of creamy conditioner", heading: /ultra-rich/i },
      { n: 3, alt: "XHC Argan Oil conditioner on a wooden bathroom shelf with a hairbrush", heading: /beauty that cares/i },
      { n: 4, alt: "Hand squeezing XHC Argan Oil conditioner onto marble", heading: /hydrate/i },
      { n: 5, alt: "XHC Argan Oil conditioner on a bath caddy with a towel and oil dropper", heading: /spa/i },
      { n: 6, alt: "XHC Argan Oil conditioner with an open argan nut on dark marble", heading: /science/i },
      { n: 7, alt: "XHC Argan Oil conditioner on argan nuts with a golden oil drop", heading: /pure argan/i },
      { n: 8, alt: "Woman with long glossy curls beside XHC Argan Oil conditioner", heading: /healthy hair/i },
    ],
  },
];

const ALL_FLAVOURS = [...new Set(products.flatMap((p) => p.flavours))];

/** Drops story paragraphs that contradict this product's own listing data. */
function fitsProduct(p: Product, text: string) {
  const t = text.replace(/’/g, "'");
  // Some shared A+ copy says "fluoride-free"; the listing bullets say fluoride protection.
  if (/fluoride-free/i.test(t)) return false;
  // Absolute claims we can't stand behind on this site.
  if (/100%/.test(t)) return false;
  // Pack sizes that aren't this product ("our exclusive 3-pack" on a single tube page).
  const packs = [...t.matchAll(/(\d+)-pack/gi)].map((m) => Number(m[1]));
  if (packs.some((n) => !p.variants.some((v) => v.units === n))) return false;
  // Flavour line-ups that aren't in this pack.
  const named = ALL_FLAVOURS.filter((f) => t.includes(f));
  if (named.some((f) => !p.flavours.includes(f))) return false;
  // Shared shampoo/conditioner copy: keep it on the right product.
  if (p.type === "Conditioner" && /shampoo/i.test(t) && !/conditioner/i.test(t)) return false;
  if (p.type === "Shampoo" && /conditioner/i.test(t) && !/shampoo/i.test(t)) return false;
  return true;
}

export type StoryRow = { title: string; paragraphs: string[]; image: Media };

/**
 * Pairs each paragraph of product.story with the A+ heading that sits above it
 * in the listing, then with the matching A+ photo (falling back to gallery shots).
 * Leftover imagery becomes the lookbook strip.
 */
export function productStory(p: Product): { rows: StoryRow[]; lookbook: Media[] } {
  const raw = listings[p.primary.asin]?.aplusText ?? [];
  const blocks: { title: string; paragraphs: string[]; rawIndex: number }[] = [];

  for (const body of p.story) {
    const idx = raw.indexOf(body);
    const prev = idx > 0 ? raw[idx - 1] : undefined;
    const heading = prev && prev.length <= 60 ? prev : undefined;
    if (heading && /who (is|are) poundmart/i.test(heading)) continue;
    if (/✔/.test(body)) continue;
    if (heading) {
      blocks.push({ title: cleanCopy(heading).replace(/\.$/, ""), paragraphs: [body], rawIndex: idx });
    } else if (blocks.length && blocks[blocks.length - 1].rawIndex === idx - 1) {
      // A continuation paragraph under the same heading
      const last = blocks[blocks.length - 1];
      last.paragraphs.push(body);
      last.rawIndex = idx;
    }
  }

  const fitting = blocks
    .map((b) => ({ ...b, paragraphs: b.paragraphs.filter((t) => fitsProduct(p, t)).map(cleanCopy) }))
    .filter((b) => b.paragraphs.length > 0 && fitsProduct(p, b.title));

  // Image pools
  const own = `/products/${p.primary.asin}/`;
  const editorial = (APLUS_EDITORIAL.find((e) => e.match(p))?.photos ?? [])
    .map((ph) => {
      const src = p.aplusImages.find((s) => s.startsWith(own) && new RegExp(`/a${ph.n}\\.(png|jpg)$`).test(s));
      return src ? { heading: ph.heading, media: toMedia(src, ph.alt) } : null;
    })
    .filter((x): x is { heading: RegExp | undefined; media: Media } => x !== null);
  const gallery = galleryMedia(p).filter((m) => !m.packshot);

  const used = new Set<string>();
  const take = (m: Media | undefined) => {
    if (m) used.add(m.src);
    return m;
  };

  const rows: StoryRow[] = [];
  for (const b of fitting) {
    const image =
      take(editorial.find((e) => !used.has(e.media.src) && e.heading?.test(b.title))?.media) ??
      take(editorial.find((e) => !used.has(e.media.src) && !e.heading)?.media) ??
      take(gallery.find((g) => !used.has(g.src))) ??
      take(editorial.find((e) => !used.has(e.media.src))?.media);
    if (!image) break;
    rows.push({ title: b.title, paragraphs: b.paragraphs, image });
  }

  const lookbook = [...editorial.map((e) => e.media), ...gallery].filter((m) => !used.has(m.src)).slice(0, 10);
  return { rows, lookbook };
}
