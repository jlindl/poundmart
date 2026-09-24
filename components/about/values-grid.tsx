import {
  BadgeCheck,
  Coins,
  Leaf,
  MapPin,
  PackageCheck,
  PartyPopper,
  RotateCcw,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type Value = { icon: LucideIcon; title: string; text: string };

const values: Value[] = [
  {
    icon: BadgeCheck,
    title: "Genuine, always",
    text: "Real branded products only. No knockoffs, no grey-market stock, no exceptions.",
  },
  {
    icon: Coins,
    title: "Value you can see",
    text: "We show the price per tube, bottle or bar, so the value of a bundle is there in black and white.",
  },
  {
    icon: PackageCheck,
    title: "Checked by us",
    text: "Every bundle is packaged and quality-checked by PoundMart before it heads to Amazon.",
  },
  {
    icon: Truck,
    title: "Amazon delivers",
    text: "Sold by PoundMart, dispatched by Amazon. Your delivery options appear right there at checkout.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    text: "30-day returns through Amazon, started from Your Orders in your Amazon account.",
  },
  {
    icon: Leaf,
    title: "Kinder formulas",
    text: "Vegan-friendly formulas across the range, with cruelty-free toothpaste and no-rinse conditioners.",
  },
  {
    icon: MapPin,
    title: "Proudly UK-based",
    text: "A UK business, bundling everyday essentials for homes up and down the country.",
  },
  {
    icon: PartyPopper,
    title: "Fun is allowed",
    text: "Watermelon toothpaste. Tropical shampoo bars. Everyday essentials never had to be boring.",
  },
];

/** Eight values on the sunshine section; alternate columns drift at different speeds as you scroll. */
export function ValuesGrid() {
  return (
    <RevealGroup as="ul" stagger={0.07} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {values.map((v, i) => {
        const Icon = v.icon;
        return (
          <RevealItem as="li" key={v.title} className="h-full">
            <Parallax offset={i % 2 === 0 ? 0 : 26} smooth className="h-full">
              <div
                className={cn(
                  "group flex h-full flex-col gap-5 rounded-4xl border border-ink/10 bg-sun-pale p-7 shadow-soft",
                  "transition-[transform,box-shadow,background-color] duration-500 ease-out-expo hover:-translate-y-1.5 hover:bg-paper hover:shadow-lift",
                )}
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-ink text-sun transition-transform duration-500 ease-spring group-hover:-rotate-12 group-hover:scale-110">
                  <Icon aria-hidden className="size-6" />
                </span>
                <h3 className="font-display text-2xl font-bold leading-tight tracking-tight text-ink">{v.title}</h3>
                <p className="leading-relaxed text-ink/80">{v.text}</p>
              </div>
            </Parallax>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
