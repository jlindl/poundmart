"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export type GalleryItem = {
  id: string;
  /** A `fill` image (Image or SmartImage). */
  media: ReactNode;
  caption: string;
  kicker: string;
  shape: "portrait" | "landscape" | "square";
};

const ratios = { portrait: 0.8, landscape: 1.34, square: 1 } as const;

const DESKTOP = "(min-width: 1024px)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getDesktop = () => window.matchMedia(DESKTOP).matches;
const getServerDesktop = () => false;

/**
 * "Behind the bundles": on desktop the section pins and vertical scrolling
 * drives the photo strip sideways. On touch screens (and with reduced
 * motion) it's a native swipeable strip.
 */
export function BehindGallery({
  eyebrow,
  title,
  intro,
  items,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  items: GalleryItem[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isDesktop = useSyncExternalStore(subscribe, getDesktop, getServerDesktop);
  const pinned = isDesktop && !reduce;
  const distance = useMotionValue(0);

  useEffect(() => {
    const track = trackRef.current;
    const vp = viewportRef.current;
    if (!track || !vp) return;
    const ro = new ResizeObserver(() => distance.set(Math.max(0, track.scrollWidth - vp.clientWidth)));
    ro.observe(track);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [distance]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const { scrollXProgress } = useScroll({ container: viewportRef });
  const x = useTransform(() => -scrollYProgress.get() * distance.get());
  const bar = pinned ? scrollYProgress : scrollXProgress;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="behind-title"
      className="relative bg-cream lg:h-[320vh] lg:motion-reduce:h-auto"
    >
      <div className="py-24 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:overflow-hidden lg:py-0 lg:motion-reduce:static lg:motion-reduce:h-auto lg:motion-reduce:py-32">
        <div className="container-x flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal y={12}>
              <span className="eyebrow inline-flex items-center gap-2 text-ink-soft">
                <span aria-hidden className="size-1.5 rounded-full bg-sun-deep" />
                {eyebrow}
              </span>
            </Reveal>
            <div id="behind-title">
              <SplitHeading
                text={title}
                className="type-display mt-4 max-w-[16ch] text-[clamp(2.4rem,5vw,4.6rem)] text-ink"
                accentClassName="text-ink-soft"
              />
            </div>
          </div>
          <Reveal y={16} delay={0.1} className="flex max-w-md flex-col gap-5 lg:items-end lg:text-right">
            <p className="text-lg leading-relaxed text-ink-muted">{intro}</p>
            <div className="flex items-center gap-3 text-sm font-semibold text-ink">
              <span className="relative h-1 w-32 overflow-hidden rounded-full bg-ink/10">
                <motion.span style={{ scaleX: bar }} className="absolute inset-0 origin-left rounded-full bg-ink" />
              </span>
              <span className="inline-flex items-center gap-1">
                {pinned ? "Keep scrolling" : "Swipe"} <ArrowRight aria-hidden className="size-4" />
              </span>
            </div>
          </Reveal>
        </div>

        <div
          ref={viewportRef}
          role="region"
          aria-label={`${eyebrow}: photo strip`}
          tabIndex={0}
          className={cn(
            "no-scrollbar relative mt-10 snap-x snap-mandatory overflow-x-auto overscroll-x-contain focus-visible:outline-offset-[-4px] lg:mt-14",
            pinned && "snap-none overflow-x-visible",
          )}
        >
          <motion.div
            ref={trackRef}
            style={pinned ? { x } : undefined}
            className="flex w-max gap-(--gap) [--gap:1rem] [--h:300px] sm:[--gap:1.5rem] sm:[--h:400px] lg:[--h:50svh]"
          >
            {/* Lines the first photo up with the page container's left edge. */}
            <span
              aria-hidden
              className="shrink-0"
              style={{ width: "max(calc(clamp(1.25rem, 4vw, 3rem) - var(--gap)), calc((100vw - 88rem) / 2 + 3rem - var(--gap)))" }}
            />
            {items.map((item, i) => (
              <figure key={item.id} className="group shrink-0 snap-start">
                <div
                  className="relative overflow-hidden rounded-4xl bg-sand shadow-soft"
                  style={{ height: "var(--h)", width: `min(calc(var(--h) * ${ratios[item.shape]}), 82vw)` }}
                >
                  <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]">
                    {item.media}
                  </div>
                  <span className="absolute left-4 top-4 z-2 rounded-full bg-paper/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink backdrop-blur">
                    {item.kicker}
                  </span>
                </div>
                <figcaption className="mt-4 flex items-baseline gap-3">
                  <span className="font-mono text-xs text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-lg font-bold tracking-tight text-ink">{item.caption}</span>
                </figcaption>
              </figure>
            ))}
            <span aria-hidden className="w-[clamp(0.25rem,4vw,3rem)] shrink-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
