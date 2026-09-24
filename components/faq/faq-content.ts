/**
 * FAQ copy. Every answer sticks to verified brand facts (lib/site.ts) and the
 * Amazon listing data (lib/products.ts). Anything Amazon controls (delivery
 * dates, Prime, payment, tracking) points to Amazon rather than guessing.
 * Ids are deep-link anchors (/faq#id): keep them stable.
 */
import { amazon, site } from "@/lib/site";
import { getProduct, pricePerUnit } from "@/lib/products";
import { formatDate, formatPrice } from "@/lib/utils";
import type { FaqGroup } from "@/components/faq/faq-text";

function valueExample() {
  const twelve = getProduct("nice-smile-12-pack-toothpaste-bundle");
  const single = getProduct("nice-smile-watermelon-fresh-toothpaste");
  const unit = twelve ? pricePerUnit(twelve.primary) : null;
  const price = twelve?.primary.price ?? null;
  const singlePrice = single?.primary.price ?? null;
  if (!twelve || unit === null || price === null || singlePrice === null) {
    return "Because the price per item drops. Every bundle on this site shows what you pay per tube, bottle or bar, so you can compare at a glance before you head to Amazon.";
  }
  return `Because the price per item drops. For example, the [Nice Smile 12 Pack](/shop/${twelve.slug}) is ${formatPrice(price)} for 12 tubes, which works out at ${formatPrice(unit)} a tube, while a single tube of Watermelon Fresh is ${formatPrice(singlePrice)}. Prices checked ${formatDate(site.catalogCheckedAt)}; Amazon shows the live price.`;
}

