import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BLOG_TITLE, BlogIndexView, blogPagination } from "@/components/blog/blog-index-view";
import { blogPageHref } from "@/components/blog/blog-utils";
import { site } from "@/lib/site";

/** Pages 2..N. Page 1 lives at /blog (and /blog/page/1 redirects there). */
export function generateStaticParams() {
  const { totalPages } = blogPagination();
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

function parsePage(raw: string) {
  return /^\d+$/.test(raw) ? Number(raw) : NaN;
}

export async function generateMetadata(props: PageProps<"/blog/page/[page]">): Promise<Metadata> {
  const { page: raw } = await props.params;
  const page = parsePage(raw);
  const { totalPages } = blogPagination();
  if (!Number.isInteger(page) || page < 2 || page > totalPages) return { robots: { index: false } };
  const title = `Blog Archive: Page ${page} of ${totalPages}`;
  const description = `Page ${page} of ${BLOG_TITLE}: older PoundMart guides on oral care, haircare, smart saving and family life, newest first.`;
  const path = blogPageHref(page);
  return {
    title,
    description,
    alternates: {
      canonical: path,
      types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: `${BLOG_TITLE} by ${site.name}` }] },
    },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.name,
      locale: site.locale,
      title: `${title} | ${site.name}`,
      description,
      images: [{ url: site.ogImage, width: 1770, height: 753, alt: "A family unboxing a PoundMart value bundle" }],
    },
  };
}

export default async function BlogArchivePage(props: PageProps<"/blog/page/[page]">) {
  const { page: raw } = await props.params;
  const page = parsePage(raw);
  if (page === 1) permanentRedirect("/blog");
  const { totalPages } = blogPagination();
  if (!Number.isInteger(page) || page < 2 || page > totalPages) notFound();

  return (
    <>
      <link rel="prev" href={blogPageHref(page - 1)} />
      {page < totalPages && <link rel="next" href={blogPageHref(page + 1)} />}
      <BlogIndexView page={page} />
    </>
  );
}
