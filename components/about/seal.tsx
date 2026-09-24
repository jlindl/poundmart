import Image from "next/image";
import { cn } from "@/lib/utils";

const tones = {
  sun: { disc: "bg-sun", text: "fill-ink-deep", core: "bg-cream" },
  ink: { disc: "bg-ink", text: "fill-sun", core: "bg-cream" },
  cream: { disc: "bg-cream", text: "fill-ink", core: "bg-sun" },
} as const;

/**
 * A slowly rotating circular "seal" of text around the PoundMart cart mark.
 * Decorative: hidden from assistive tech. Needs a unique `id` per page for the SVG path.
 */
export function Seal({
  id,
  text,
  tone = "sun",
  className,
}: {
  id: string;
  text: string;
  tone?: keyof typeof tones;
  className?: string;
}) {
  const t = tones[tone];
  const pathId = `seal-path-${id}`;
  return (
    <div aria-hidden className={cn("relative aspect-square select-none rounded-full shadow-lift", t.disc, className)}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-spin-slow">
        <defs>
          <path id={pathId} d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
        </defs>
        <text className={cn("font-display text-[15px] font-bold uppercase tracking-[0.2em]", t.text)}>
          <textPath href={`#${pathId}`} textLength="498" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <div className={cn("absolute inset-[27%] grid place-items-center rounded-full", t.core)}>
        <Image src="/brand/mark.png" alt="" width={278} height={278} className="w-[68%] transition-transform duration-500" />
      </div>
    </div>
  );
}
