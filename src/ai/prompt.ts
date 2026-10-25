import { ChatRole, type ChatMessage } from "@/ai/providers/types";
import { AI_CONTENT_CHARS, AI_MAX_TAGS } from "@/shared/consts";
import type { Catalog, PageMeta } from "@/shared/types";

const LIST_LIMIT = 300;

const SYSTEM_PROMPT = [
  "You file web clippings into a personal notes app called Jotty.",
  `Pick up to ${AI_MAX_TAGS} tags and one category for the page you are given.`,
  "Tags are lowercase, start with a letter, and use only a-z, 0-9, dashes and underscores. A slash nests a tag, like dev/rust.",
  "Strongly prefer tags and categories that already exist. Only invent a new one when nothing existing fits.",
  "A category is a folder path like Work/Research. Return null for category when no existing one fits and the page does not clearly deserve a new one.",
  'Answer with JSON only, no prose and no code fence: {"tags": ["..."], "category": "..." | null}',
].join("\n");

const listOrNone = (items: string[]) => (items.length ? items.slice(0, LIST_LIMIT).join(", ") : "(none yet)");

const describePage = (meta: PageMeta) =>
  [
    `Title: ${meta.title}`,
    `URL: ${meta.url}`,
    meta.siteName ? `Site: ${meta.siteName}` : null,
    meta.description ? `Summary: ${meta.description}` : null,
  ]
    .filter(Boolean)
    .join("\n");

export const tagPrompt = (markdown: string, meta: PageMeta, catalog: Catalog): ChatMessage[] => [
  { role: ChatRole.System, content: SYSTEM_PROMPT },
  {
    role: ChatRole.User,
    content: [
      `Existing tags: ${listOrNone(catalog.tags)}`,
      `Existing categories: ${listOrNone(catalog.categories)}`,
      "",
      describePage(meta),
      "",
      "Content:",
      markdown.slice(0, AI_CONTENT_CHARS),
    ].join("\n"),
  },
];
