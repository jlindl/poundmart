import type { Metadata } from "next";
import { BellRing, PackagePlus, TrendingDown } from "lucide-react";
import { SignupForm } from "@/components/newsletter/signup-form";
import { newsletter } from "@/lib/newsletter";

export const metadata: Metadata = {
  title: `${newsletter.name} newsletter`,
  description:
    "Sign up to The Bundle Drop: new PoundMart bundles, price drops and restocks from our Amazon store, sent once a week. Unsubscribe any time.",
  alternates: { canonical: "/newsletter" },
};

const perks = [
  { icon: PackagePlus, title: "New bundles first", text: "Hear about new multi-packs the week they land in our Amazon store." },
  { icon: TrendingDown, title: "Price drops", text: "When one of our bundles gets cheaper, you'll be the first to know." },
  { icon: BellRing, title: "Restock alerts", text: "Favourite bundle sold out? We'll tell you when it's back." },
];

export default function NewsletterPage() {
  return (
    <>
      <section className="relative overflow-clip bg-sun pt-[calc(var(--header-h)+4rem)] pb-20 text-ink-deep md:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(rgb(4_64_108/0.14)_1.5px,transparent_1.5px)] [background-size:26px_26px] [mask-image:radial-gradient(80%_70%_at_70%_50%,black,transparent)]"
        />
        <div className="container-x relative mx-auto max-w-3xl text-center">
          <span className="eyebrow inline-flex items-center gap-2 text-ink">
            <span aria-hidden className="size-1.5 rounded-full bg-ink" />
            The PoundMart newsletter
          </span>
          <h1 className="type-display mt-5 text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] text-ink-deep">
            The Bundle <span className="accent-serif text-ink">Drop</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[46ch] text-lg leading-relaxed text-ink sm:text-xl">{newsletter.pitch}</p>
          <div className="mx-auto mt-10 max-w-xl text-left">
            <SignupForm source="newsletter page" />
          </div>
        </div>
      </section>

      <section className="container-x py-20 md:py-24">
        <ul className="grid gap-6 md:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-4xl bg-paper p-8 shadow-soft">
              <span className="grid size-11 place-items-center rounded-full bg-sun-soft text-ink">
                <Icon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-ink">{title}</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">{text}</p>
            </li>
          ))}
        </ul>

        <div id="privacy" className="mx-auto mt-20 max-w-2xl scroll-mt-32 text-ink-soft">
          <h2 className="text-2xl font-semibold text-ink">How we use your email</h2>
          <div className="mt-4 space-y-4 leading-relaxed">
            <p>
              When you sign up, we store your email address so we can send you The Bundle Drop, a weekly email about PoundMart bundles,
              prices and restocks. We use Klaviyo to store the list and send the emails, and Klaviyo records whether you open or click them
              so we can see what people find useful.
            </p>
            <p>
              We never sell or share your email with anyone else. Every email has an unsubscribe link, and unsubscribing removes you from
              future sends straight away. Orders are placed on Amazon, which handles your order details under its own privacy notice.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
