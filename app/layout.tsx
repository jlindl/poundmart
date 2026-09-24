import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ViewTransition } from "react";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Header, type MegaItem } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { collections } from "@/lib/products";
import { amazonStore, site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: "variable" });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: [{ url: site.ogImage, width: 1770, height: 753, alt: "A family unboxing a PoundMart value bundle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: [site.ogImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FBF7EE",
  width: "device-width",
  initialScale: 1,
};

const megaItems: MegaItem[] = collections.map((c) => ({
  title: c.title,
  href: `/collections/${c.slug}`,
  image: c.image,
  blurb: c.eyebrow,
  accent: c.accent,
}));

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${instrument.variable} antialiased`}
    >
      <body className="min-h-dvh overflow-x-clip">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: site.name,
              url: site.url,
              logo: `${site.url}${site.logo}`,
              slogan: site.tagline,
              description: site.description,
              sameAs: [amazonStore.home],
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: site.name,
              url: site.url,
            },
          ]}
        />
        <SmoothScroll>
          <Header megaItems={megaItems} />
          <ViewTransition>
            <main id="main">{children}</main>
          </ViewTransition>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
