import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, MapPin, PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { BuyBox, MobileBuyBar, type BuyProduct } from "@/components/shop/buy-box";
import { CtaBand } from "@/components/shop/cta-band";
import { ProductGallery } from "@/components/shop/product-gallery";
import { galleryMedia, imageSize, productStory } from "@/components/shop/product-media";
import { ProductBestFor, ProductFaq, ProductFeatures, ProductLookbook, ProductStory, VariantCompare } from "@/components/shop/product-sections";
import { RelatedPosts } from "@/components/shop/related-posts";
import {
  breadcrumbJsonLd,
  brandName,
  collectionArt,
  collectionForProduct,
  flavourColour,
  lowerFirst,
  productFaq,
  productJsonLd,
  type Crumb,
} from "@/components/shop/shop-data";
import { ProductVariantProvider } from "@/components/shop/variant-context";
import { postsForProduct, postsInCategory, type Post } from "@/lib/blog";
import { getProduct, isInStock, products, relatedProducts, type Product } from "@/lib/products";
import { amazon, brandFacts, site } from "@/lib/site";
import { formatDate, seoTitle } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return {};
  const image = product.primary.image;
  const size = imageSize(image) ?? { width: 1000, height: 1000 };
  const url = `/shop/${product.slug}`;
  return {
    title: seoTitle(product.name),
    description: product.summary,
    keywords: product.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${product.name} | ${site.name}`,
      description: product.summary,
      images: [{ url: image, width: size.width, height: size.height, alt: product.name }],
    },
    twitter: { card: "summary_large_image", title: `${product.name} | ${site.name}`, description: product.summary, images: [image] },
  };
}

function flavourLabel(p: Product) {
  if (p.category === "toothpaste") return p.flavours.length > 1 ? "Flavours" : "Flavour";
  if (p.type === "Leave-in conditioner" || p.type === "Haircare bars") return p.flavours.length > 1 ? "Scents" : "Scent";
  return "Signature ingredient";
}

/** Posts that feature this product, topped up from its blog category. */
function productPosts(p: Product): Post[] {
  const picked = postsForProduct(p.slug, 3);
  const category = p.category === "toothpaste" ? "oral-care" : "haircare";
  for (const post of postsInCategory(category)) {
    if (picked.length >= 3) break;
    if (!picked.some((x) => x.slug === post.slug)) picked.push(post);
  }
  return picked;
}

export default async function ProductPage(props: PageProps<"/shop/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const collection = collectionForProduct(product);
  const gallery = galleryMedia(product);
  const { rows, lookbook } = productStory(product);
  const featureImage = lookbook.at(-1) ?? gallery.find((m) => !m.packshot) ?? gallery[0];
  const lookbookImages = lookbook.filter((m) => m.src !== featureImage?.src);
  const variantImages = product.variants.map((v) => product.images.indexOf(v.image));
  const inStock = isInStock(product);
  const related = relatedProducts(product, 4);
  const posts = productPosts(product);
  const faq = productFaq(product, brandFacts);
  const checkedNote = `Prices checked ${formatDate(site.catalogCheckedAt)}; Amazon shows the live price.`;
  const primarySize = imageSize(product.primary.image) ?? { width: 1000, height: 1000 };

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: collection.title, href: `/collections/${collection.slug}` },
    { name: product.name, href: `/shop/${product.slug}` },
  ];

  const buy: BuyProduct = {
    slug: product.slug,
    name: product.name,
    brandLabel: brandName(product),
    tagline: product.tagline,
    unitNoun: product.unitNoun,
    unitSize: product.unitSize,
    flavourLabel: flavourLabel(product),
    flavours: product.flavours.map((f) => ({ name: f, colour: flavourColour(f) })),
    variants: product.variants.map((v) => ({
      asin: v.asin,
      label: v.label,
      units: v.units,
      price: v.price,
      listPrice: v.listPrice,
      rating: v.rating,
      reviewCount: v.reviewCount,
      inStock: v.inStock,
      image: v.image,
      href: amazon.product(v.asin),
      reviewsHref: amazon.reviews(v.asin),
    })),
    storeHref: amazon.store(collection.amazonPage),
    collection: { title: collection.title, href: `/collections/${collection.slug}` },
  };

  const trust = [
    { icon: BadgeCheck, label: brandFacts.soldBy },
    { icon: Truck, label: brandFacts.dispatchedBy },
    { icon: RotateCcw, label: brandFacts.returns },
    { icon: MapPin, label: `${brandFacts.base} business` },
    { icon: PackageCheck, label: brandFacts.packing, wide: true },
    { icon: ShieldCheck, label: brandFacts.authenticity, wide: true },
  ];

  return (
    <>
      <JsonLd data={[productJsonLd(product), breadcrumbJsonLd(crumbs)]} />

      {/* Buy section */}
      <section className="relative bg-cream pb-20 pt-[calc(var(--header-h)+1.5rem)] lg:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[36rem]"
          style={{ background: `linear-gradient(180deg, ${product.accentSoft} 0%, var(--color-cream) 100%)` }}
        />
        <div className="container-x relative">
          <Reveal y={8}>
            <Breadcrumbs items={crumbs} />
          </Reveal>
          <ProductVariantProvider variantImages={variantImages}>
            <div className="mt-6 grid gap-10 lg:mt-8 grid-cols-1 lg:grid-cols-12 lg:gap-12 xl:gap-16">
              <div className="lg:col-span-7">
                <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
                  <ProductGallery images={gallery} slug={product.slug} name={product.name} accentSoft={product.accentSoft} />
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
                  <BuyBox product={buy} checkedNote={checkedNote}>
                    {!inStock && related.length > 0 && (
                      <div className="rounded-3xl border border-sun/60 bg-sun-pale p-5">
                        <p className="font-semibold text-ink">This one is currently unavailable on Amazon.</p>
                        <p className="mt-1 text-sm text-ink-muted">These similar bundles are available now:</p>
                        <ul className="mt-3 flex flex-col gap-1.5">
                          {related.slice(0, 2).map((r) => (
                            <li key={r.slug}>
                              <Link
                                href={`/shop/${r.slug}`}
                                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline decoration-sun decoration-2 underline-offset-4 hover:decoration-ink"
                              >
                                {r.name}
                                <ArrowRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <ul className="grid gap-x-4 gap-y-3 rounded-4xl border border-line bg-paper/60 p-5 sm:grid-cols-2 sm:p-6">
                      {trust.map(({ icon: Icon, label, wide }) => (
                        <li
                          key={label}
                          className={wide ? "flex items-start gap-2.5 text-sm text-ink sm:col-span-2" : "flex items-start gap-2.5 text-sm text-ink"}
                        >
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-sun">
                            <Icon aria-hidden className="size-3.5" />
                          </span>
                          <span className="pt-1 leading-snug">{label}</span>
                        </li>
                      ))}
                    </ul>
                  </BuyBox>
                </div>
              </div>
            </div>
            <MobileBuyBar product={buy} hideWhenVisibleId="pdp-closing-cta" />
          </ProductVariantProvider>
        </div>
      </section>

      <ProductFeatures product={product} image={featureImage} />

      <ProductStory product={product} rows={rows} />

      <ProductLookbook product={product} images={lookbookImages} />

      <ProductBestFor product={product} />

      <VariantCompare product={product} checkedNote={checkedNote} />

      <ProductFaq faq={faq} product={product} />

      {related.length > 0 && (
        <section className="bg-paper py-24 lg:py-32">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <SectionHeading eyebrow="You might also like" title="Complete the *bundle*." intro="More PoundMart favourites that pair well with this one. Star ratings are Amazon customer ratings." />
              <Reveal y={12}>
                <ButtonLink href={`/collections/${collection.slug}`} variant="outline" size="md">
                  All {collection.title.toLowerCase()}
                </ButtonLink>
              </Reveal>
            </div>
            <RevealGroup
              as="ul"
              className="no-scrollbar relative -mx-5 mt-12 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
              stagger={0.08}
            >
              {related.map((p) => (
                <RevealItem as="li" key={p.slug} className="h-full w-[82%] shrink-0 snap-start sm:w-auto">
                  <ProductCard product={p} placement="pdp-related" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <RelatedPosts
        posts={posts}
        title={collectionArt[collection.slug]?.blogTitle ?? "From the *blog*."}
        intro="Straight-talking guides from the PoundMart team, written to help you choose and use."
        viewAll={{ href: `/blog/category/${product.category === "toothpaste" ? "oral-care" : "haircare"}`, label: "More guides" }}
        className="bg-cream"
      />

      <CtaBand
        id="pdp-closing-cta"
        eyebrow={inStock ? "Ready when you are" : "Currently unavailable"}
        title={product.category === "toothpaste" ? "Brighter brushing is *one tap* away." : "Your next wash day, *sorted*."}
        body={`${product.name}. ${brandFacts.soldBy}, ${lowerFirst(brandFacts.dispatchedBy)}, with ${lowerFirst(brandFacts.returns)}.`}
        primary={{
          href: amazon.product(product.primary.asin),
          placement: "pdp-closing",
          asin: product.primary.asin,
          label: inStock ? "Buy on Amazon" : "View on Amazon",
        }}
        secondary={{ href: `/collections/${collection.slug}`, label: `Browse ${collection.title.toLowerCase()}` }}
        image={{ src: product.primary.image, alt: product.name, width: primarySize.width, height: primarySize.height, cutout: true }}
        className="bg-paper"
      />
    </>
  );
}
