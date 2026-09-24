/**
 * Editorial dressing for the four blog categories: headlines, intros, imagery
 * and where each one sends shoppers. Keyed by category slug (lib/blog.ts).
 */
import type { amazonStore } from "@/lib/site";
import type { CollageTile } from "@/components/blog/types";

type CategoryArt = {
  headline: string;
  intro: string;
  /** Short line for rail panels and cross-links. */
  teaser: string;
  amazonPage: keyof typeof amazonStore;
  amazonLabel: string;
  shopHref: string;
  shopLabel: string;
  /** Image used on category panels and tiles. */
  cover: { src: string; alt: string; fit: "cover" | "contain"; tint?: string; objectPosition?: string };
  collage: CollageTile[];
};

export const categoryArt: Record<string, CategoryArt> = {
  "oral-care": {
    headline: "Oral care that makes *brushing* fun.",
    intro:
      "Kids' brushing battles, flavoured toothpaste, enamel care and bathroom routines that actually stick. Plain-English guides from the team that bundles Nice Smile.",
    teaser: "Flavours, fluoride and brushing routines kids actually enjoy.",
    amazonPage: "toothpaste",
    amazonLabel: "Shop toothpaste on Amazon",
    shopHref: "/collections/toothpaste",
    shopLabel: "Browse toothpaste",
    cover: { src: "/products/B0G318R9JG/g5.jpg", alt: "Nice Smile toothpaste tubes on a party table with balloons", fit: "cover" },
    collage: [
      {
        src: "/products/B0G318R9JG/g5.jpg",
        alt: "Nice Smile Berry Burst, Yummy Gummy and Candy Clean tubes on a party table with balloons",
        className: "left-0 top-[6%] w-[62%] aspect-square",
        sizes: "(min-width: 1024px) 26vw, 60vw",
        speed: 60,
        rotate: -3,
        priority: true,
      },
      {
        src: "/products/B0FLWZ7D6T/g2.jpg",
        alt: "Watermelon Fresh, Feelin' Grape and Peachy Clean toothpaste on white plinths",
        className: "right-0 top-0 w-[46%] aspect-[4/5]",
        sizes: "(min-width: 1024px) 20vw, 45vw",
        speed: 150,
        rotate: 4,
      },
      {
        src: "/products/B0G318R9JG/g1.jpg",
        alt: "The Nice Smile 6 pack in all six flavours",
        className: "right-[6%] bottom-0 w-[50%] aspect-square",
        sizes: "(min-width: 1024px) 20vw, 48vw",
        speed: 230,
        rotate: -5,
        fit: "contain",
        tint: "#FFE3E6",
      },
    ],
  },
  haircare: {
    headline: "Haircare for *good hair* days.",
    intro:
      "Leave-in conditioner for curls, argan oil for thirsty lengths, rosemary for a fresh-feeling scalp and plastic-free bars for travel. Simple routines, no jargon.",
    teaser: "Curls, frizz, argan oil and wash-day shortcuts.",
    amazonPage: "haircare",
    amazonLabel: "Shop haircare on Amazon",
    shopHref: "/collections/haircare",
    shopLabel: "Browse haircare",
    cover: { src: "/products/B0GBMH1N54/a8.png", alt: "Model with long glossy curls beside a bottle of XHC argan oil conditioner", fit: "cover", objectPosition: "30% center" },
    collage: [
      {
        src: "/products/B0GBMH1N54/a8.png",
        alt: "Model with long glossy curls beside XHC argan oil conditioner",
        className: "left-0 top-[4%] w-[60%] aspect-[4/5]",
        sizes: "(min-width: 1024px) 26vw, 58vw",
        speed: 60,
        rotate: -3,
        objectPosition: "25% center",
        priority: true,
      },
      {
        src: "/brand/conditioner-3pack-table.jpg",
        alt: "Three XHC no rinse conditioners lined up on a wooden shelf",
        className: "right-0 top-0 w-[46%] aspect-square",
        sizes: "(min-width: 1024px) 20vw, 45vw",
        speed: 150,
        rotate: 4,
      },
      {
        src: "/products/B0GKYHKMRG/g5.jpg",
        alt: "XHC coconut, banana and papaya shampoo bars with tropical fruit",
        className: "right-[4%] bottom-0 w-[50%] aspect-square",
        sizes: "(min-width: 1024px) 20vw, 48vw",
        speed: 230,
        rotate: -4,
      },
    ],
  },
  "smart-saving": {
    headline: "Smart saving on the *everyday* stuff.",
    intro:
      "Unit prices, multi-packs and the small habits that stop you paying top whack for the essentials you always seem to run out of on a Tuesday night.",
    teaser: "Unit prices, multi-packs and never running out.",
    amazonPage: "shopAll",
    amazonLabel: "Shop all bundles on Amazon",
    shopHref: "/collections/bundles",
    shopLabel: "Browse value bundles",
    cover: { src: "/products/B0HBXLVW4S/g1.jpg", alt: "The Nice Smile 12 pack: twelve tubes of flavoured toothpaste", fit: "contain", tint: "#FFF3B8" },
    collage: [
      {
        src: "/products/B0HBXLVW4S/g1.jpg",
        alt: "The Nice Smile 12 pack: twelve tubes of flavoured toothpaste",
        className: "left-0 top-[4%] w-[56%] aspect-[4/5]",
        sizes: "(min-width: 1024px) 24vw, 55vw",
        speed: 60,
        rotate: -3,
        fit: "contain",
        tint: "#FFFFFF",
        priority: true,
      },
      {
        src: "/products/B0HBXLVW4S/g6.jpg",
        alt: "Nice Smile toothpaste tubes standing on a bright bathroom counter",
        className: "right-0 top-0 w-[46%] aspect-square",
        sizes: "(min-width: 1024px) 20vw, 45vw",
        speed: 150,
        rotate: 4,
      },
      {
        src: "/products/B0H9YX3DG3/g1.jpg",
        alt: "Six XHC shampoo and conditioner bars in coconut, banana and papaya",
        className: "right-[5%] bottom-0 w-[50%] aspect-square",
        sizes: "(min-width: 1024px) 20vw, 48vw",
        speed: 230,
        rotate: -4,
        fit: "contain",
        tint: "#FFFFFF",
      },
    ],
  },
  "family-home": {
    headline: "Family & home, *happily* organised.",
    intro:
      "Bathroom organisation, wash bags that are always ready to go, school and uni checklists and routines that make family life run a little smoother.",
    teaser: "Checklists, bathroom shelves and routines for busy households.",
    amazonPage: "home",
    amazonLabel: "Visit our Amazon store",
    shopHref: "/shop",
    shopLabel: "Browse the shop",
    cover: { src: "/brand/family-bundle-poster.png", alt: "A family on the sofa unboxing a PoundMart bundle", fit: "cover", objectPosition: "72% center" },
    collage: [
      {
        src: "/brand/family-bundle-poster.png",
        alt: "A family on the sofa unboxing a PoundMart value bundle",
        className: "left-0 top-[8%] w-[70%] aspect-[4/3]",
        sizes: "(min-width: 1024px) 30vw, 68vw",
        speed: 60,
        rotate: -2,
        objectPosition: "72% center",
        priority: true,
      },
      {
        src: "/products/B0GKYHKMRG/g4.jpg",
        alt: "XHC shampoo bars packed for hand luggage on a bathroom shelf",
        className: "right-0 top-0 w-[40%] aspect-square",
        sizes: "(min-width: 1024px) 18vw, 40vw",
        speed: 160,
        rotate: 4,
      },
      {
        src: "/products/B0FLFZ2Z6C/g1.jpg",
        alt: "Nice Smile Berry Burst, Yummy Gummy and Candy Clean toothpaste trio",
        className: "right-[8%] bottom-0 w-[44%] aspect-square",
        sizes: "(min-width: 1024px) 18vw, 44vw",
        speed: 230,
        rotate: -4,
        fit: "contain",
        tint: "#DDF5EF",
      },
    ],
  },
};

export function getCategoryArt(slug: string) {
  return categoryArt[slug] ?? categoryArt["smart-saving"];
}
