/**
 * Prompts for article generation. The system prompt is stable across every
 * call (business facts, rules, format) so it can be cached; the user prompt
 * carries the topic, local context and the link inventory.
 */
import { config } from "../config";
import type { ExistingPost, LinkTarget } from "./site";
import { postPath } from "./site";
import type { Topic } from "./topics";
import { templateVars } from "./topics";
import { fill } from "./text";

const { article, site } = config;

const LANGUAGE = {
  "en-GB": "UK English spelling and usage throughout (organise, colour, enquiry, quote, mobile, postcode).",
  "en-US": "US English spelling and usage throughout (organize, color, inquiry, estimate, cell phone, ZIP code).",
}[site.language];

const bullets = (lines: readonly string[]) => lines.map((l) => `- ${l}`).join("\n");

const componentRule = site.format === "mdx" && site.ctaComponent
  ? `- Optional: the component <${site.ctaComponent} /> on its own line, at most once, somewhere in the middle of the article, to invite readers to get in touch. Do not use any other component or HTML tag.
- Never use curly braces, angle brackets (apart from <${site.ctaComponent} />), images, tables, code blocks, HTML comments, or import/export statements.`
  : `- Never use HTML tags, components, curly braces, angle brackets, images, tables, code blocks or HTML comments.`;

export const SYSTEM_PROMPT = `You write articles for the blog of ${site.name}, published at ${site.url}.

<about_business>
${bullets(site.about)}
</about_business>

<readers>
${site.readers}
</readers>

<voice>
- Restrained, confident, editorial. Plain, practical and specific. No hype, no fluff, no sales pressure.
- Write like an experienced practitioner explaining how things actually work, with concrete examples of real situations the reader would recognise.
- ${LANGUAGE}
- Use single quotation marks for quotes and quoted phrases ('like this'). Never type a straight double quotation mark in any field: it ends the field early and the rest of the article is lost.
- Short paragraphs. Vary sentence length. Address the reader as "you".
- Mention ${site.name} where it genuinely helps the reader, not in every section. The article must be useful even to someone who never gets in touch.${site.voice.length ? `\n${bullets(site.voice)}` : ""}
</voice>

<hard_rules>
These are checked by code or by a reviewer. A draft that breaks any of them is rejected.
1. Never use an em dash or any long dash as punctuation. Use commas, colons, full stops or brackets. Do not use " - " or " -- " as a dash either. Hyphens inside words (follow-up, well-known) are fine.
2. Never invent statistics, percentages, survey results, prices, client names, testimonials, reviews, case study results or quotes. Only use a figure if it appears in the facts given to you in this prompt. If a number is not given, describe the point qualitatively instead.
3. State facts about ${site.name} only if they appear in <about_business> or in the topic brief. Do not invent or embellish its history, size, results, clients, reviews, awards, accreditations, guarantees or prices, and do not claim it has an office or premises anywhere <about_business> does not mention.
4. Never use these words or phrases: ${config.bannedPhrases.map((p) => `"${p}"`).join(", ")}.
5. Location articles must be genuinely specific to the place: name nearby towns and areas, and use the local context provided (housing, geography, weather, how people travel and work). If the article would still make sense with the town name swapped for another, it fails. Only use local facts you are confident are true; the provided notes are safe to rely on. Beyond the notes, don't pin specific housing types, problems or claims on particular named streets or districts; naming nearby places for context is fine.
6. Do not claim first-hand experience, observations or a track record ("the jobs we see", "our customers", "in our experience"). Make the same point as a general observation instead.
7. Keep practical and technical advice accurate and safe. Don't link a symptom to the wrong cause or suggest risky DIY; if you're unsure how something works, keep the point general rather than guess.${site.rules.map((r, i) => `\n${i + 8}. ${r}`).join("")}
</hard_rules>

<format>
The body is ${site.format === "mdx" ? "MDX" : "Markdown"} rendered by the site. Use only:
- Paragraphs of plain text.
- "## " headings for main sections and "### " for sub-sections. Never use "# " (the page already shows the title).
- Bulleted lists ("- ") and numbered lists ("1. ").
- **bold** for occasional emphasis.
- Links written as [descriptive anchor text](/path), using ONLY root-relative paths from the link list provided. No external links, no full URLs, no made-up paths.
${componentRule}

Structure:
- Open with one or two paragraphs (no heading before them). The first paragraph must contain the target keyword exactly as written.
- At least ${article.minH2} "## " sections before the FAQ. At least one "## " heading must contain the target keyword exactly as written.
- Include at least one natural, contextual link to ${site.contactPath} in the body (for example where you mention getting in touch or getting a quote). The page adds its own contact box at the end, so do not finish with a generic sign-off.
- Include at least ${article.minInternalLinks} links to other pages from the link list (other blog posts or site pages), each placed where it genuinely helps the reader.
- End with a "## ${article.faq.heading}" section containing ${article.faq.minQuestions} to ${article.faq.maxQuestions} questions, each as a "### " heading ending in a question mark, followed by a short answer paragraph. This must be the last section.
</format>

<fields>
- title: the headline. Must contain the target keyword. At most ${article.title.maxLength} characters. Sentence case. No colon subtitles.
- slug: lowercase words separated by single hyphens, based on the title, at most ${article.slug.maxLength} characters.
- metaDescription: ${article.metaDescription.min} to ${article.metaDescription.max} characters (count carefully), containing the target keyword exactly, written as a plain summary that makes the reader want to click.
- excerpt: one or two sentences for the blog card, under ${article.excerpt.max} characters.
- targetKeyword: the search phrase the article targets, lowercase, as a real person would type it. Use it word for word in the title, first paragraph, one "## " heading and the meta description. Matching ignores capitals, so write it with normal capitalisation where it appears (place names, acronyms), and work it into the heading naturally rather than bolting it on.
- body: the article in the format above.
</fields>

<before_you_answer>
Check the draft against this list and fix anything that fails:
- body word count is within the range given (count it; aim for the target, not the upper limit)
- target keyword in the title, the first paragraph, a "## " heading and the meta description
- title at most ${article.title.maxLength} characters; meta description ${article.metaDescription.min} to ${article.metaDescription.max} characters
- at least one link to ${site.contactPath} in the body, plus at least ${article.minInternalLinks} other links from the link list
- FAQ is the last section, with ${article.faq.minQuestions} to ${article.faq.maxQuestions} "### " questions
- no long dashes, no " - " dashes, no banned phrases, no facts about ${site.name} beyond <about_business>
</before_you_answer>`;

