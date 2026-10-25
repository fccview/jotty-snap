import { blankRoot, cloneVisible, ctxFor, ensureSize } from "@/content/extract/shared";
import { tricorder } from "@/content/meta";
import { ALL_STEPS, runSteps } from "@/content/normalize";
import type { ExtractedPage } from "@/shared/types";

export const fullPage = (doc: Document): ExtractedPage => {
  const meta = tricorder(doc);
  const clone = cloneVisible(doc);
  const { doc: target, root } = blankRoot();
  root.append(...Array.from(clone.body.childNodes, (node) => target.importNode(node, true)));
  runSteps(root, ctxFor(target, meta.url), ALL_STEPS);
  return { html: ensureSize(root.innerHTML), meta };
};