export function getFaqGroups(): FaqGroup[] {
  const store = amazon.store();
  return [
    {
      id: "ordering",
      title: "Ordering & delivery",
      blurb: "Buying, delivery and tracking, the Amazon way.",
      items: [
        {
          id: "where-to-buy",
          question: "Where can I buy PoundMart bundles?",
          answer: [
            `Every PoundMart bundle is sold on Amazon UK. Each product on this site links straight to its Amazon listing, or you can browse everything at once in the [PoundMart store on Amazon](${store}).`,
            "You add to basket, pay and track your order on Amazon, just like anything else you buy there.",
          ],
        },
        {
          id: "why-amazon",
          question: "Why can't I check out on this website?",
          answer: [
            "This site is our shop window: product details, honest value maths and helpful guides. Orders go through Amazon, so you get a checkout you already know, dispatch by Amazon and 30-day returns through Amazon. PoundMart is the seller on every order.",
          ],
        },
        {
          id: "who-dispatches",
          question: "Who sends out my order?",
          answer: [
            "Your order is sold by PoundMart and dispatched by Amazon. We package and quality-check every bundle before it goes to Amazon, and Amazon dispatches it to you.",
          ],
        },
        {
          id: "delivery-times",
          question: "How long does delivery take, and can I get it with Prime?",
          answer: [
            "Amazon shows the delivery options, dates and any Prime eligibility on each listing and again at checkout, based on your address. As those details can change, we'd rather you see the live information on Amazon than a guess from us.",
          ],
        },
        {
          id: "track-order",
          question: "How do I track my order?",
          answer: ["Head to Your Orders in your Amazon account. Amazon shows the tracking and delivery updates for every order there."],
        },
        {
          id: "payment",
          question: "Which payment methods can I use?",
          answer: [
            "Any payment method Amazon offers you at checkout. We never take payment on this website, so there's nothing to enter here.",
          ],
        },
        {
          id: "prices",
          question: "Are the prices on this site up to date?",
          answer: [
            `We checked every price on this site on ${formatDate(site.catalogCheckedAt)}. Prices can change, so Amazon always shows the live price, and that's the one you pay.`,
          ],
        },
      ],
    },
    {
      id: "returns",
      title: "Returns",
      blurb: "What happens if something isn't right.",
      items: [
        {
          id: "returns-policy",
          question: "Can I return a PoundMart bundle?",
          answer: [
            "Yes. PoundMart bundles come with 30-day returns through Amazon. Start a return from Your Orders in your Amazon account and Amazon will show you the options for your item.",
          ],
        },
        {
          id: "start-return",
          question: "How do I start a return?",
          answer: [
            "Go to Your Orders on Amazon, find the bundle and choose to return or replace it. Amazon walks you through the rest, including how to send it back.",
          ],
        },
        {
          id: "damaged-item",
          question: "What if something arrives damaged?",
          answer: [
            "Every bundle is packaged and quality-checked by PoundMart, but parcels do sometimes have a rough journey. If anything arrives damaged, start a return from Your Orders on Amazon within the 30-day window.",
          ],
        },
        {
          id: "problem-with-order",
          question: "Something's wrong with my order. Who should I contact?",
          answer: [
            "Start in Your Orders on Amazon. From there you can get help with the order and message us as the seller. As every order is dispatched by Amazon, delivery questions are usually quickest answered by Amazon directly.",
          ],
        },
      ],
    },
    {
      id: "products",
      title: "Products & ingredients",
      blurb: "Nice Smile toothpaste and XHC haircare, explained.",
      items: [
        {
          id: "nice-smile-flavours",
          question: "Which Nice Smile flavours can I get?",
          answer: [
            "Six: Watermelon Fresh, Feelin' Grape, Peachy Clean, Berry Burst, Yummy Gummy and Candy Clean. Every tube is 60g, and you'll find them across our single tubes and [flavoured toothpaste bundles](/collections/toothpaste).",
          ],
        },
        {
          id: "fluoride",
          question: "Does Nice Smile toothpaste contain fluoride?",
          answer: [
            "Yes. Nice Smile is a whitening fluoride toothpaste. The key ingredients highlighted on the listings are sodium fluoride for enamel protection, hydrated silica for gentle whitening and peppermint oil for long-lasting freshness.",
          ],
        },
        {
          id: "toothpaste-for-kids",
          question: "Is Nice Smile suitable for children?",
          answer: [
            "Nice Smile is made for kids and adults, and the fruity and sweet flavours are there to make brushing something children actually look forward to.",
            "As with any fluoride toothpaste, supervise younger children while they brush and follow NHS advice on how much toothpaste to use for their age.",
          ],
        },
        {
          id: "vegan-toothpaste",
          question: "Is Nice Smile vegan and cruelty-free?",
          answer: ["Yes. Nice Smile toothpaste is listed as vegan, cruelty-free and enamel-safe."],
        },
        {
          id: "no-rinse-conditioner",
          question: "What is a no-rinse conditioner?",
          answer: [
            "It's a leave-in conditioner: you apply it to damp or dry hair and simply leave it in, with no wash-out needed. XHC Vegan No Rinse Conditioner is made for curly, afro and damaged hair, and is infused with argan, avocado and olive oils for hydration and frizz control.",
            "Each 250ml tube is vegan, sulphate-free and cruelty-free, in Cherry & Almond, Dragon Fruit & Vanilla or Mango & Coconut. Try all three in the [no-rinse conditioner 3 pack](/shop/xhc-no-rinse-conditioner-3-pack).",
          ],
        },
        {
          id: "vegan-haircare",
          question: "Is XHC haircare vegan?",
          answer: [
            "The XHC no-rinse conditioners and the Rosemary & Mint shampoo are vegan and cruelty-free. The Argan Oil shampoo and conditioner and the 2-in-1 shampoo bars are labelled vegan friendly, and the argan oil range is paraben-free too.",
          ],
        },
        {
          id: "argan-oil-hair-types",
          question: "Which hair types is the argan oil range for?",
          answer: [
            "The XHC Argan Oil shampoo and conditioner are made for all hair types, with Moroccan argan oil to help hydrate, smooth and restore natural shine. The shampoo is a good match for dry or damaged hair. For the full routine, try the [shampoo and conditioner set](/shop/xhc-argan-oil-shampoo-conditioner-set).",
          ],
        },
        {
          id: "shampoo-bars",
          question: "How do the 2-in-1 shampoo bars work?",
          answer: [
            "Each XHC bar cleanses and conditions in one step. They're solid, so there's no plastic bottle, and they're compact, mess-free and carry-on friendly for travel and the gym. Pick up Coconut, Banana and Papaya in a [3 pack or 6 pack](/shop/xhc-shampoo-conditioner-bars).",
          ],
        },
        {
          id: "ingredients",
          question: "Where can I see the full ingredients?",
          answer: [
            "Check the ingredients printed on each pack before use, especially if you have allergies or sensitive skin. The Amazon listing images also highlight the key ingredients for each product.",
          ],
        },
      ],
    },
    {
      id: "bundles",
      title: "Bundles & value",
      blurb: "Why multi-packs cost less, and what's inside.",
      items: [
        {
          id: "why-bundles",
          question: "Why buy a bundle instead of single items?",
          answer: [
            valueExample(),
            "Bundling also means fewer orders, fewer \"we've run out\" moments and a spare for the gym bag or the grandparents' house.",
          ],
        },
        {
          id: "bundle-sizes",
          question: "What sizes are the products in a bundle?",
          answer: [
            "Every bundle lists its unit sizes. Nice Smile tubes are 60g, XHC no-rinse conditioners are 250ml tubes, and the argan oil and rosemary & mint shampoos and conditioners come in 300ml bottles.",
          ],
        },
        {
          id: "choose-flavours",
          question: "Can I pick my own mix of flavours?",
          answer: [
            "Each bundle has a set line-up, shown on its listing. The Nice Smile 12 Pack has four each of Watermelon Fresh, Feelin' Grape and Peachy Clean, and the 6 Pack comes as All Flavours or as Berry, Gummy & Candy. If you love one flavour, some also come as singles or same-flavour packs.",
          ],
        },
        {
          id: "poundmart-exclusive",
          question: "What does \"PoundMart Exclusive\" mean?",
          answer: [
            "Many of our multi-packs are PoundMart exclusive bundles: the combination is put together, packaged and quality-checked by PoundMart, and sold by PoundMart on Amazon. See them all in [value bundles](/collections/bundles).",
          ],
        },
        {
          id: "gifts",
          question: "Do bundles make good gifts?",
          answer: [
            "They can. The Nice Smile listings suggest the compact 60g tubes for gifting, and the argan oil shampoo and conditioner set makes a neat, complete routine in one go.",
          ],
        },
        {
          id: "new-bundles",
          question: "Where can I find your newest bundles?",
          answer: [
            `They land in [New Arrivals](/collections/new-arrivals), and our Amazon store has a [New Arrivals page](${amazon.store("newArrivals")}) too.`,
          ],
        },
      ],
    },
    {
      id: "about",
      title: "About PoundMart",
      blurb: "Who we are and what we stand for.",
      items: [
        {
          id: "who-is-poundmart",
          question: "Who is PoundMart?",
          answer: [
            "PoundMart is a UK-based seller that brings trusted everyday essentials together in convenient multi-packs. We're the Home of Great Value Bundles: sold on Amazon by PoundMart and dispatched by Amazon. [Read our story](/about).",
          ],
        },
        {
          id: "genuine-products",
          question: "Are your products genuine?",
          answer: [
            "Always. We only sell genuine branded products: no knockoffs and no grey-market stock. Every bundle is packaged and quality-checked by PoundMart.",
          ],
        },
        {
          id: "brands",
          question: "Which brands do you sell?",
          answer: [
            "Right now we bundle Nice Smile flavoured toothpaste and XHC Xpert Haircare. Explore our [toothpaste](/collections/toothpaste) and [haircare](/collections/haircare).",
          ],
        },
        {
          id: "contact",
          question: "How do I get in touch?",
          answer: [
            `The quickest way is through Amazon: open Your Orders, choose your order and message us as the seller. To browse everything we sell, visit the [PoundMart store on Amazon](${store}).`,
          ],
        },
        {
          id: "guides",
          question: "Do you have tips on brushing and haircare routines?",
          answer: [
            "Yes, over on [the PoundMart blog](/blog): guides to brushing routines, haircare, smart saving and family life, written in plain English.",
          ],
        },
      ],
    },
  ];
}
