import { hashtagLine } from "@/jotty/tags";
import type { ClipSettings, PageMeta } from "@/shared/types";

export enum FrontKey {
  Source = "source",
  Site = "site",
  Author = "author",
  Published = "published",
  Clipped = "clipped",
}

type BodyInput = {
  markdown: string;
  meta: PageMeta;
  tags: string[];
  clip: Pick<ClipSettings, "frontmatter" | "sourceLink">;
  now?: Date;
};

const BLOCK_GAP = "\n\n";

const yamlLine = (key: FrontKey, value: string | null) =>
  value ? `${key}: ${JSON.stringify(value)}` : null;

export const frontmatter = (meta: PageMeta, now: Date) => {
  const lines = [
    yamlLine(FrontKey.Source, meta.url),
    yamlLine(FrontKey.Site, meta.siteName),
    yamlLine(FrontKey.Author, meta.author),
    yamlLine(FrontKey.Published, meta.published),
    yamlLine(FrontKey.Clipped, now.toISOString()),
  ].filter((line): line is string => line !== null);
  return ["---", ...lines, "---"].join("\n");
};

const escapeLabel = (text: string) => text.replace(/([\\[\]])/g, "\\$1");

const wrapHref = (url: string) => (/[\s()<>]/.test(url) ? `<${url}>` : url);

export const sourceLine = (meta: PageMeta) => {
  const label = escapeLabel(meta.siteName ?? meta.title ?? meta.url);
  return `Source: [${label}](${wrapHref(meta.url)})`;
};

export const buildBody = ({ markdown, meta, tags, clip, now = new Date() }: BodyInput) => {
  const blocks = [
    clip.frontmatter ? frontmatter(meta, now) : null,
    markdown.trim() || null,
    clip.sourceLink ? sourceLine(meta) : null,
    hashtagLine(tags) || null,
  ].filter((block): block is string => block !== null);
  return `${blocks.join(BLOCK_GAP)}\n`;
};
