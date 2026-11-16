/**
 * "Add as a preferred source on Google" button. A plain link to Google's
 * official source-preferences deeplink, so it loads no third-party script.
 * It inherits the footer's text colour and draws a faint pill border from it,
 * so it sits on light or dark footers. Pass className for hover styles.
 * https://developers.google.com/search/docs/appearance/preferred-sources
 */

type Props = {
  /** Bare domain, e.g. "example.co.uk". Must be the whole domain, not a subfolder. */
  domain: string;
  className?: string;
};

export function PreferredSourceButton({ domain, className }: Props) {
  return (
    <a
      href={`https://www.google.com/preferences/source?q=${encodeURIComponent(domain)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Add us as a preferred source on Google (opens in a new tab)"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        width: "fit-content",
        minHeight: 40,
        padding: "8px 14px",
        borderRadius: 999,
        border: "1px solid color-mix(in srgb, currentColor 28%, transparent)",
        fontSize: 13,
        lineHeight: 1.2,
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      <span>
        Add as a preferred source on <strong style={{ fontWeight: 600 }}>Google</strong>
      </span>
    </a>
  );
}
