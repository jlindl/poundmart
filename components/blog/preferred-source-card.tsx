/**
 * End-of-article prompt asking readers to add the site as a Google preferred
 * source. Inherits the page's text colour so it suits light or dark articles.
 * Uses the same link-only button as the footer (no third-party script).
 */
import type { CSSProperties } from "react";
import { PreferredSourceButton } from "@/components/layout/preferred-source-button";

type Props = {
  /** Brand name shown in the heading, e.g. "PoundMart". */
  name: string;
  /** Bare domain, e.g. "poundmart.co.uk". */
  domain: string;
  className?: string;
  style?: CSSProperties;
};

export function PreferredSourceCard({ name, domain, className, style }: Props) {
  return (
    <aside
      aria-label={`Follow ${name} on Google`}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "20px 22px",
        borderRadius: 16,
        border: "1px solid color-mix(in srgb, currentColor 16%, transparent)",
        background: "color-mix(in srgb, currentColor 4%, transparent)",
        ...style,
      }}
    >
      <div style={{ flex: "1 1 260px", minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>
          Found this useful? See more from {name} on Google.
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.5, opacity: 0.72 }}>
          Add us as a preferred source and our guides show up more often in your Google results.
        </p>
      </div>
      <PreferredSourceButton domain={domain} />
    </aside>
  );
}
