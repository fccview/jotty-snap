import type { PageMeta } from "@/shared/types";

const SITE_KEYS = ["og:site_name", "application-name", "twitter:site"];
const AUTHOR_KEYS = ["author", "article:author", "twitter:creator", "parsely-author", "sailthru.author"];
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

const timeValue = (doc: Document) => {
  const node = doc.querySelector<HTMLTimeElement>("article time[datetime], time[datetime]");
  return node?.dateTime || null;
};

const canonical = (doc: Document) => {
  const link = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  return link?.href || null;
};

export const tricorder = (doc: Document): PageMeta => ({
  url: doc.location?.href || canonical(doc) || doc.URL,
  title: metaValue(doc, TITLE_KEYS) || doc.title.trim() || doc.URL,
  siteName: metaValue(doc, SITE_KEYS),
  author: metaValue(doc, AUTHOR_KEYS),
  published: metaValue(doc, DATE_KEYS) || timeValue(doc),
  description: metaValue(doc, DESC_KEYS),
  lang: doc.documentElement.lang || null,
});

export const mergeMeta = (base: PageMeta, patch: Partial<PageMeta>): PageMeta => {
  const entries = Object.entries(patch).filter(([, value]) => Boolean(value));
  return { ...base, ...Object.fromEntries(entries) };
};
