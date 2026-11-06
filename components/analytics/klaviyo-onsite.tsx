"use client";

import Script from "next/script";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { CONSENT_EVENT, CONSENT_KEY } from "@/lib/gtag";
import { newsletter } from "@/lib/newsletter";

/**
 * Klaviyo's onsite script (klaviyo.js), which shows the Bundle Drop pop-up
 * built in Klaviyo. It sets Klaviyo's __kla_id cookie, so it only loads once
 * the visitor has clicked "Accept" in the cookie banner (UK PECR), straight
 * away if they accept mid-visit. If they later reject, Klaviyo's cookie is
 * cleared and the page reloads so the script stops running.
 *
 * The inline sign-up forms do not need this script and work for everyone.
 */

function readConsent(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Remove Klaviyo's cookies on every domain level it may have used. */
function clearKlaviyoCookies() {
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = ["", host];
  for (let i = 1; i < parts.length - 1; i++) domains.push(`.${parts.slice(i).join(".")}`);
  for (const name of ["__kla_id", "__kle_id"]) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
  try {
    window.localStorage.removeItem("klaviyoOnsite");
    window.localStorage.removeItem("__kl_key");
  } catch {
    /* storage blocked: nothing stored */
  }
}

export function KlaviyoOnsite() {
  const consent = useSyncExternalStore(subscribe, readConsent, () => null);
  const granted = consent === "granted";
  const loaded = useRef(false);

  useEffect(() => {
    if (granted) {
      loaded.current = true;
    } else if (loaded.current) {
      // Consent withdrawn after Klaviyo ran on this page: clear it and reload without it.
      clearKlaviyoCookies();
      window.location.reload();
    }
  }, [granted]);

  if (!newsletter.companyId || !granted) return null;

  const id = encodeURIComponent(newsletter.companyId);
  return (
    <Script
      id="klaviyo-onsite"
      src={`https://static.klaviyo.com/onsite/js/${id}/klaviyo.js?company_id=${id}`}
      strategy="lazyOnload"
    />
  );
}
