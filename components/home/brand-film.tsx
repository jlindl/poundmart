"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { AmazonButton } from "@/components/ui/amazon-link";
import { cn } from "@/lib/utils";

const QUOTE = [
  { text: "It's", accent: false },
  { text: "here.", accent: false },
  { text: "Let's", accent: true },
  { text: "open", accent: true },
  { text: "it.", accent: true },
];

export function BrandFilm({ storeHref }: { storeHref: string }) {
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const inView = useInView(frameRef, { amount: 0.35 });
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);

  // Autoplay (muted) only while on screen, and never for reduced-motion users unless they press play.
  const shouldPlay = inView && (userPaused === null ? !reduce : !userPaused);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (shouldPlay) v.play().catch(() => undefined);
    else v.pause();
  }, [shouldPlay, muted]);

  // Scroll: the film grows from an inset card to (almost) full bleed.
  const { scrollYProgress: grow } = useScroll({ target: frameRef, offset: ["start end", "center center"] });
  const ix = useTransform(grow, [0, 1], [9, 0]);
  const iy = useTransform(grow, [0, 1], [7, 0]);
  const radius = useTransform(grow, [0, 1], [64, 28]);
  const clipPath = useMotionTemplate`inset(${iy}% ${ix}% ${iy}% ${ix}% round ${radius}px)`;
  const innerScale = useTransform(grow, [0, 1], [1.18, 1]);

  // Scroll: the quote lights up word by word.
  const { scrollYProgress: read } = useScroll({ target: quoteRef, offset: ["start 0.92", "start 0.4"] });

  function togglePlay() {
    setUserPaused(playing);
  }
  function toggleSound() {
    const next = !muted;
    setMuted(next);
    if (!next) setUserPaused(false);
  }

  return (
    <section aria-labelledby="brand-film-title" className="grain relative overflow-clip bg-ink-night py-24 text-cream md:py-32 lg:py-40">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-10 size-[36rem] rounded-full bg-ink-soft/30 blur-3xl" />
      <div className="container-x relative z-[2]">
        <span className="eyebrow inline-flex items-center gap-2 text-sun">
          <span aria-hidden className="size-1.5 rounded-full bg-sun" />
          The brand film
        </span>
        <h2
          id="brand-film-title"
          ref={quoteRef}
          aria-label="It's here. Let's open it."
          className="mt-6 max-w-[14ch] font-serif text-[clamp(3rem,8.4vw,8.5rem)] italic leading-[0.95] tracking-[-0.02em]"
        >
          <span aria-hidden>
            <span className="mr-[0.08em] text-sun/70">&ldquo;</span>
            {QUOTE.map((w, i) => (
              <QuoteWord key={i} progress={read} index={i} total={QUOTE.length} accent={w.accent} reduce={!!reduce}>
                {w.text}
              </QuoteWord>
            ))}
            <span className="text-sun/70">&rdquo;</span>
          </span>
        </h2>
      </div>

      {/* The film */}
      <div className="relative z-[2] mt-12 px-3 md:mt-16 md:px-4">
        <motion.div
          ref={frameRef}
          style={reduce ? { clipPath: "inset(0% 0% 0% 0% round 28px)" } : { clipPath }}
          className="relative mx-auto aspect-video w-full max-w-[120rem] overflow-hidden bg-ink-deep md:aspect-[1770/753]"
        >
          <motion.div style={reduce ? undefined : { scale: innerScale }} className="absolute inset-0">
            <video
              ref={videoRef}
              className="absolute inset-0 size-full object-cover object-[80%_50%] md:object-center [&::cue]:bg-[rgb(1_25_44/0.78)] [&::cue]:font-sans [&::cue]:text-[#FBF7EE]"
              muted
              loop
              playsInline
              preload="none"
              aria-label="PoundMart brand film: a family on the sofa opens a PoundMart bundle together"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onPlaying={() => setStarted(true)}
            >
              <source src="/brand/brand-film.mp4" type="video/mp4" />
              <track kind="captions" src="/brand/brand-film.vtt" srcLang="en" label="English" default />
            </video>
            <Image
              src="/brand/family-bundle-poster.png"
              alt=""
              fill
              sizes="100vw"
              className={cn(
                "object-cover object-[80%_50%] transition-opacity duration-700 md:object-center",
                started ? "pointer-events-none opacity-0" : "opacity-100",
              )}
            />
          </motion.div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-night/60 to-transparent"
          />

          <AnimatePresence>
            {!playing && (
              <motion.button
                key="big-play"
                type="button"
                onClick={() => setUserPaused(false)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-sun text-ink-deep shadow-glow transition-transform duration-300 hover:scale-110 focus-visible:outline-sun md:size-24"
                aria-label="Play the brand film"
              >
                <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-sun/40 [animation-duration:2.4s]" />
                <Play aria-hidden className="relative ml-1 size-8 fill-current transition-transform duration-300 group-hover:scale-110" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Controls + CTA */}
      <Reveal
        y={20}
        className="container-x relative z-[2] mt-8 flex flex-col gap-8 md:mt-10 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-4 text-sm font-semibold text-cream backdrop-blur transition-[background-color,translate] duration-300 hover:-translate-y-0.5 hover:bg-cream/20 focus-visible:outline-sun"
          >
            {playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
            {playing ? "Pause film" : "Play film"}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-4 text-sm font-semibold text-cream backdrop-blur transition-[background-color,translate] duration-300 hover:-translate-y-0.5 hover:bg-cream/20 focus-visible:outline-sun"
          >
            {muted ? <VolumeX aria-hidden className="size-4" /> : <Volume2 aria-hidden className="size-4" />}
            {muted ? "Turn sound on" : "Mute sound"}
          </button>
          <span className="text-sm text-cream/70">Captions on. Eight seconds of pure unboxing joy.</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <p className="max-w-[30ch] text-cream/80">
            <span className="accent-serif text-xl text-sun">&ldquo;That&apos;s a great value bundle.&rdquo;</span>
            <span className="block text-sm text-cream/70">Your turn. Every bundle is waiting on Amazon.</span>
          </p>
          <AmazonButton href={storeHref} placement="home-film" size="lg" className="focus-visible:outline-sun">
            Unbox your own
          </AmazonButton>
        </div>
      </Reveal>
    </section>
  );
}

function QuoteWord({
  children,
  progress,
  index,
  total,
  accent,
  reduce,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
  accent: boolean;
  reduce: boolean;
}) {
  const start = index / total;
  const opacity = useTransform(progress, [start, start + 1 / total], [0.14, 1]);
  const y = useTransform(progress, [start, start + 1 / total], [18, 0]);
  return (
    <motion.span style={reduce ? undefined : { opacity, y }} className={cn("mr-[0.22em] inline-block", accent ? "text-sun" : "text-cream")}>
      {children}
    </motion.span>
  );
}
