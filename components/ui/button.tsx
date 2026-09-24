import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "sun" | "ink" | "outline" | "ghost" | "light" | "glass";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const variants: Record<ButtonVariant, string> = {
  sun: "bg-sun text-ink-deep shadow-[0_1px_0_rgb(255_255_255/0.6)_inset,0_10px_30px_-10px_rgb(230_184_0/0.9)] hover:bg-[#ffd91a] hover:shadow-glow",
  ink: "bg-ink text-cream shadow-[0_10px_30px_-12px_rgb(4_64_108/0.8)] hover:bg-ink-deep",
  outline: "border-2 border-ink/15 text-ink hover:border-ink hover:bg-ink hover:text-cream",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-cream text-ink hover:bg-white shadow-[0_10px_30px_-12px_rgb(0_0_0/0.4)]",
  glass: "border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.95rem] gap-2",
  lg: "h-14 px-7 text-base gap-2.5",
  xl: "h-16 px-9 text-lg gap-3",
};

export function buttonClasses(variant: ButtonVariant = "sun", size: ButtonSize = "md", className?: string) {
  return cn(
    "group/btn relative inline-flex select-none items-center justify-center overflow-hidden rounded-full font-semibold tracking-[-0.01em]",
    "transition-[transform,translate,scale,background-color,box-shadow,color,border-color] duration-300 ease-[var(--ease-out-expo)]",
    "active:scale-[0.97] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

/** Diagonal shine that sweeps across the button on hover. */
function Shine() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover/btn:animate-shine group-hover/btn:opacity-100"
    />
  );
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** "arrow" for internal navigation, "external" for off-site. */
  icon?: "arrow" | "external" | "none";
  iconLeft?: ReactNode;
  className?: string;
  children: ReactNode;
};

function Inner({ children, icon, iconLeft }: Pick<Common, "children" | "icon" | "iconLeft">) {
  return (
    <>
      <Shine />
      {iconLeft}
      <span className="relative">{children}</span>
      {icon === "arrow" && (
        <ArrowRight aria-hidden className="relative size-[1.1em] transition-transform duration-300 group-hover/btn:translate-x-1" />
      )}
      {icon === "external" && (
        <ArrowUpRight
          aria-hidden
          className="relative size-[1.1em] transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
        />
      )}
    </>
  );
}

/** Internal link styled as a button. */
export function ButtonLink({
  href,
  variant,
  size,
  icon = "arrow",
  iconLeft,
  className,
  children,
  ...rest
}: Common & { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...rest}>
      <Inner icon={icon} iconLeft={iconLeft}>
        {children}
      </Inner>
    </Link>
  );
}

export function Button({
  variant,
  size,
  icon = "none",
  iconLeft,
  className,
  children,
  ...rest
}: Common & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      <Inner icon={icon} iconLeft={iconLeft}>
        {children}
      </Inner>
    </button>
  );
}
