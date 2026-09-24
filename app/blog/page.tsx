import type { Metadata } from "next";
import { BLOG_DESCRIPTION, BLOG_TITLE, BlogIndexView, blogPagination } from "@/components/blog/blog-index-view";
import { site } from "@/lib/site";

const title = "Blog: Oral Care, Haircare & Smart Saving Guides";

export const metadata: Metadata = {
  title,
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: `${BLOG_TITLE} by ${site.name}` }] },
  },
  openGraph: {
    type: "website",
    url: "/blog",
    siteName: site.name,
    locale: site.locale,
    title: `${BLOG_TITLE} | ${site.name}`,
    description: BLOG_DESCRIPTION,
    images: [{ url: site.ogImage, width: 1770, height: 753, alt: "A family unboxing a PoundMart value bundle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BLOG_TITLE} | ${site.name}`,
    description: BLOG_DESCRIPTION,
    images: [site.ogImage],
  },
};

export default function BlogPage() {
  const { totalPages } = blogPagination();
  return (
    <>
      {totalPages > 1 && <link rel="next" href="/blog/page/2" />}
      <BlogIndexView page={1} />
    </>
  );
}
