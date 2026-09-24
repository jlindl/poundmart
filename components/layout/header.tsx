"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AmazonButton, AmazonLink } from "@/components/ui/amazon-link";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { amazon, mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export type MegaItem = { title: string; href: string; image: string; blurb: string; accent: string };

const announcements = [
  "Sold by PoundMart, dispatched by Amazon",
  "30-day returns through Amazon",
  "Genuine brands, bundled in the UK",
  "New: the Nice Smile 12 Pack",
  "Vegan & cruelty-free toothpaste and haircare",
];

export function Header({ megaItems }: { megaItems: MegaItem[] }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (open || mega) return;
    setHidden(y > 240 && y > prev + 4 ? true : y < prev - 4 ? false : hidden);
  });

  // Close menus on navigation (state adjusted during render, not in an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setMega(false);
  }

  // Lock page scroll behind the mobile menu
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMega(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>

      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
        onMouseLeave={() => setMega(false)}
      >
        {/* Announcement ticker */}
        <div className="bg-ink text-cream">
          <Marquee duration={38} className="h-8 text-[12px] font-medium tracking-wide" fade={false}>
            {announcements.map((a) => (
              <span key={a} className="flex items-center gap-6 px-6">
                <span aria-hidden className="text-sun">✦</span>
                {a}
              </span>
            ))}
          </Marquee>
        </div>

        <div
          className={cn(
            "border-b transition-[background-color,border-color,backdrop-filter] duration-500",
            scrolled || mega ? "border-line/80 bg-cream/85 backdrop-blur-xl" : "border-transparent bg-transparent",
          )}
        >
          <div className="container-x flex h-[68px] items-center justify-between gap-6 lg:h-[76px]">
            <Logo className="h-9 lg:h-10" priority />

            <nav aria-label="Main" className="hidden lg:block" onMouseLeave={() => setHovered(null)}>
              <ul className="flex items-center gap-1">
                {mainNav.map((item) => {
                  const active = isActive(item.href);
                  const isShop = item.label === "Shop";
                  return (
                    <li key={item.href} className="relative" onMouseEnter={() => { setHovered(item.href); setMega(isShop); }}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        aria-expanded={isShop ? mega : undefined}
                        onFocus={() => setMega(isShop)}
                        className={cn(
                          "relative z-10 block rounded-full px-4 py-2 text-[0.95rem] font-medium transition-colors duration-300",
                          active ? "text-ink" : "text-ink/70 hover:text-ink",
                        )}
                      >
                        {hovered === item.href && (
                          <motion.span
                            layoutId="nav-hover"
                            className="absolute inset-0 -z-10 rounded-full bg-ink/[0.06]"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        {item.label}
                        {active && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-x-4 -bottom-0.5 h-[3px] rounded-full bg-sun"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <Magnetic className="hidden sm:inline-block">
                <AmazonButton href={amazon.store()} placement="header" size="md">
                  Shop on Amazon
                </AmazonButton>
              </Magnetic>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="grid size-11 place-items-center rounded-full bg-ink text-cream transition-transform duration-300 hover:scale-105 active:scale-95 lg:hidden"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>

          {/* Shop mega menu */}
          <AnimatePresence>
            {mega && (
              <motion.div
                key="mega"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="hidden border-t border-line/70 lg:block"
                onMouseEnter={() => setMega(true)}
              >
                <div className="container-x grid grid-cols-5 gap-4 py-6">
                  {megaItems.map((m, i) => (
                    <motion.div
                      key={m.href}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.04 * i }}
                    >
                      <Link
                        href={m.href}
                        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper p-4 transition-shadow duration-300 hover:shadow-lift"
                      >
                        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl" style={{ background: `${m.accent}22` }}>
                          <Image
                            src={m.image}
                            alt=""
                            fill
                            sizes="18vw"
                            className="product-cutout object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <span className="font-display text-lg font-bold">{m.title}</span>
                        <span className="text-sm text-ink-muted">{m.blurb}</span>
                      </Link>
                    </motion.div>
                  ))}
                  <AmazonLink
                    href={amazon.store()}
                    placement="mega-menu"
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-ink p-5 text-cream"
                  >
                    <span className="eyebrow text-sun">Official store</span>
                    <span className="font-display text-2xl font-bold leading-tight">
                      See every bundle on <span className="accent-serif text-sun">Amazon</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-sun">
                      Visit the PoundMart store <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                    <span aria-hidden className="absolute -right-8 -top-8 size-28 rounded-full bg-sun/15 transition-transform duration-700 group-hover:scale-150" />
                  </AmazonLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-ink text-cream lg:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 60px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 60px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 60px)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="container-x flex h-[76px] shrink-0 items-center justify-between pt-8">
              <Logo tone="light" className="h-9" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-full bg-sun text-ink transition-transform hover:rotate-90"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav aria-label="Mobile" className="container-x mt-10 flex-1">
              <ul className="flex flex-col">
                {[{ label: "Home", href: "/" }, ...mainNav, { label: "FAQs", href: "/faq" }].map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.05 }}
                    className="border-b border-cream/10"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between py-4 font-display text-4xl font-bold tracking-tight",
                        isActive(item.href) ? "text-sun" : "text-cream",
                      )}
                    >
                      {item.label}
                      <span aria-hidden className="text-base text-cream/40">0{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="container-x pb-10 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
            >
              <AmazonButton href={amazon.store()} placement="mobile-menu" size="lg" className="w-full">
                Shop the store on Amazon
              </AmazonButton>
              <p className="mt-4 text-center text-sm text-cream/60">Sold by PoundMart · Dispatched by Amazon</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
