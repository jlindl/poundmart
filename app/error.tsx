"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { AmazonButton } from "@/components/ui/amazon-link";
import { Button, ButtonLink } from "@/components/ui/button";
import { amazon } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section aria-label="Something went wrong" className="relative overflow-x-clip bg-cream pt-[var(--header-h)]">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="container-x relative grid min-h-[70svh] items-center gap-14 pb-24 pt-10 sm:pt-14 grid-cols-1 lg:grid-cols-12 lg:pt-16">
        <div className="lg:col-span-7">
          <Reveal y={12}>
            <span className="eyebrow inline-flex items-center gap-2 text-ink-soft">
              <span aria-hidden className="size-1.5 rounded-full bg-watermelon" />
              Something went wrong
            </span>
          </Reveal>
          <SplitHeading
            as="h1"
            immediate
            delay={0.1}
            text="Well, that wasn't *in the bundle*."
            className="type-display mt-6 max-w-[13ch] text-[clamp(2.8rem,6.4vw,6.5rem)] text-ink"
            accentClassName="text-ink-soft"
          />
          <Reveal y={20} delay={0.35}>
            <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-ink-muted sm:text-xl">
              A hiccup stopped this page from loading properly. Give it another go, or head somewhere reliably lovely. Your Amazon
              basket is safe either way.
            </p>
          </Reveal>
          <Reveal y={20} delay={0.45} className="mt-9 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => retry()}
              variant="sun"
              size="lg"
              iconLeft={<RotateCcw aria-hidden className="relative size-[1.1em] transition-transform duration-500 group-hover/btn:-rotate-180" />}
            >
              Try again
            </Button>
            <ButtonLink href="/" variant="outline" size="lg">
              Back to home
            </ButtonLink>
            <AmazonButton href={amazon.store()} placement="error" variant="ghost" size="lg" showBag={false}>
              Shop on Amazon
            </AmazonButton>
          </Reveal>
          {error.digest && (
            <p className="mt-8 font-mono text-xs text-ink-muted">
              Error reference: <span className="select-all">{error.digest}</span>
            </p>
          )}
        </div>

        <div aria-hidden className="relative mx-auto grid aspect-square w-full max-w-[380px] place-items-center lg:col-span-5">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.2 }}
            className="absolute inset-[8%] rounded-full bg-sun shadow-glow"
          />
          <motion.div
            animate={reduce ? undefined : { rotate: [0, -10, 9, -6, 4, 0], y: [0, -6, 0, -3, 0, 0] }}
            transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.8, delay: 1.2 }}
            className="relative w-[52%]"
          >
            <Image src="/brand/mark.png" alt="" width={278} height={278} priority className="h-auto w-full" />
          </motion.div>
          <motion.span
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
            className="absolute right-[4%] top-[6%] rotate-12 rounded-full bg-ink px-4 py-2 font-display text-sm font-bold text-cream shadow-lift"
          >
            Whoops!
          </motion.span>
        </div>
      </div>
    </section>
  );
}
