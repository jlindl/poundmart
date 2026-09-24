"use client";

import { ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";

export function BackToTop() {
  const lenis = useLenis();
  return (
    <button
      type="button"
      onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
      className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-cream/20 px-4 py-2 font-semibold text-cream/80 transition-colors hover:border-sun hover:text-sun"
    >
      Back to top
      <ArrowUp className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
    </button>
  );
}
