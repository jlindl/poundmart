"use client";

import Image from "next/image";
import {
  motion,
  useInView,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn, parseAccent } from "@/lib/utils";

type Choice = "auto" | "play" | "pause";

const controlClass =
  "group inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-sun hover:bg-sun hover:text-ink-deep focus-visible:outline-sun active:scale-95";

/**
 * The brand film, revealed by scroll: a rounded window that opens (clip-path)
 * to full bleed while the footage settles from a zoom. Pinned while it opens.
 * Plays muted when in view; sound turns captions on. Reduced motion: a still
 * frame with a play button, no scroll effects.
 */
export function FilmReveal({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(sectionRef, { amount: 0.3 });
  const [choice, setChoice] = useState<Choice>("auto");
  const [muted, setMuted] = useState(true);
  const [visible, setVisible] = useState(false);

  const shouldPlay = inView && (choice === "play" || (choice === "auto" && !reduce));

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end end"] });
  const insetY = useTransform(scrollYProgress, [0.2, 0.62], [12, 0]);
  const insetX = useTransform(scrollYProgress, [0.2, 0.62], [14, 0]);
  const radius = useTransform(scrollYProgress, [0.2, 0.62], [44, 0]);
  const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;
  const scale = useTransform(scrollYProgress, [0.15, 0.75], [1.3, 1]);
  const captionOpacity = useTransform(scrollYProgress, [0.58, 0.8], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.58, 0.8], [48, 0]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    const track = v.textTracks[0];
    if (track) track.mode = muted ? "hidden" : "showing";
    if (shouldPlay) {
      v.play().catch(() => {
        /* autoplay can be refused (e.g. data saver); the still frame stays */
      });
    } else {
      v.pause();
    }
  }, [shouldPlay, muted]);

  const segments = parseAccent(title);

  return (
    <section ref={sectionRef} aria-labelledby="film-title" className="relative h-[190svh] bg-cream motion-reduce:h-auto [&_:focus-visible]:outline-sun">
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden motion-reduce:static">
        <motion.div
          style={reduce ? undefined : { clipPath }}
          className="relative h-full w-full overflow-hidden bg-ink-deep will-change-[clip-path]"
        >
          <motion.div style={reduce ? undefined : { scale }} className="absolute inset-0">
            <Image
              src="/brand/family-bundle-poster.png"
              alt="A family on their sofa, laughing as they open a PoundMart value bundle"
              fill
              sizes="100vw"
              className="object-cover object-[50%_60%]"
            />
            <video
              ref={videoRef}
              className={cn(
                "absolute inset-0 size-full object-cover transition-opacity duration-700",
                visible ? "opacity-100" : "opacity-0",
              )}
              muted
              loop
              playsInline
              preload="none"
              aria-label="PoundMart brand film: a family unboxing a great value toothpaste bundle"
              onPlaying={() => setVisible(true)}
            >
              <source src="/brand/brand-film.mp4" type="video/mp4" />
              <track kind="captions" src="/brand/brand-film.vtt" srcLang="en" label="English" />
            </video>
          </motion.div>

          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink-night/90 via-ink-night/25 to-ink-night/10" />

          <div className="absolute inset-x-0 bottom-0 z-2">
            <div className="container-x flex flex-col gap-6 pb-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:pb-16">
              <motion.div style={reduce ? undefined : { opacity: captionOpacity, y: captionY }} className="max-w-3xl">
                <p className="eyebrow inline-flex items-center gap-2 text-sun">
                  <span aria-hidden className="size-1.5 rounded-full bg-sun" />
                  {eyebrow}
                </p>
                <h2 id="film-title" className="type-display mt-4 text-[clamp(2.4rem,6.4vw,6rem)] text-cream">
                  {segments.map((s, i) =>
                    s.accent ? (
                      <span key={i} className="accent-serif pr-[0.06em] text-sun">
                        {s.text}
                      </span>
                    ) : (
                      <span key={i}>{s.text}</span>
                    ),
                  )}
                </h2>
                <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-cream/80 sm:text-lg">{text}</p>
              </motion.div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  className={controlClass}
                  onClick={() => setChoice(shouldPlay ? "pause" : "play")}
                >
                  {shouldPlay ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
                  {shouldPlay ? "Pause film" : "Play film"}
                </button>
                <button
                  type="button"
                  className={controlClass}
                  onClick={() => {
                    setMuted((m) => !m);
                    if (!shouldPlay) setChoice("play");
                  }}
                >
                  {muted ? <VolumeX aria-hidden className="size-4" /> : <Volume2 aria-hidden className="size-4" />}
                  {muted ? "Sound on" : "Sound off"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
