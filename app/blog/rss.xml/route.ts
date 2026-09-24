import { getAllPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const dynamic = "force-static";

function xml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** YYYY-MM-DD to an RFC 822 date, pinned to 09:00 UTC so it is stable across builds. */
function rfc822(date: string) {
  return new Date(`${date}T09:00:00Z`).toUTCString();
}

/** RSS 2.0 feed of every published post. */
export function GET() {
  const posts = getAllPosts();
  const blogUrl = `${site.url}/blog`;
  const lastBuild = posts.reduce((latest, p) => {
    const d = p.updated ?? p.date;
    return d > latest ? d : latest;
  }, posts[0]?.date ?? site.catalogCheckedAt);

  const items = posts
    .map((p) => {
      const url = `${site.url}/blog/${p.slug}`;
      return [
        "    <item>",
        `      <title>${xml(p.title)}</title>`,
        `      <link>${xml(url)}</link>`,
        `      <guid isPermaLink="true">${xml(url)}</guid>`,
        `      <description>${xml(p.description)}</description>`,
        `      <pubDate>${rfc822(p.date)}</pubDate>`,
        `      <category>${xml(p.category)}</category>`,
        ...p.tags.map((t) => `      <category>${xml(t)}</category>`),
        `      <dc:creator>${xml(p.author)}</dc:creator>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${xml(`The Bundle Blog by ${site.name}`)}</title>`,
    `    <link>${xml(blogUrl)}</link>`,
    `    <description>${xml(
      "Practical guides from PoundMart on flavoured toothpaste, kids' brushing, curly hair care and buying everyday essentials for less.",
    )}</description>`,
    "    <language>en-gb</language>",
    `    <copyright>${xml(`© ${new Date(`${lastBuild}T00:00:00Z`).getUTCFullYear()} ${site.name}`)}</copyright>`,
    `    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>`,
    `    <atom:link href="${xml(`${blogUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    "    <image>",
    `      <url>${xml(`${site.url}${site.logo}`)}</url>`,
    `      <title>${xml(`The Bundle Blog by ${site.name}`)}</title>`,
    `      <link>${xml(blogUrl)}</link>`,
    "    </image>",
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
