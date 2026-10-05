"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import {
  ArrowUpRight,
  Check,
  FlaskConical,
  Heart,
  Link2,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  X,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { AmazonButton, AmazonLink } from "@/components/ui/amazon-link";
import {
  escapeRegExp,
  normalise,
  parseRich,
  plainText,
  searchTerms,
  type FaqGroup,
  type FaqGroupId,
  type FaqItem,
  type RichPart,
} from "@/components/faq/faq-text";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const groupIcons: Record<FaqGroupId, LucideIcon> = {
  ordering: ShoppingBag,
  returns: RotateCcw,
  products: FlaskConical,
  bundles: Package,
  about: Heart,
};

const suggestions = ["Delivery", "Returns", "Vegan", "Fluoride", "Curly hair", "Prime"];

/* ---------- URL hash as an external store (deep links like /faq#returns-policy) ---------- */

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
function readHash() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}
const serverHash = () => "";

/* ---------- Text rendering with search highlights ---------- */

function Highlight({ text, pattern }: { text: string; pattern: RegExp | null }) {
  if (!pattern) return <>{text}</>;
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-[0.3em] bg-sun px-0.5 text-ink-deep">
            {p}
          </mark>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

const linkClass =
  "font-semibold text-ink underline decoration-sun decoration-[3px] underline-offset-[5px] transition-colors duration-300 hover:decoration-ink";

function RichLink({ part, pattern }: { part: Extract<RichPart, { type: "link" }>; pattern: RegExp | null }) {
  if (part.href.startsWith("/")) {
    return (
      <Link href={part.href} className={linkClass}>
        <Highlight text={part.text} pattern={pattern} />
      </Link>
    );
  }
  if (/amazon\.co\.uk/.test(part.href)) {
    return (
      <AmazonLink href={part.href} placement="faq-answer" className={cn(linkClass, "inline-flex items-baseline gap-0.5")}>
        <Highlight text={part.text} pattern={pattern} />
        <ArrowUpRight aria-hidden className="size-3.5 self-center" />
        <span className="sr-only"> (opens Amazon in a new tab)</span>
      </AmazonLink>
    );
  }
  return (
    <a href={part.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      <Highlight text={part.text} pattern={pattern} />
    </a>
  );
}

function RichParagraph({ text, pattern }: { text: string; pattern: RegExp | null }) {
  return (
    <p>
      {parseRich(text).map((part, i) =>
        part.type === "text" ? <Highlight key={i} text={part.text} pattern={pattern} /> : <RichLink key={i} part={part} pattern={pattern} />,
      )}
    </p>
  );
}

/* ---------- One question ---------- */

function QuestionRow({
  item,
  open,
  onToggle,
  onCopy,
  copied,
  pattern,
  reduce,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
  onCopy: () => void;
  copied: boolean;
  pattern: RegExp | null;
  reduce: boolean;
}) {
  const buttonId = `${item.id}-q`;
  const panelId = `${item.id}-a`;
  return (
    <motion.li
      id={item.id}
      layout={reduce ? false : "position"}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={cn(
        "scroll-mt-4 overflow-hidden rounded-3xl border transition-[background-color,border-color,box-shadow] duration-500",
        open ? "border-ink/15 bg-paper shadow-soft" : "border-line bg-paper/70 hover:border-ink/20 hover:bg-paper",
      )}
    >
      <h3>
        <button
          id={buttonId}
          type="button"
          data-faq-trigger
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full cursor-pointer items-center justify-between gap-5 px-5 py-5 text-left focus-visible:outline-offset-[-3px] sm:px-7 sm:py-6"
        >
          <span className="font-display text-lg font-semibold leading-snug tracking-tight text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-1 sm:text-xl">
            <Highlight text={item.question} pattern={pattern} />
          </span>
          <span
            aria-hidden
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,transform,color] duration-500 ease-out-expo",
              open ? "rotate-45 border-sun bg-sun text-ink-deep" : "border-ink/15 text-ink group-hover:border-ink group-hover:bg-ink group-hover:text-cream",
            )}
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-out-expo",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <motion.div
            initial={false}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : -8 }}
            transition={{ duration: 0.45, ease: EASE, delay: open ? 0.08 : 0 }}
            className="flex flex-col gap-4 px-5 pb-6 text-[1.05rem] leading-relaxed text-ink/80 sm:px-7 sm:pb-7"
          >
            {item.answer.map((p, i) => (
              <RichParagraph key={i} text={p} pattern={pattern} />
            ))}
            <button
              type="button"
              onClick={onCopy}
              className="group/copy inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full py-1 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              {copied ? <Check aria-hidden className="size-4 text-mint" /> : <Link2 aria-hidden className="size-4 transition-transform duration-300 group-hover/copy:-rotate-12" />}
              <span>{copied ? "Link copied" : "Copy link to this answer"}</span>
            </button>
          </motion.div>
        </div>
      </div>
    </motion.li>
  );
}

