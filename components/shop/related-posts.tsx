import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Post } from "@/lib/blog";
import { cn } from "@/lib/utils";

/** Blog cards under a product or collection. Server Component (PostCard reads the filesystem). */
export function RelatedPosts({
  posts,
  eyebrow = "From the blog",
  title,
  intro,
  viewAll,
  className,
}: {
  posts: Post[];
  eyebrow?: string;
  title: string;
  intro?: string;
  viewAll?: { href: string; label: string };
  className?: string;
}) {
  if (posts.length === 0) return null;
  return (
    <section className={cn("py-24 lg:py-32", className)}>
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
          {viewAll && (
            <Link
              href={viewAll.href}
              className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border-2 border-ink/15 px-5 py-3 font-semibold text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-cream md:self-auto"
            >
              {viewAll.label}
              <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {posts.map((post) => (
            <RevealItem key={post.slug} className="h-full">
              <PostCard post={post} className="h-full" />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
