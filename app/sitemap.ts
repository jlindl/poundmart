import type { MetadataRoute } from "next";
import { blogCategories, getAllPosts, postsInCategory } from "@/lib/blog";
import { blogPageHref, pageCount, pageSlice, splitLead } from "@/components/blog/blog-utils";
import { collections, isInStock, products } from "@/lib/products";
import { site } from "@/lib/site";

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const url = (path: string) => `${site.url}${path === "/" ? "" : path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const catalogChecked = day(site.catalogCheckedAt);
  const latestIso = posts.reduce<string | null>((max, p) => {
    const d = p.updated ?? p.date;
    return !max || d > max ? d : max;
  }, null);
  const latestPost = latestIso ? day(latestIso) : catalogChecked;
  const newest = latestPost > catalogChecked ? latestPost : catalogChecked;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: newest, changeFrequency: "daily", priority: 1 },
    { url: url("/shop"), lastModified: catalogChecked, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/blog"), lastModified: latestPost, changeFrequency: "daily", priority: 0.8 },
    { url: url("/about"), lastModified: catalogChecked, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/faq"), lastModified: catalogChecked, changeFrequency: "monthly", priority: 0.6 },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: url(`/collections/${c.slug}`),
    lastModified: catalogChecked,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: url(`/shop/${p.slug}`),
    lastModified: catalogChecked,
    changeFrequency: "weekly",
    priority: isInStock(p) ? 0.8 : 0.4,
    images: [url(p.primary.image)],
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: url(`/blog/${p.slug}`),
    lastModified: day(p.updated ?? p.date),
    changeFrequency: "monthly",
    priority: p.featured ? 0.8 : 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = blogCategories.map((c) => {
    const latest = postsInCategory(c.slug)[0];
    return {
      url: url(`/blog/category/${c.slug}`),
      lastModified: latest ? day(latest.updated ?? latest.date) : latestPost,
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  // Same maths as the /blog/page/[page] route: the lead story sits above page 1, the rest paginate 12 a page.
  const { rest } = splitLead(posts);
  const totalPages = pageCount(rest.length);
  const paginationRoutes: MetadataRoute.Sitemap = Array.from({ length: totalPages - 1 }, (_, i) => {
    const page = i + 2;
    const first = pageSlice(rest, page)[0];
    return {
      url: url(blogPageHref(page)),
      lastModified: first ? day(first.updated ?? first.date) : latestPost,
      changeFrequency: "daily",
      priority: 0.4,
    };
  });

  return [...staticRoutes, ...collectionRoutes, ...productRoutes, ...categoryRoutes, ...paginationRoutes, ...postRoutes];
}
