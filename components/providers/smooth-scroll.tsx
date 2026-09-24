"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";

/** Resets scroll to the top on route change (Lenis otherwise keeps its position). */
function RouteScrollReset() {
  const lenis = useLenis();
  const pathname = usePathname();
  useEffect(() => {
    if (!window.location.hash) lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  // Respect the OS setting: no smooth-scroll hijacking for reduced-motion users.
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.09, wheelMultiplier: 1, anchors: { offset: -96 }, allowNestedScroll: true }}>
      <RouteScrollReset />
      {children}
    </ReactLenis>
  );
}