/* ---------- The explorer ---------- */

export function FaqExplorer({ groups, storeHref }: { groups: FaqGroup[]; storeHref: string }) {
  const reduce = Boolean(useReducedMotion());
  const lenis = useLenis();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState("");
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [active, setActive] = useState<FaqGroupId>(groups[0]?.id ?? "ordering");

  const hash = useSyncExternalStore(subscribeHash, readHash, serverHash);
  const ids = useMemo(() => new Set(groups.flatMap((g) => g.items.map((i) => i.id))), [groups]);
  const target = ids.has(hash) ? hash : "";

  const terms = useMemo(() => searchTerms(query), [query]);
  const pattern = useMemo(() => (terms.length ? new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi") : null), [terms]);

  const results = useMemo(() => {
    const index = (item: FaqItem) => ({
      q: normalise(item.question),
      a: normalise(item.answer.map(plainText).join(" ")),
    });
    return groups
      .map((g) => ({
        ...g,
        items: g.items
          .map((item) => ({ item, text: index(item) }))
          .filter(({ text }) => terms.every((t) => text.q.includes(t) || text.a.includes(t)))
          .map(({ item, text }) => ({ item, answerHit: terms.length > 0 && terms.some((t) => text.a.includes(t)) })),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, terms]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const shown = results.reduce((n, g) => n + g.items.length, 0);
  const searching = terms.length > 0;

  // Deep link: scroll to (and focus) the question named in the hash.
  useEffect(() => {
    if (!target) return;
    const el = document.getElementById(target);
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      // Items carry a small scroll-margin; the offset clears the fixed header.
      if (lenis) lenis.scrollTo(el, { offset: -110 });
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 124 });
      el.querySelector<HTMLButtonElement>("[data-faq-trigger]")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [target, lenis]);

  // A new hash always re-opens its question, even if it was closed earlier.
  useEffect(() => {
    const onHash = () => {
      const id = readHash();
      setToggled((t) => {
        if (!(id in t)) return t;
        const next = { ...t };
        delete next[id];
        return next;
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // "/" focuses the search box.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Scroll spy for the topic navigation.
  const visibleKey = results.map((g) => g.id).join(",");
  useEffect(() => {
    const sections = visibleKey
      .split(",")
      .filter(Boolean)
      .map((id) => document.getElementById(`faq-group-${id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id.replace("faq-group-", "") as FaqGroupId);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [visibleKey]);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  /** Explicit user choice wins; otherwise open the deep-linked question and, while searching, answers that match. */
  const openState = (t: Record<string, boolean>, id: string, answerHit: boolean) => t[id] ?? (id === target || (searching && answerHit));
  const isOpen = (id: string, answerHit: boolean) => openState(toggled, id, answerHit);

  function toggle(id: string, answerHit: boolean) {
    setToggled((t) => ({ ...t, [id]: !openState(t, id, answerHit) }));
  }

  async function copyLink(id: string) {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    window.history.replaceState(window.history.state, "", `#${id}`);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard can be blocked; the address bar now holds the link anyway */
    }
    setCopied(id);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(null), 2200);
  }

  function onListKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const el = e.target as HTMLElement;
    if (!el.hasAttribute("data-faq-trigger") || !listRef.current) return;
    const triggers = Array.from(listRef.current.querySelectorAll<HTMLButtonElement>("[data-faq-trigger]"));
    const i = triggers.indexOf(el as HTMLButtonElement);
    let next: HTMLButtonElement | undefined;
    if (e.key === "ArrowDown") next = triggers[(i + 1) % triggers.length];
    else if (e.key === "ArrowUp") next = triggers[(i - 1 + triggers.length) % triggers.length];
    else if (e.key === "Home") next = triggers[0];
    else if (e.key === "End") next = triggers[triggers.length - 1];
    else if (e.key === "Escape") {
      const id = el.getAttribute("aria-controls")?.replace(/-a$/, "");
      if (id) setToggled((t) => ({ ...t, [id]: false }));
      return;
    }
    if (next) {
      e.preventDefault();
      next.focus();
    }
  }

  const status = searching
    ? `${shown} ${shown === 1 ? "answer" : "answers"} for "${query.trim()}"`
    : `${total} questions across ${groups.length} topics`;

  return (
    <div className="grid gap-12 grid-cols-1 lg:grid-cols-12 lg:gap-16">
      {/* Search + mobile topics */}
      <div className="lg:col-span-12">
        <div role="search" className="relative mx-auto max-w-3xl">
          <label htmlFor="faq-search" className="sr-only">
            Search the FAQs
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-6 top-1/2 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            ref={inputRef}
            id="faq-search"
            type="search"
            value={query}
            autoComplete="off"
            spellCheck={false}
            placeholder="Search delivery, returns, flavours..."
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (query) setQuery("");
                else e.currentTarget.blur();
              }
            }}
            aria-describedby="faq-status"
            className="h-16 w-full rounded-full border-2 border-ink/10 bg-paper pl-14 pr-16 text-base text-ink shadow-soft transition-[border-color,box-shadow] duration-300 placeholder:text-ink-muted hover:border-ink/25 focus:border-ink focus:shadow-lift focus-visible:outline-none sm:h-[4.5rem] sm:text-lg [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-ink text-cream transition-transform duration-300 hover:rotate-90 hover:scale-105"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd
              aria-hidden
              className="absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-lg border border-ink/15 bg-cream px-2.5 py-1 font-mono text-xs text-ink-muted sm:block"
            >
              /
            </kbd>
          )}
        </div>
        <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-ink-muted">Try:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-0.5",
                normalise(query.trim()) === normalise(s) ? "border-ink bg-ink text-cream" : "border-ink/15 bg-paper text-ink hover:border-ink",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <p id="faq-status" aria-live="polite" className="mt-5 text-center text-sm font-medium text-ink-muted">
          {status}
        </p>
        <p aria-live="polite" className="sr-only">
          {copied ? "Link to the answer copied" : ""}
        </p>

        <nav aria-label="FAQ topics" className="mt-8 lg:hidden">
          <ul className="no-scrollbar relative -mx-[clamp(1.25rem,4vw,3rem)] flex gap-2 overflow-x-auto px-[clamp(1.25rem,4vw,3rem)] pb-1">
            {results.map((g) => {
              const Icon = groupIcons[g.id];
              return (
                <li key={g.id} className="shrink-0">
                  <a
                    href={`#faq-group-${g.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
                  >
                    <Icon aria-hidden className="size-4" />
                    {g.title}
                    <span className="rounded-full bg-sun-soft px-1.5 text-xs text-ink">{g.items.length}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Sticky topic rail */}
      <aside className="hidden lg:col-span-4 lg:block">
        <div className="sticky top-32 flex flex-col gap-6">
          <nav aria-label="FAQ topics">
            <ul className="flex flex-col gap-1">
              {groups.map((g) => {
                const Icon = groupIcons[g.id];
                const count = results.find((r) => r.id === g.id)?.items.length ?? 0;
                const isActive = active === g.id && count > 0;
                return (
                  <li key={g.id}>
                    <a
                      href={`#faq-group-${g.id}`}
                      aria-current={isActive ? "location" : undefined}
                      aria-disabled={count === 0 || undefined}
                      className={cn(
                        "group relative isolate flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition-colors duration-300",
                        count === 0 ? "pointer-events-none text-ink-muted/60" : isActive ? "text-ink" : "text-ink/70 hover:bg-ink/5 hover:text-ink",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="faq-active-topic"
                          className="absolute inset-0 -z-10 rounded-2xl bg-sun-soft"
                          transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        />
                      )}
                      <span
                        className={cn(
                          "grid size-9 place-items-center rounded-xl transition-colors duration-300",
                          isActive ? "bg-ink text-sun" : "bg-ink/5 text-ink group-hover:bg-ink group-hover:text-sun",
                        )}
                      >
                        <Icon aria-hidden className="size-4" />
                      </span>
                      <span className="flex-1">{g.title}</span>
                      <span className="text-sm tabular-nums text-ink-muted">{count}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="relative overflow-hidden rounded-4xl bg-ink p-7 text-cream [&_:focus-visible]:outline-sun">
            <div aria-hidden className="absolute -right-10 -top-10 size-32 rounded-full bg-sun/20" />
            <p className="eyebrow text-sun">Ready to shop?</p>
            <p className="mt-3 font-display text-2xl font-bold leading-tight">
              Every bundle, one <span className="accent-serif text-sun">Amazon</span> store.
            </p>
            <AmazonButton href={storeHref} placement="faq-sidebar" size="md" className="mt-6 w-full">
              Visit the store
            </AmazonButton>
          </div>
        </div>
      </aside>

      {/* Questions */}
      <div ref={listRef} onKeyDown={onListKeyDown} className="flex flex-col gap-16 lg:col-span-8">
        <AnimatePresence initial={false}>
          {results.map((g, gi) => (
            <motion.section
              key={g.id}
              id={`faq-group-${g.id}`}
              aria-labelledby={`faq-group-${g.id}-title`}
              layout={reduce ? false : "position"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease: EASE }}
              className="scroll-mt-4"
            >
              <Reveal y={20} amount={0.6} className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-5">
                <div>
                  <span className="eyebrow text-ink-muted">
                    {String(gi + 1).padStart(2, "0")} / {String(results.length).padStart(2, "0")}
                  </span>
                  <h2 id={`faq-group-${g.id}-title`} className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                    {g.title}
                  </h2>
                  <p className="mt-1 text-ink-muted">{g.blurb}</p>
                </div>
                <span className="shrink-0 rounded-full bg-sun-soft px-3 py-1 text-sm font-semibold tabular-nums text-ink">
                  {g.items.length} {g.items.length === 1 ? "question" : "questions"}
                </span>
              </Reveal>
              <ul className="flex flex-col gap-3">
                <AnimatePresence>
                  {g.items.map(({ item, answerHit }) => (
                    <QuestionRow
                      key={item.id}
                      item={item}
                      open={isOpen(item.id, answerHit)}
                      onToggle={() => toggle(item.id, answerHit)}
                      onCopy={() => copyLink(item.id)}
                      copied={copied === item.id}
                      pattern={pattern}
                      reduce={reduce}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </motion.section>
          ))}
        </AnimatePresence>

        {shown === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col items-center gap-5 rounded-4xl border border-dashed border-ink/20 bg-paper px-6 py-14 text-center"
          >
            <span className="grid size-16 place-items-center rounded-full bg-sun-soft font-display text-3xl font-bold text-ink">?</span>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Nothing for &ldquo;{query.trim()}&rdquo; yet.
            </h2>
            <p className="max-w-md text-ink-muted">
              Try a shorter word, or pick a topic above. Order-specific questions are best answered in Your Orders on Amazon.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-ink/15 px-5 font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
              >
                <X aria-hidden className="size-4" /> Clear search
              </button>
              <AmazonButton href={storeHref} placement="faq-empty" size="md">
                Browse the Amazon store
              </AmazonButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
