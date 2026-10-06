/**
 * Turns a generated article into a post file in the site's format.
 *
 * This is the adapter between the engine and the site. PoundMart's blog loader
 * (lib/blog.ts) validates `category` against its four categories and uses
 * `products` (product slugs) for covers and "Shop this article", so both come
 * from the topic's entry in data/services.json; the rest are the engine's keys.
 */
import matter from "gray-matter";
import { config } from "../config";
import type { Article } from "./claude";
import type { Topic } from "./topics";

/** Must match blogCategories in lib/blog.ts. */
const BLOG_CATEGORIES = ["Oral Care", "Haircare", "Smart Saving", "Family & Home"];

type SiteTopicFields = { category?: string; products?: string[] };

export function buildPostFile(article: Article, topic: Topic, date: string): string {
  const extra: SiteTopicFields = topic.type === "service" ? (topic.service as SiteTopicFields) : {};
  const category = extra.category && BLOG_CATEGORIES.includes(extra.category) ? extra.category : config.site.categories[topic.type];
  const tags = [
    topic.type === "service" ? (topic.service.term ?? topic.service.name).toLowerCase() : undefined,
    topic.audience.id === "households" ? undefined : topic.audience.name.toLowerCase(),
    topic.angle?.id === "how-to" ? "how to" : undefined,
  ].filter((t): t is string => Boolean(t));

  const data: Record<string, unknown> = {
    title: article.title,
    slug: article.slug,
    description: article.metaDescription,
    excerpt: article.excerpt,
    date,
    type: topic.type,
    category,
    targetKeyword: article.targetKeyword,
    ...(tags.length ? { tags } : {}),
    ...(extra.products?.length ? { products: extra.products } : {}),
    ...(topic.type === "location"
      ? { location: topic.location.name, region: topic.location.region }
      : { service: topic.service.name }),
    audience: topic.audience.name,
    author: config.site.author,
    topicKey: topic.key,
  };

  return matter.stringify(`\n${article.body.trim()}\n`, data);
}
