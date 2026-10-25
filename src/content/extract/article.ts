import { Readability } from "@mozilla/readability";
import { blankRoot, cloneVisible, ctxFor, ensureSize } from "@/content/extract/shared";
import { fullPage } from "@/content/extract/page";
import { METADATA_SELECTORS, tricorder } from "@/content/meta";
import { MAIN_STEPS, PREP_STEPS, runSteps } from "@/content/normalize";
import { createLogger } from "@/shared/logger";
import type { ExtractedPage } from "@/shared/types";

const log = createLogger("article");

const CHAR_THRESHOLD = 300;

export const readArticle = (doc: Document): ExtractedPage => {
  const meta = tricorder(doc);
  const clone = cloneVisible(doc);
  for (const node of Array.from(clone.querySelectorAll(METADATA_SELECTORS))) node.remove();
  runSteps(clone.body, ctxFor(clone, meta.url), PREP_STEPS);

  const article = new Readability(clone, {
    keepClasses: true,
    charThreshold: CHAR_THRESHOLD,
  }).parse();

  if (!article?.content) {
    log.warn("readability found no article, snapping the whole page instead");
    return fullPage(doc);
  }

  const { doc: target, root } = blankRoot();
  root.innerHTML = article.content;
  runSteps(root, ctxFor(target, meta.url), MAIN_STEPS);

  return {
    html: ensureSize(root.innerHTML),
    meta: {
      ...meta,
      author: meta.author ?? article.byline ?? null,
      description: meta.description ?? article.excerpt ?? null,
    },
  };
};
