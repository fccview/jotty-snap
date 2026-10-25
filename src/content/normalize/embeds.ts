import { make, type NormalizeCtx, type NormalizeStep } from "@/content/normalize/types";
import { absolutize } from "@/shared/urls";

type EmbedRule = {
  pattern: RegExp;
  label: string;
  watch: (parts: string[]) => string;
};

const EMBED_RULES: EmbedRule[] = [
  {
    pattern: /(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([\w-]{6,})/,
    label: "YouTube",
    watch: ([id]) => `https://www.youtube.com/watch?v=${id}`,
  },
  {
    pattern: /player\.vimeo\.com\/video\/(\d+)/,
    label: "Vimeo",
    watch: ([id]) => `https://vimeo.com/${id}`,
  },
  {
    pattern: /open\.spotify\.com\/embed\/(\w+\/\w+)/,
    label: "Spotify",
    watch: ([path]) => `https://open.spotify.com/${path}`,
  },
  {
    pattern: /codepen\.io\/([\w-]+)\/embed\/(?:preview\/)?(\w+)/,
    label: "CodePen",
    watch: ([user, id]) => `https://codepen.io/${user}/pen/${id}`,
  },
];

const describe = (src: string) => {
  for (const rule of EMBED_RULES) {
    const match = src.match(rule.pattern);
    if (match?.[1]) return { href: rule.watch(match.slice(1)), label: rule.label };
  }
  return null;
};

const linkBlock = (ctx: NormalizeCtx, href: string, text: string) => {
  const paragraph = make(ctx, "p");
  const anchor = make(ctx, "a", { href });
  anchor.textContent = text;
  paragraph.appendChild(anchor);
  return paragraph;
};

const replaceFrame = (frame: HTMLIFrameElement, ctx: NormalizeCtx) => {
  const src = frame.getAttribute("src") ?? frame.getAttribute("data-src") ?? "";
  const known = src ? describe(src) : null;
  if (!known) {
    frame.remove();
    return;
  }
  const title = frame.getAttribute("title")?.trim();
  frame.replaceWith(linkBlock(ctx, known.href, title ? `${known.label}: ${title}` : `${known.label} embed`));
};

const replaceMedia = (media: HTMLMediaElement, ctx: NormalizeCtx) => {
  const src = media.getAttribute("src") ?? media.querySelector("source")?.getAttribute("src");
  if (!src) {
    media.remove();
    return;
  }
  const label = media.tagName === "VIDEO" ? "Video" : "Audio";
  media.replaceWith(linkBlock(ctx, absolutize(src, ctx.baseUrl), label));
};

export const embeds: NormalizeStep = (root, ctx) => {
  for (const frame of Array.from(root.querySelectorAll("iframe"))) replaceFrame(frame, ctx);
  for (const media of Array.from(root.querySelectorAll<HTMLMediaElement>("video, audio"))) replaceMedia(media, ctx);
};
