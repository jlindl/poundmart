import { Reveal } from "@/components/motion/reveal";
import { PostCard } from "@/components/blog/post-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { featuredPosts } from "@/lib/blog";

/** Three latest or featured guides from the blog. Renders nothing until posts exist. */
export function FromTheBlog() {
  const posts = featuredPosts(3);
  if (posts.length === 0) return null;
  const [lead, ...rest] = posts;

  return (
    <section className="relative bg-cream py-24 md:py-32 lg:py-40">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="From the blog"
            title="Smart *little* guides."
            intro={
              <p className="text-ink-soft">
                Brushing routines for the whole family, curly hair wash days, and how to tell if a bundle really is better value.
              </p>
            }
          />
          <Reveal delay={0.15} className="shrink-0">
            <ButtonLink href="/blog" variant="outline" size="lg">
              Read the blog
            </ButtonLink>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:gap-6">
          <Reveal y={40} className="md:col-span-2">
            <PostCard post={lead} variant="feature" />
          </Reveal>
          {rest.map((post, i) => (
            <Reveal key={post.slug} y={40} delay={0.08 * (i + 1)}>
              <PostCard post={post} className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
