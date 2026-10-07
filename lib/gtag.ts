/**
 * Google Analytics 4 helpers. The tag is loaded by <GoogleAnalytics /> in the
 * root layout. `window.gtag` / `window.dataLayer` are typed in
 * components/ui/amazon-link.tsx, which already reports "amazon_click".
 *
 * The Measurement ID is public by design, so it is safe to default here. Set
 * NEXT_PUBLIC_GA_ID in Vercel to override it per environment.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-1DE44DYMNE";

/** localStorage key holding the visitor's cookie choice: "granted" | "denied". */
export const CONSENT_KEY = "cookie-consent";

/** Send a GA4 event. Safe to call before the tag loads and on the server. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

/** Apply a consent choice to GA (Consent Mode v2) and remember it. */
export function setConsent(choice: "granted" | "denied") {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* storage blocked: the choice still applies for this page view */
  }
  window.gtag?.("consent", "update", {
    analytics_storage: choice,
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  });
}
