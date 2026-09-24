import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Seamless infinite ticker (pure CSS). Content is duplicated once; the copy is hidden from screen readers. */
export function Marquee({
  children,
  className,
  itemClassName,
  duration = 40,
  reverse = false,
  pauseOnHover = true,
  fade = true,
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  fade?: boolean;
}) {
  return (
    <div className={cn("group relative flex overflow-hidden", fade && "mask-fade-x", className)}>
      <div
        className={cn(
          "flex w-max shrink-0",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className={cn("flex shrink-0 items-center", itemClassName)}>{children}</div>
        <div className={cn("flex shrink-0 items-center", itemClassName)} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
