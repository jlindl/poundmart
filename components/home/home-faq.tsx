"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { AmazonButton } from "@/components/ui/amazon-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import type { FaqItem } from "./types";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Homepage FAQs: one answer open at a time, animated height. */
export function HomeFaq({ items, storeHref }: { items: FaqItem[]; storeHref: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const id = useId();

  return (
    <section className="relative bg-paper py-24 md:py-32 lg:py-40">
      <div className="container-x grid gap-14 grid-cols-1 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
            <SectionHeading
              eyebrow="Good to know"
              title="Questions, *answered*."
              intro="How buying works, who sends your order and what's inside the box. Still curious? The full FAQ has more."
            />
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <AmazonButton href={storeHref} placement="home-faq" size="md">
                Shop on Amazon
              </AmazonButton>
              <Link href="/faq" className="group inline-flex items-center gap-1.5 rounded-full py-2 font-semibold text-ink">
                <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-sun-deep after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">
                  All FAQs
                </span>
                <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        <ul className="border-t border-line lg:col-span-7">
          {items.map((item, i) => {
            const isOpen = open === i;
            const qId = `${id}-q-${i}`;
            const aId = `${id}-a-${i}`;
            return (
              <li key={item.q} className="border-b border-line">
                <h3>
                  <button
                    id={qId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={aId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-6 rounded-2xl py-6 text-left"
                  >
                    <span
                      className={cn(
                        "font-display text-lg font-bold tracking-tight transition-colors duration-300 sm:text-xl",
                        isOpen ? "text-ink" : "text-ink-soft group-hover:text-ink",
                      )}
                    >
                      {item.q}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color,rotate] duration-500 ease-[var(--ease-spring)]",
                        isOpen
                          ? "rotate-45 border-sun bg-sun text-ink-deep"
                          : "border-ink/15 text-ink group-hover:border-ink group-hover:bg-ink group-hover:text-cream",
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h3>
                <motion.div
                  id={aId}
                  role="region"
                  aria-labelledby={qId}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[60ch] pb-7 pr-12 leading-relaxed text-ink-muted">{item.a}</p>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
