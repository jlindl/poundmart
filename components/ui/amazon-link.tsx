"use client";

import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
  }
}

/** Fires an "amazon_click" event to whichever analytics are installed (GA4/GTM/Plausible). */
export function trackAmazonClick(detail: { placement: string; asin?: string; href: string }) {
  try {
    window.dataLayer?.push({ event: "amazon_click", ...detail });
    window.gtag?.("event", "amazon_click", detail);
    window.plausible?.("Amazon Click", { props: detail });
    window.dispatchEvent(new CustomEvent("amazon_click", { detail }));
  } catch {
    /* analytics must never block the click */
  }
}

type AmazonLinkProps = {
  href: string;
  /** Where on the site this link lives, e.g. "home-hero", "product-card". Sent with the click event. */
  placement: string;
  asin?: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;

/** Outbound link to Amazon: opens in a new tab and reports the click. */
export function AmazonLink({ href, placement, asin, children, className, onClick, ...rest }: AmazonLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener nofollow"
      data-placement={placement}
      data-asin={asin}
      className={className}
      onClick={(e) => {
        trackAmazonClick({ placement, asin, href });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Primary conversion button. Always says where it goes. */
export function AmazonButton({
  href,
  placement,
  asin,
  children = "Shop on Amazon",
  variant = "sun",
  size = "lg",
  className,
  showBag = true,
}: {
  href: string;
  placement: string;
  asin?: string;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  showBag?: boolean;
}) {
  return (
    <AmazonLink href={href} placement={placement} asin={asin} className={buttonClasses(variant, size, className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover/btn:animate-shine group-hover/btn:opacity-100"
      />
      {showBag && <ShoppingBag aria-hidden className="relative size-[1.1em] transition-transform duration-300 group-hover/btn:-rotate-12" />}
      <span className="relative">{children}</span>
      <ArrowUpRight
        aria-hidden
        className={cn("relative size-[1.1em] transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5")}
      />
      <span className="sr-only"> (opens Amazon in a new tab)</span>
    </AmazonLink>
  );
}
