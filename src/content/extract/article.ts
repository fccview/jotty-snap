import { Readability } from "@mozilla/readability";
import { blankRoot, cloneVisible, ctxFor, ensureSize } from "@/content/extract/shared";
import { fullPage } from "@/content/extract/page";
import { mergeMeta, tricorder } from "@/content/meta";
import { MAIN_STEPS, PREP_STEPS, runSteps } from "@/content/normalize";
import { createLogger } from "@/shared/logger";
import type { ExtractedPage } from "@/shared/types";

const log = createLogger("article");

const CHAR_THRESHOLD = 300;

export const readArticle = (doc: Document): ExtractedPage => {
  const meta = tricorder(doc);
  const clone = cloneVisible(doc);
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
    meta: mergeMeta(meta, {
      title: article.title ?? undefined,
      author: article.byline ?? undefined,
      siteName: article.siteName ?? undefined,
      published: article.publishedTime ?? undefined,
      description: article.excerpt ?? undefined,
    }),
  };
};
