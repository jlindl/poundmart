"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[18px]" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.73 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="currentColor">
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[18px]" fill="currentColor">
      <path d="M13.5 21.95V14.2h2.6l.39-3.02H13.5V9.25c0-.87.24-1.47 1.5-1.47h1.6v-2.7a21.4 21.4 0 0 0-2.33-.12c-2.31 0-3.89 1.41-3.89 4v2.22H7.77v3.02h2.61v7.75h3.12Z" />
    </svg>
  );
}

const circle =
  "grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-paper text-ink shadow-soft transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-[var(--ease-spring)] hover:-translate-y-1 hover:border-ink hover:bg-ink hover:text-cream hover:shadow-lift focus-visible:-translate-y-1 active:scale-95";

function ShareLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} title={label} className={circle}>
      {children}
    </a>
  );
}

/** Copy link (with a toast), WhatsApp, X and Facebook share links. */
export function ShareRow({
  url,
  title,
  className,
  label = "Share this guide",
}: {
  url: string;
  title: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const reduce = useReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2400);
  }

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  return (
    <div className={className}>
      <p className="eyebrow mb-3 text-ink-soft">{label}</p>
      <ul className="flex flex-wrap items-center gap-2.5">
        <li>
          <button type="button" onClick={copy} aria-label="Copy link to this guide" title="Copy link" className={cn(circle, copied && "border-mint bg-mint text-white hover:border-mint hover:bg-mint")}>
            {copied ? <Check aria-hidden className="size-[18px]" /> : <Link2 aria-hidden className="size-[18px]" />}
          </button>
        </li>
        <li>
          <ShareLink href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} label="Share on WhatsApp">
            <WhatsAppIcon />
          </ShareLink>
        </li>
        <li>
          <ShareLink href={`https://x.com/intent/tweet?text=${t}&url=${u}`} label="Share on X">
            <XIcon />
          </ShareLink>
        </li>
        <li>
          <ShareLink href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} label="Share on Facebook">
            <FacebookIcon />
          </ShareLink>
        </li>
      </ul>

      {/* Toast: the live region is always mounted so the announcement is reliable. */}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
        <AnimatePresence>
          {copied && (
            <motion.p
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream shadow-lift"
            >
              <span className="grid size-6 place-items-center rounded-full bg-sun text-ink-deep">
                <Check aria-hidden className="size-3.5" />
              </span>
              Link copied. Share away!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
