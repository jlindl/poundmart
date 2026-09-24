"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState, useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
import type { FlavourTile } from "@/components/shop/shop-data";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Six flavour tiles. On desktop they form a horizontal accordion that opens on
 * hover, focus or click; on smaller screens every tile is shown in full.
 */
export function FlavourGuide({ tiles }: { tiles: FlavourTile[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const isLg = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );

  return (
    <ul className="@container flex flex-col gap-4 lg:h-[36rem] lg:flex-row lg:gap-3">
      {tiles.map((t, i) => {
        const open = !isLg || active === i;
        const collapsed = isLg && active !== i;
        return (
          <motion.li
            key={t.name}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.07 }}
            onMouseEnter={() => isLg && setActive(i)}
            className="group relative overflow-hidden rounded-4xl shadow-soft transition-[flex-grow,box-shadow] duration-700 ease-[var(--ease-out-expo)] hover:shadow-lift lg:min-w-[4.5rem] lg:basis-0"
            style={{ background: t.soft, flexGrow: isLg ? (active === i ? 6 : 1) : undefined }}
          >
            <div
              aria-hidden
              className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-2xl transition-transform duration-700 group-hover:scale-110"
              style={{ background: t.colour }}
            />

            <h3 className="relative z-[2]">
              <button
                type="button"
                aria-expanded={isLg ? active === i : undefined}
                aria-controls={`flavour-panel-${i}`}
                onClick={() => setActive(i)}
                onFocus={() => isLg && setActive(i)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 p-5 text-left sm:p-6",
                  collapsed && "lg:h-[36rem] lg:flex-col lg:justify-between lg:px-0 lg:py-7",
                )}
              >
                <span className="font-mono text-xs font-semibold tabular-nums text-ink/50">0{i + 1}</span>
                <span
                  className={cn(
                    "font-display text-xl font-bold leading-none tracking-tight text-ink sm:text-2xl",
                    collapsed && "lg:rotate-180 lg:whitespace-nowrap lg:[writing-mode:vertical-rl]",
                  )}
                >
                  {t.name}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "ml-auto size-4 shrink-0 rounded-full ring-4 ring-white/70 transition-transform duration-500",
                    collapsed ? "lg:ml-0" : "scale-125",
                  )}
                  style={{ background: t.colour }}
                />
              </button>
            </h3>

            <div
              id={`flavour-panel-${i}`}
              inert={!open}
              className={cn(
                "relative z-[1] grid gap-6 px-5 pb-6 transition-opacity duration-500 sm:px-6 lg:absolute lg:bottom-0 lg:left-0 lg:top-[4.75rem] sm:grid-cols-[1fr_13rem] sm:items-end lg:w-[calc((100cqw_-_3.75rem)*6/11)] lg:grid-cols-[1fr_13rem] lg:pb-7 xl:grid-cols-[1fr_17rem]",
                open ? "opacity-100 lg:delay-200" : "pointer-events-none opacity-0",
              )}
            >
              <div className="order-2 flex flex-col gap-4 sm:order-1 lg:pb-2">
                <p className="accent-serif text-[clamp(2rem,3.4vw,3.25rem)] leading-[1] text-ink">{t.pun}</p>
                <p className="max-w-[36ch] leading-relaxed text-ink/75">{t.line}</p>
                {t.foundIn.length > 0 && (
                  <div>
                    <p className="eyebrow mb-2.5 text-[10px] text-ink/60">Find it in</p>
                    <ul className="flex flex-wrap gap-2">
                      {t.foundIn.map((f) => (
                        <li key={f.slug}>
                          <Link
                            href={`/shop/${f.slug}`}
                            className="group/link inline-flex items-center gap-1.5 rounded-full bg-paper/85 px-3.5 py-2 text-sm font-semibold text-ink shadow-soft transition-colors duration-300 hover:bg-ink hover:text-cream"
                          >
                            {f.name}
                            <ArrowRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="relative order-1 aspect-square overflow-hidden rounded-3xl bg-paper shadow-lift sm:order-2">
                <Image
                  src={t.image.src}
                  alt={t.image.alt}
                  fill
                  sizes="(min-width: 1280px) 272px, (min-width: 640px) 208px, 90vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] hover:scale-105"
                />
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
