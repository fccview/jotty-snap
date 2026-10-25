import { TAG_PATTERN } from "@/shared/consts";

export const toTag = (value: string): string | null => {
  const tag = value
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_/-]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^[^a-z]+/, "")
    .replace(/\/+$/, "");
  return TAG_PATTERN.test(tag) ? tag : null;
};

export const uniqueTags = (values: string[]) => {
  const tags = values.map(toTag).filter((tag): tag is string => tag !== null);
  return [...new Set(tags)];
};

export const hashtagLine = (tags: string[]) =>
  uniqueTags(tags)
    .map((tag) => `#${tag}`)
    .join(" ");
