import { complete } from "@/ai/complete";
import { tagPrompt } from "@/ai/prompt";
import type { AiConfig } from "@/ai/providers/types";
import { uniqueTags } from "@/jotty/tags";
import { AI_MAX_TAGS, AI_MAX_TOKENS } from "@/shared/consts";
import { ErrorCode } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { createLogger } from "@/shared/logger";
import type { Catalog, PageMeta, TagSuggestion } from "@/shared/types";

const log = createLogger("ai:tagger");

const JSON_BLOCK = /\{[\s\S]*\}/;

type RawSuggestion = { tags?: unknown; category?: unknown };

const matchCategory = (value: unknown, catalog: Catalog) => {
  if (typeof value !== "string") return null;
  const wanted = value.trim().replace(/^\/+|\/+$/g, "");
  if (!wanted) return null;
  const existing = catalog.categories.find((path) => path.toLowerCase() === wanted.toLowerCase());
  return existing ?? wanted;
};

export const readReply = (reply: string, catalog: Catalog): TagSuggestion => {
  const block = reply.match(JSON_BLOCK)?.[0];
  if (!block) throw new SnapError(ErrorCode.Ai, "The AI answer had no JSON in it");
  let parsed: RawSuggestion;
  try {
    parsed = JSON.parse(block) as RawSuggestion;
  } catch (error) {
    log.warn("could not parse ai answer", reply.slice(0, 300), error);
    throw new SnapError(ErrorCode.Ai, "The AI answer was not valid JSON");
  }
  const tags = Array.isArray(parsed.tags) ? parsed.tags.filter((tag): tag is string => typeof tag === "string") : [];
  return {
    tags: uniqueTags(tags).slice(0, AI_MAX_TAGS),
    category: matchCategory(parsed.category, catalog),
  };
};

export const jarvis = async (
  config: AiConfig,
  markdown: string,
  meta: PageMeta,
  catalog: Catalog,
): Promise<TagSuggestion> => {
  const reply = await complete(config, tagPrompt(markdown, meta, catalog), { maxTokens: AI_MAX_TOKENS });
  return readReply(reply, catalog);
};
