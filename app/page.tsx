import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { Bestsellers } from "@/components/home/bestsellers";
import { BrandFilm } from "@/components/home/brand-film";
import { BundleMaths } from "@/components/home/bundle-maths";
import { CategoryPanels } from "@/components/home/category-panels";
import { FinalCta } from "@/components/home/final-cta";
import { FlavourPicker } from "@/components/home/flavour-picker";
import { FlavourTicker } from "@/components/home/flavour-ticker";
import { FromTheBlog } from "@/components/home/from-the-blog";
import { HomeHero } from "@/components/home/hero";
import { HomeFaq } from "@/components/home/home-faq";
import { RatingsWall } from "@/components/home/ratings-wall";
import { WashDay } from "@/components/home/wash-day";
import { WhyPoundMart } from "@/components/home/why-poundmart";
import {
  bestsellers,
  bundleMathsData,
  categoryData,
  flavourOptions,
  haircareScents,
  heroData,
  homeFaqs,
  priceNote,
  ratingStats,
  ratingTiles,
  storeLinks,
  toothpasteFlavours,
  washDayProducts,
  whyStats,
} from "@/components/home/home-data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${site.name} | Great Value Toothpaste & Haircare Bundles` },
  description:
    "Great value multi-packs of Nice Smile flavoured toothpaste and XHC haircare. Pay less per tube, bottle and bar. Sold by PoundMart, dispatched by Amazon, with 30-day returns.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const hero = heroData();
  const categories = categoryData();
  const stats = ratingStats();
  const faqs = homeFaqs();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <HomeHero data={hero} />
      <FlavourTicker flavours={toothpasteFlavours} scents={haircareScents} />
      <BundleMaths data={bundleMathsData()} />
      <BrandFilm storeHref={storeLinks.home} />
      <CategoryPanels {...categories} />
      <Bestsellers items={bestsellers()} storeHref={storeLinks.shopAll} priceNote={priceNote} />
      <FlavourPicker flavours={flavourOptions()} priceNote={priceNote} />
      <WhyPoundMart stats={whyStats()} storeHref={storeLinks.home} />
      <WashDay products={washDayProducts()} haircareHref={storeLinks.haircare} priceNote={priceNote} />
      <RatingsWall tiles={ratingTiles()} average={stats.average} total={stats.count} storeHref={storeLinks.home} />
      <FromTheBlog />
      <HomeFaq items={faqs} storeHref={storeLinks.home} />
      <FinalCta storeHref={storeLinks.home} shopAllHref={storeLinks.shopAll} />
    </>
  );
}
