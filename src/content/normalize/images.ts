import { make, swapNode, type NormalizeCtx, type NormalizeStep } from "@/content/normalize/types";
import { absolutize } from "@/shared/urls";

export const LAZY_ATTRS = Object.freeze([
  "data-src",
  "data-lazy-src",
  "data-original",
  "data-lazy",
  "data-url",
  "data-hi-res-src",
  "data-full-src",
]);

export const LAZY_SRCSET_ATTRS = Object.freeze(["data-srcset", "data-lazy-srcset"]);

const PLACEHOLDER_SRC = /^data:image\/(gif|png|svg\+xml)[^,]*,/i;
const MAX_DATA_URI = 100_000;
const TRACKER_SIZE = 2;

type Candidate = { url: string; weight: number };

const parseCandidate = (part: string): Candidate | null => {
  const [url, descriptor = "1x"] = part.trim().split(/\s+/);
  if (!url) return null;
  const weight = Number.parseFloat(descriptor) || 1;
  return { url, weight: descriptor.endsWith("w") ? weight : weight * 1000 };
};

export const bestSrc = (srcset: string): string | null => {
  const candidates = srcset
    .split(/,\s+(?=\S)/)
    .map(parseCandidate)
    .filter((entry): entry is Candidate => entry !== null)
    .sort((a, b) => b.weight - a.weight);
  return candidates[0]?.url ?? null;
};

const lazySrc = (img: HTMLImageElement) => {
  for (const attr of LAZY_ATTRS) {
    const value = img.getAttribute(attr);
    if (value) return value;
  }
  for (const attr of LAZY_SRCSET_ATTRS) {
    const value = img.getAttribute(attr);
    if (value) return bestSrc(value);
  }
  return null;
};

const pictureSrc = (img: HTMLImageElement) => {
  const picture = img.closest("picture");
  if (!picture) return null;
  for (const source of Array.from(picture.querySelectorAll("source"))) {
    const srcset = source.getAttribute("srcset") ?? source.getAttribute("data-srcset");
    const best = srcset ? bestSrc(srcset) : null;
    if (best) return best;
  }
  return null;
};

const resolveSrc = (img: HTMLImageElement) => {
  const current = img.getAttribute("src") ?? "";
  const isPlaceholder = !current || PLACEHOLDER_SRC.test(current);
  const lazy = lazySrc(img);
  if (lazy && isPlaceholder) return lazy;
  const srcset = img.getAttribute("srcset");
  const fromSet = srcset ? bestSrc(srcset) : null;
  return fromSet ?? pictureSrc(img) ?? (isPlaceholder ? lazy : current) ?? current;
};

const isTracker = (img: HTMLImageElement) => {
  const width = Number(img.getAttribute("width"));
  const height = Number(img.getAttribute("height"));
  return width > 0 && height > 0 && width <= TRACKER_SIZE && height <= TRACKER_SIZE;
};

const isJunk = (src: string) =>
  !src || (src.startsWith("data:") && (PLACEHOLDER_SRC.test(src) || src.length > MAX_DATA_URI));

const fixImage = (img: HTMLImageElement, ctx: NormalizeCtx) => {
  const src = resolveSrc(img);
  if (isTracker(img) || !src || isJunk(src)) {
    img.remove();
    return;
  }
  const clean = make(ctx, "img", { src: absolutize(src, ctx.baseUrl) });
  const alt = img.getAttribute("alt")?.trim();
  const title = img.getAttribute("title")?.trim();
  if (alt) clean.setAttribute("alt", alt);
  if (title) clean.setAttribute("title", title);
  swapNode(img, clean);
};

const flattenPictures = (root: HTMLElement) => {
  for (const picture of Array.from(root.querySelectorAll("picture"))) {
    const img = picture.querySelector("img");
    if (img) picture.replaceWith(img);
    else picture.remove();
  }
};

export const images: NormalizeStep = (root, ctx) => {
  for (const img of Array.from(root.querySelectorAll("img"))) fixImage(img, ctx);
  flattenPictures(root);
};
