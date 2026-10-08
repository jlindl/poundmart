import Script from "next/script";
import { CONSENT_KEY, GA_ID, QUEUE_KEY } from "@/lib/gtag";

/**
 * Google Analytics 4 with Consent Mode v2. Everything defaults to "denied"
 * (UK PECR), so no analytics cookies are set until the visitor accepts in the
 * cookie banner. A visitor who accepted before is restored from localStorage
 * before the tag fires. Events queued by track() before this runs are sent
 * straight after the config.
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null;

  const init = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
var c = null;
try { c = localStorage.getItem(${JSON.stringify(CONSENT_KEY)}); } catch (e) {}
var g = c === "granted" ? "granted" : "denied";
gtag("consent", "default", {
  analytics_storage: g,
  ad_storage: g,
  ad_user_data: g,
  ad_personalization: g,
  wait_for_update: 500
});
gtag("js", new Date());
gtag("config", ${JSON.stringify(GA_ID)});
var q = window[${JSON.stringify(QUEUE_KEY)}] || [];
window[${JSON.stringify(QUEUE_KEY)}] = [];
q.forEach(function (e) { gtag("event", e[0], e[1]); });
`;

  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive">
        {init}
      </Script>
      <Script id="ga4-src" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
    </>
  );
}
