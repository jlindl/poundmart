import Image from "next/image";
import type { ReactNode } from "react";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type Pic = { src: string; alt: string };

function Frame({ pic, className, sizes }: { pic: Pic; className?: string; sizes: string }) {
  return (
    <figure className={cn("group relative overflow-hidden rounded-[1.75rem] bg-sand shadow-soft sm:rounded-4xl", className)}>
      <Image
        src={pic.src}
        alt={pic.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105"
      />
    </figure>
  );
}

/**
 * Editorial interlude: a headline beside two columns of lifestyle photos that
 * travel in opposite directions as you scroll.
 */
export function ImageMosaic({
  eyebrow,
  title,
  body,
  pics,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  body: string;
  pics: Pic[];
  children?: ReactNode;
  className?: string;
}) {
  const [a, b, c, d] = pics;
  const sizes = "(min-width: 1024px) 28vw, 45vw";
  return (
    <section className={cn("relative overflow-hidden py-24 lg:py-36", className)}>
      <div className="container-x grid items-center gap-14 grid-cols-1 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={eyebrow} title={title} intro={body} />
          {children && (
            <Reveal delay={0.25} y={16} className="mt-8">
              {children}
            </Reveal>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:col-span-7">
          <Parallax offset={50} className="flex flex-col gap-3 sm:gap-6">
            {a && <Frame pic={a} sizes={sizes} className="aspect-[4/5]" />}
            {b && <Frame pic={b} sizes={sizes} className="aspect-square" />}
          </Parallax>
          <Parallax offset={-50} className="mt-14 flex flex-col gap-3 sm:mt-24 sm:gap-6">
            {c && <Frame pic={c} sizes={sizes} className="aspect-square" />}
            {d && <Frame pic={d} sizes={sizes} className="aspect-[4/5]" />}
          </Parallax>
        </div>
      </div>
    </section>
  );
}
