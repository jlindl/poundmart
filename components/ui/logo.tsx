import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** The real PoundMart logo (590×232). `tone="light"` swaps in the reversed version for dark backgrounds. */
export function Logo({ className, tone = "dark", priority = false }: { className?: string; tone?: "dark" | "light"; priority?: boolean }) {
  return (
    <Link href="/" aria-label="PoundMart home" className={cn("group inline-flex shrink-0 items-center", className)}>
      <Image
        src={tone === "light" ? "/brand/logo-white.png" : "/brand/logo.png"}
        alt="PoundMart"
        width={590}
        height={232}
        priority={priority}
        className="h-full w-auto transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-2 group-hover:scale-[1.04]"
      />
    </Link>
  );
}
