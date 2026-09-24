import fs from "node:fs";
import path from "node:path";
import Image, { type ImageProps } from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const PUBLIC_DIR = path.join(process.cwd(), "public");

/** True when a root-relative path exists in /public (remote URLs always count as present). */
export function imageExists(src: string) {
  if (!src.startsWith("/")) return true;
  try {
    return fs.existsSync(path.join(PUBLIC_DIR, decodeURIComponent(src)));
  } catch {
    return false;
  }
}

/**
 * Branded stand-in for a photo that hasn't been shot yet.
 * It prints the exact file path to drop the real image into.
 */
export function ImagePlaceholder({
  src,
  hint,
  accent = "#FCD000",
  className,
  tone = "light",
}: {
  src?: string;
  hint?: string;
  accent?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      role="img"
      aria-label={hint ?? "Image coming soon"}
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center overflow-hidden text-center",
        tone === "light" ? "bg-sand text-ink" : "bg-ink-deep text-cream",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(120% 90% at 20% 10%, ${accent}55, transparent 60%), radial-gradient(90% 80% at 90% 100%, ${accent}33, transparent 60%)`,
        }}
      />
      <div aria-hidden className="dot-grid absolute inset-0 opacity-60" />
      <div aria-hidden className="absolute -right-10 -bottom-10 size-48 rounded-full border-[18px] opacity-20" style={{ borderColor: accent }} />
      <div className="relative flex max-w-[80%] flex-col items-center gap-2 px-4">
        <span className="grid size-11 place-items-center rounded-full bg-white/70 shadow-soft backdrop-blur">
          <ImageIcon className="size-5 opacity-70" aria-hidden />
        </span>
        {hint && <p className="font-display text-sm font-semibold leading-snug opacity-80">{hint}</p>}
        {src && process.env.NODE_ENV !== "production" && (
          <p className="max-w-full truncate rounded-full bg-white/60 px-2.5 py-1 font-mono text-[10px] opacity-70">{src}</p>
        )}
      </div>
    </div>
  );
}

type SmartImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  /** Describes the intended shot; shown on the placeholder until the file exists. */
  hint?: string;
  accent?: string;
  placeholderTone?: "light" | "dark";
};

/**
 * next/image that falls back to an ImagePlaceholder when a local file is missing.
 * Server Component only (checks the filesystem at render/build time).
 * Use with `fill` inside a positioned, sized parent.
 */
export function SmartImage({ src, alt, hint, accent, placeholderTone, className, ...rest }: SmartImageProps) {
  if (!imageExists(src)) {
    return <ImagePlaceholder src={src} hint={hint ?? alt} accent={accent} tone={placeholderTone} />;
  }
  return <Image src={src} alt={alt} className={className} {...rest} />;
}
