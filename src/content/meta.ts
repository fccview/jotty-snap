import { createLogger } from "@/shared/logger";
import type { PageMeta } from "@/shared/types";

const log = createLogger("meta");

const SITE_KEYS = ["og:site_name", "application-name", "twitter:site"];
const AUTHOR_KEYS = ["author", "parsely-author", "sailthru.author"];
const AUTHOR_HANDLE_KEYS = ["article:author", "twitter:creator"];
const DATE_KEYS = ["article:published_time", "datePublished", "pubdate", "date", "dc.date", "parsely-pub-date"];
const DESC_KEYS = ["description", "og:description", "twitter:description"];
const TITLE_KEYS = ["og:title", "twitter:title"];

const metaValue = (doc: Document, keys: string[]) => {
  for (const key of keys) {
    const node = doc.querySelector<HTMLMetaElement>(
      `meta[property="${key}"], meta[name="${key}"], meta[itemprop="${key}"]`,
    );
    const value = node?.content?.trim();
    if (value) return value;
  }
  return null;
};

export const METADATA_SELECTORS = 'script[type="application/ld+json"], meta';

const ARTICLE_TYPE = /Article|Posting|Report/;

type LdNode = Record<string, unknown>;

const isNode = (value: unknown): value is LdNode => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const flattenLd = (value: unknown): LdNode[] => {
  if (Array.isArray(value)) return value.flatMap(flattenLd);
  if (!isNode(value)) return [];
  return [value, ...flattenLd(value["@graph"])];
};

const typeOf = (node: LdNode) => [node["@type"]].flat().filter((type): type is string => typeof type === "string");

const nameOf = (value: unknown): string | null => {
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) return value.map(nameOf).filter(Boolean).join(", ") || null;
  return isNode(value) ? nameOf(value["name"]) : null;
};

const ldArticle = (doc: Document) => {
  for (const script of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    try {
      const found = flattenLd(JSON.parse(script.textContent ?? "")).find((node) => typeOf(node).some((type) => ARTICLE_TYPE.test(type)));
      if (found) return found;
    } catch (error) {
      log.debug("skipping unreadable json-ld", error);
    }
  }
  return null;
};

const timeValue = (doc: Document) => {
  const node = doc.querySelector<HTMLTimeElement>("article time[datetime], time[datetime]");
  return node?.dateTime || null;
};

const canonical = (doc: Document) => {
  const link = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  return link?.href || null;
};

export const tricorder = (doc: Document): PageMeta => {
  const ld = ldArticle(doc);
  return {
    url: doc.location?.href || canonical(doc) || doc.URL,
    title: metaValue(doc, TITLE_KEYS) || nameOf(ld?.["headline"]) || doc.title.trim() || doc.URL,
    siteName: metaValue(doc, SITE_KEYS) || nameOf(ld?.["publisher"]),
    author: metaValue(doc, AUTHOR_KEYS) || nameOf(ld?.["author"]) || metaValue(doc, AUTHOR_HANDLE_KEYS),
    published: metaValue(doc, DATE_KEYS) || nameOf(ld?.["datePublished"]) || timeValue(doc),
    description: metaValue(doc, DESC_KEYS) || nameOf(ld?.["description"]),
    lang: doc.documentElement.lang || null,
  };
};
