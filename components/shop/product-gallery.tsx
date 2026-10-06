"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ViewTransition, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useProductVariant } from "@/components/shop/variant-context";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const MotionImage = motion.create(Image);

export type GalleryImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  packshot: boolean;
};

/**
 * Product gallery: crossfading stage with cursor-following hover zoom,
 * keyboard arrows, a counter and a thumbnail rail. The stage morphs from the
 * product card image when you arrive from a grid (shared view transition).
 */
export function ProductGallery({ images, slug, name, accentSoft }: { images: GalleryImage[]; slug: string; name: string; accentSoft: string }) {
  const { imageIndex, setImageIndex } = useProductVariant();
  const reduce = useReducedMotion();
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const thumbsRef = useRef<HTMLDivElement>(null);
  const count = images.length;
  const index = Math.min(imageIndex, count - 1);
  const current = images[index];

  const go = (i: number) => setImageIndex((i + count) % count);

  // Keep the active thumbnail in view
  useEffect(() => {
    const rail = thumbsRef.current;
    const thumb = rail?.querySelector<HTMLElement>(`[data-thumb="${index}"]`);
    if (!rail || !thumb) return;
    const left = thumb.offsetLeft - rail.clientWidth / 2 + thumb.clientWidth / 2;
    rail.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [index, reduce]);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "ArrowLeft") go(index - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(count - 1);
    else return;
    e.preventDefault();
  }

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }

  if (!current) return null;

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${name} photos. Use the left and right arrow keys to browse.`}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerEnter={(e) => e.pointerType === "mouse" && setZoom(true)}
        onPointerLeave={() => setZoom(false)}
        onPointerMove={onMove}
        className={cn(
          "group relative aspect-square overflow-hidden rounded-[2rem] shadow-soft outline-offset-4 sm:rounded-5xl",
          zoom ? "cursor-zoom-out" : "cursor-zoom-in",
        )}
        style={{ background: accentSoft }}
      >
        {/* The tinted stage lives inside the view-transition element so it morphs with the photo, and the
            photo itself carries the motion: a transformed wrapper would isolate the multiply knock-out. */}
        <ViewTransition name={`product-image-${slug}`} share="morph" default="none">
          <div className="absolute inset-0" style={{ background: accentSoft }}>
            <div aria-hidden className="absolute left-1/2 top-1/2 size-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
            <div aria-hidden className="dot-grid absolute inset-0 opacity-40" />
            <AnimatePresence initial={false}>
              <MotionImage
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 55vw, 100vw"
                quality={90}
                className={current.packshot ? "product-cutout object-contain p-[9%]" : "object-cover"}
                style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
                initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
                animate={{ opacity: 1, scale: zoom ? 2.1 : 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: reduce ? 0.15 : 0.5, ease: EASE },
                  scale: { duration: reduce ? 0 : 0.5, ease: EASE },
                }}
              />
            </AnimatePresence>
          </div>
        </ViewTransition>

        {/* Zoom hint */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-4 top-4 hidden items-center gap-1.5 rounded-full bg-paper/85 px-3 py-1.5 text-xs font-semibold text-ink shadow-soft backdrop-blur transition-opacity duration-300 sm:inline-flex",
            zoom && "opacity-0",
          )}
        >
          <ZoomIn className="size-3.5" /> Hover to zoom
        </span>

        {/* Counter + arrows */}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 sm:inset-x-5 sm:bottom-5">
          <span className="rounded-full bg-ink/85 px-3 py-1.5 font-mono text-xs font-semibold tabular-nums text-cream backdrop-blur">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          {count > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous photo"
                className="grid size-11 cursor-pointer place-items-center rounded-full bg-paper/90 text-ink shadow-soft backdrop-blur transition-all duration-300 hover:-translate-x-0.5 hover:bg-ink hover:text-cream"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next photo"
                className="grid size-11 cursor-pointer place-items-center rounded-full bg-paper/90 text-ink shadow-soft backdrop-blur transition-all duration-300 hover:translate-x-0.5 hover:bg-ink hover:text-cream"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          Photo {index + 1} of {count}: {current.alt}
        </p>
      </div>

      {count > 1 && (
        <div ref={thumbsRef} className="no-scrollbar relative -mx-1 flex gap-2.5 overflow-x-auto px-1 py-1.5 sm:gap-3">
          {images.map((img, i) => {
            const active = i === index;
            return (
              <button
                key={img.src}
                type="button"
                data-thumb={i}
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1}: ${img.alt}`}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "relative size-[4.5rem] shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300 sm:size-20",
                  active ? "border-ink shadow-soft" : "border-transparent opacity-70 hover:-translate-y-0.5 hover:opacity-100",
                )}
                style={{ background: img.packshot ? accentSoft : undefined }}
              >
                <Image src={img.src} alt="" fill sizes="80px" className={img.packshot ? "product-cutout object-contain p-1.5" : "object-cover"} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
