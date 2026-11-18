"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_KEY, setConsent } from "@/lib/gtag";

/**
 * Cookie consent popup, centred over a dimmed page. Accept and Reject carry equal weight (ICO guidance);
 * analytics and Klaviyo cookies are only set after "Accept". Reopened from the footer via
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

  const button = "flex-1 rounded-full border border-ink/25 px-4 py-3 text-sm font-semibold transition-colors hover:bg-ink/5";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        className="w-full max-w-md rounded-3xl border border-ink/10 bg-cream p-6 text-center text-ink shadow-[0_32px_80px_-20px_rgba(1,25,44,0.6)] md:p-8"
      >
        <h2 id="cookie-title" className="text-lg font-semibold text-ink">
          Cookies
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          We use analytics cookies to see which pages and bundles people find useful, and a Klaviyo cookie to show our
          newsletter sign-up pop-up. They are only set if you accept. See our{" "}
          <Link href="/cookies" className="font-medium text-ink underline underline-offset-2">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => choose("denied")} className={button}>
            Reject
          </button>
          <button type="button" onClick={() => choose("granted")} className={button}>
            Accept
          </button>
        </div>
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