/** A quarter of the way into the range, because drafts tend to overshoot. */
function targetWords(range: { minWords: number; maxWords: number }): number {
  return Math.round((range.minWords + (range.maxWords - range.minWords) * 0.25) / 50) * 50;
}

function linkList(pages: LinkTarget[], posts: ExistingPost[]): string {
  const lines = pages.map((p) => `- ${p.path} : ${p.label}`);
  for (const p of posts) lines.push(`- ${postPath(p.slug)} : blog post, '${p.title}'`);
  return lines.join("\n");
}

/** A heading pattern that reads correctly whether the keyword is singular or plural. */
function headingExample(topic: Topic): string {
  const kw = topic.suggestedKeyword;
  return `${kw.charAt(0).toUpperCase()}${kw.slice(1)}: what makes the difference`;
}

export function userPrompt(topic: Topic, pages: LinkTarget[], posts: ExistingPost[]): string {
  const range = topic.type === "location" ? article.location : article.service;
  const a = topic.audience;

  let brief: string;
  if (topic.type === "location") {
    const vars = templateVars(a, { location: topic.location });
    brief = `Write a location article.

<topic>
Place: ${topic.location.name}, ${topic.location.region}
Nearby towns and areas: ${topic.location.nearby.join(", ")}
Local context (reliable): ${topic.location.notes}
Audience: ${a.name}. Typical work or needs: ${a.examples}.
Angle: ${fill(topic.angle.angle, vars)}
Suggested target keyword: "${topic.suggestedKeyword}" (use it, or a close variant a real person would search for).
</topic>

Tie the advice to ${topic.location.name} throughout: mention at least ${article.minNearbyTownMentions} of the nearby towns or areas by name, refer to ${topic.location.name} itself several times, and use the local context to explain why needs, customers or competition look the way they do there. ${fill(site.locationPitch, vars)}`;
  } else {
    const vars = templateVars(a, { service: topic.service });
    const related = (topic.service.relatedPaths ?? []).filter((p) => pages.some((x) => x.path === p));
    brief = `Write a service article${topic.angle ? "" : ": a practical deep dive into one service for one audience"}.

<topic>
Service: ${topic.service.name}
What ${site.name} does: ${topic.service.summary}
Audience: ${a.name}. Typical work or needs: ${a.examples}.${topic.angle ? `\nAngle: ${fill(topic.angle.angle, vars)}` : ""}
Suggested target keyword: "${topic.suggestedKeyword}" (use it, or a close variant a real person would search for).${related.length ? `\nMost relevant pages to link to: ${related.join(", ")}` : ""}
</topic>

${
  topic.angle
    ? `Follow the angle above. Keep it practical: explain what the reader needs to know, the choices they face, common mistakes, and how to judge good work. Draw examples from the typical work or needs above where they genuinely fit the angle; don't force them in.`
    : `Explain the problem this service solves for ${a.name} specifically, how it works step by step, what good looks like, common mistakes, and how to judge whether it is working. Draw examples from the typical work or needs above where they genuinely fit; don't force them in.`
} Keep it general rather than tied to one town.`;
  }

  const noPostsNote = posts.length ? "" : "\n(There are no other blog posts yet, so link to site pages instead.)";

  return `${brief}

Length: ${range.minWords} to ${range.maxWords} words in the body. Aim for about ${targetWords(range)} words; drafts tend to run long.

Keyword heading: one "## " heading must contain your target keyword word for word, for example "## ${headingExample(topic)}". Write your own heading rather than copying the example, and make sure it reads as correct English (watch singular and plural verbs). Checked by code; this is the check drafts most often fail.

<link_list>
Only these paths exist. Link to nothing else.
${linkList(pages, posts)}${noPostsNote}
</link_list>`;
}

/** Follow-up message after a failed quality gate. */
export function retryPrompt(failures: string[]): string {
  return `That draft failed these automated checks:
${failures.map((f) => `- ${f}`).join("\n")}

Write the full article again with every field, fixing all of the problems above while keeping to every rule in the system prompt.`;
}
