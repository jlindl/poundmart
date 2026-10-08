import type { Metadata } from "next";
import { CookieSettingsLink } from "@/components/analytics/cookie-banner";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How PoundMart uses cookies, Google Analytics and Vercel Web Analytics on poundmart.co.uk, and how to change your choice at any time.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <section className="container-x pt-36 pb-24">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow text-ink-muted">Last updated 8 October 2026</p>
        <h1 className="type-display mt-4 text-5xl text-ink">Cookie Policy</h1>
        <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink-soft">
          <p>
            Cookies are small text files a website stores on your device. This page explains the ones poundmart.co.uk uses and how to
            control them.
          </p>
          <h2 className="pt-4 text-2xl font-semibold text-ink">What we use</h2>
          <p>
            <strong className="text-ink">Analytics (only with your consent).</strong> We use Google Analytics 4, provided by Google Ireland
            Limited, to understand how people find and use the site, for example which pages and bundles are viewed and how often visitors
            click through to Amazon. Google Analytics sets first-party cookies named <code>_ga</code> and <code>_ga_&lt;ID&gt;</code> that
            last up to 2 years. These are only set if you click &quot;Accept&quot; in our cookie banner. If you click &quot;Reject&quot;, or
            make no choice, no analytics cookies are set and Google receives only basic, cookieless signals without identifiers.
          </p>
          <p>
            <strong className="text-ink">Visit counts (no cookies).</strong> We also use Vercel Web Analytics, provided by Vercel Inc., to
            count page views and see which pages are visited and where visitors come from. It does not set cookies or store anything on
            your device, and it does not identify you: visits are grouped using a short-lived hash of the request that resets every day.
          </p>
          <p>
            <strong className="text-ink">Your choice.</strong> We remember whether you accepted or rejected in your browser&apos;s local
            storage (key <code>cookie-consent</code>) so we do not ask on every page. This is not shared with anyone.
          </p>
          <p>
            We do not use advertising cookies. Orders are placed on Amazon, which has its own cookie policy for amazon.co.uk.
          </p>
          <h2 className="pt-4 text-2xl font-semibold text-ink">Changing your mind</h2>
          <p>
            You can change your choice at any time:{" "}
            <CookieSettingsLink className="font-medium text-ink underline underline-offset-2" />. You can also clear or block cookies in your
            browser settings.
          </p>
        </div>
      </div>
    </section>
  );
}
