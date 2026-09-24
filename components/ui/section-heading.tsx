import type { ReactNode } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * Eyebrow + animated headline + optional intro. Wrap accent words in *asterisks*.
 * `tone="light"` for dark sections.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "dark",
  as = "h2",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  as?: "h1" | "h2";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-5", align === "center" && "items-center text-center", className)}>
      {eyebrow && (
        <Reveal y={12}>
          <span
            className={cn(
              "eyebrow inline-flex items-center gap-2",
              tone === "dark" ? "text-ink-soft" : "text-sun",
            )}
          >
            <span aria-hidden className={cn("size-1.5 rounded-full", tone === "dark" ? "bg-sun-deep" : "bg-sun")} />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <SplitHeading
        as={as}
        text={title}
        className={cn(
          "type-display max-w-[18ch] text-[clamp(2.4rem,5.6vw,4.9rem)]",
          align === "center" && "mx-auto",
          tone === "dark" ? "text-ink" : "text-cream",
        )}
        accentClassName={tone === "dark" ? "text-ink-soft" : "text-sun"}
      />
      {intro && (
        <Reveal delay={0.15} y={16}>
          <div
            className={cn(
              "max-w-[56ch] text-lg leading-relaxed",
              align === "center" && "mx-auto",
              tone === "dark" ? "text-ink-muted" : "text-cream/75",
            )}
          >
            {intro}
          </div>
        </Reveal>
      )}
      {children}
    </div>
  );
}
