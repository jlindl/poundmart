"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { newsletterReady, subscribe } from "@/lib/newsletter";
import { track } from "@/lib/gtag";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "done" | "error";

/**
 * Email sign-up for The Bundle Drop. `tone="dark"` sits on navy (footer),
 * `tone="light"` on cream or sun backgrounds.
 */
export function SignupForm({
  source,
  tone = "light",
  className,
}: {
  /** Where on the site the form lives, recorded on the Klaviyo profile. */
  source: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const dark = tone === "dark";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();
    if (!value || status === "sending") return;
    setStatus("sending");
    try {
      const ok = await subscribe(value, source);
      setStatus(ok ? "done" : "error");
      if (ok) track("sign_up", { method: "newsletter", placement: source });
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div
        role="status"
        className={cn(
          "flex items-start gap-3 rounded-3xl p-5",
          dark ? "bg-cream/10 text-cream" : "bg-paper text-ink shadow-soft",
          className,
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sun text-ink-deep">
          <Check className="size-4" aria-hidden />
        </span>
        <p className="leading-relaxed">
          <strong className="font-semibold">You&apos;re in.</strong> The next Bundle Drop lands in your inbox soon. Keep an eye out for an
          email from PoundMart.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)}>
      <label htmlFor={`${id}-email`} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-[1.75rem] p-1.5 sm:flex-row sm:items-center sm:rounded-full",
          dark ? "bg-cream/10 ring-1 ring-cream/15 focus-within:ring-sun" : "bg-paper shadow-soft ring-1 ring-line focus-within:ring-ink",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 px-4">
          <Mail aria-hidden className={cn("size-4 shrink-0", dark ? "text-sun" : "text-ink-muted")} />
          <input
            id={`${id}-email`}
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            disabled={!newsletterReady || status === "sending"}
            className={cn(
              "h-11 w-full min-w-0 bg-transparent text-base outline-none disabled:cursor-not-allowed",
              dark ? "text-cream placeholder:text-cream/45" : "text-ink placeholder:text-ink-muted/70",
            )}
          />
        </div>
        <button
          type="submit"
          disabled={!newsletterReady || status === "sending"}
          className={buttonClasses("sun", "md", "w-full shrink-0 sm:w-auto")}
        >
          {status === "sending" ? (
            <>
              <Loader2 aria-hidden className="relative size-4 animate-spin" />
              <span className="relative">Signing you up</span>
            </>
          ) : (
            <span className="relative">Get the deals</span>
          )}
        </button>
      </div>
      <p aria-live="polite" className={cn("mt-3 px-2 text-xs leading-relaxed", dark ? "text-cream/55" : "text-ink-muted")}>
        {status === "error" ? (
          <span className={dark ? "text-sun" : "font-medium text-watermelon"}>
            That didn&apos;t go through. Check the email address and try again.
          </span>
        ) : !newsletterReady ? (
          "Sign-ups open very soon."
        ) : (
          <>
            One email a week. Unsubscribe any time.{" "}
            <Link href="/newsletter#privacy" className="underline underline-offset-2 hover:opacity-80">
              How we use your email
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
