/**
 * Claude calls via the Anthropic SDK, with structured JSON output validated
 * against a Zod schema.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { config } from "../config";
import { SYSTEM_PROMPT } from "./prompts";

export const ArticleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  metaDescription: z.string(),
  excerpt: z.string(),
  targetKeyword: z.string(),
  body: z.string(),
});

export type Article = z.infer<typeof ArticleSchema>;

export type Usage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

export const emptyUsage = (): Usage => ({ inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 });

export function addUsage(a: Usage, b: Usage): Usage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
  };
}

/** Approximate USD cost at the configured model's list prices. */
export function costUsd(u: Usage): number {
  const p = config.model.pricing;
  return (
    (u.inputTokens * p.inputPerMTok +
      u.outputTokens * p.outputPerMTok +
      u.cacheReadTokens * p.cacheReadPerMTok +
      u.cacheWriteTokens * p.cacheWritePerMTok) /
    1_000_000
  );
}

export class GenerationError extends Error {
  constructor(
    message: string,
    /** Tokens spent before the failure, so the run log's cost stays honest. */
    readonly usage: Usage = emptyUsage(),
  ) {
    super(message);
  }
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    throw new GenerationError("ANTHROPIC_API_KEY is not set.");
  }
  return (client ??= new Anthropic());
}

/**
 * One structured-output turn. Pass the running conversation; the returned
 * `assistant` param should be appended before a retry turn so the model sees
 * its previous attempt.
 */
export async function generateStructured<T>(
  schema: z.ZodType<T>,
  system: string,
  messages: Anthropic.MessageParam[],
): Promise<{ data: T; usage: Usage; assistant: Anthropic.MessageParam }> {
  const response = await getClient().messages.parse({
    model: config.model.id,
    max_tokens: config.model.maxTokens,
    thinking: { type: "adaptive" },
    output_config: { effort: config.model.effort, format: zodOutputFormat(schema) },
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const usage: Usage = {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
  };

  if (response.stop_reason === "refusal") {
    throw new GenerationError("The model declined the request.", usage);
  }
  if (response.stop_reason === "max_tokens") {
    throw new GenerationError("The response hit the max_tokens limit and was cut off.", usage);
  }
  if (!response.parsed_output) {
    throw new GenerationError("The response did not match the expected schema.", usage);
  }

  return { data: response.parsed_output as T, usage, assistant: { role: "assistant", content: response.content } };
}

export async function generateArticle(messages: Anthropic.MessageParam[]) {
  const { data, usage, assistant } = await generateStructured(ArticleSchema, SYSTEM_PROMPT, messages);
  return { article: data, usage, assistant };
}
