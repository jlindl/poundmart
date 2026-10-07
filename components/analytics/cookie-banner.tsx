"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_KEY, setConsent } from "@/lib/gtag";

/**
 * Cookie consent banner. Accept and Reject carry equal weight (ICO guidance);
 * analytics cookies are only set after "Accept". Reopened from the footer via
 * the "cookie-consent-open" event.
 */
export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(CONSENT_KEY);
    } catch {
      /* storage blocked: ask every visit */
    }
    // Deferred one tick so the banner never blocks first paint.
    const first = window.setTimeout(() => {
      if (stored !== "granted" && stored !== "denied") setOpen(true);
    }, 0);
    const reopen = () => setOpen(true);
    window.addEventListener("cookie-consent-open", reopen);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener("cookie-consent-open", reopen);
    };
  }, []);

  if (!open) return null;

  const choose = (choice: "granted" | "denied") => {
    setConsent(choice);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-lg rounded-3xl border border-ink/10 bg-cream p-5 text-ink shadow-[0_24px_60px_-20px_rgba(1,25,44,0.45)] md:inset-x-auto md:right-6 md:bottom-6"
    >
      <p className="text-sm leading-relaxed text-ink-soft">
        We use analytics cookies to see which pages and bundles people find useful, so we can improve the site. They are only set if
        you accept. See our{" "}
        <Link href="/cookies" className="font-medium text-ink underline underline-offset-2">
          Cookie Policy
        </Link>
        .
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="flex-1 rounded-full border border-ink/25 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-ink/5"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="flex-1 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

/** Footer link that reopens the banner so visitors can change their mind. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("cookie-consent-open"))} className={className}>
      Cookie settings
    </button>
  );
}
