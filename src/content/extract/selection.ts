import { blankRoot, ctxFor, ensureSize } from "@/content/extract/shared";
import { markHidden } from "@/content/extract/hidden";
import { tricorder } from "@/content/meta";
import { ALL_STEPS, runSteps } from "@/content/normalize";
import { ErrorCode } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import type { ExtractedPage } from "@/shared/types";

const wrapInPre = (target: Document, range: Range, fragment: DocumentFragment) => {
  const host = range.commonAncestorContainer;
  const element = host instanceof Element ? host : host.parentElement;
  const pre = element?.closest("pre");
  if (!pre) return fragment;
  const shell = target.importNode(pre.cloneNode(false), false) as HTMLPreElement;
  const code = pre.querySelector("code");
  const inner = code ? (target.importNode(code.cloneNode(false), false) as HTMLElement) : shell;
  inner.textContent = fragment.textContent ?? "";
  if (inner !== shell) shell.appendChild(inner);
  return shell;
};

const collectRanges = (doc: Document) => {
  const selection = doc.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    throw new SnapError(ErrorCode.EmptySelection, "Select some text on the page first.");
  }
  return Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index));
};

export const readSelection = (doc: Document): ExtractedPage => {
  const meta = tricorder(doc);
  const ranges = collectRanges(doc);
  const { doc: target, root } = blankRoot();
  const reveal = markHidden(doc);
  try {
    for (const range of ranges) {
      const fragment = target.importNode(range.cloneContents(), true);
      root.append(wrapInPre(target, range, fragment));
    }
  } finally {
    reveal();
  }
  runSteps(root, ctxFor(target, meta.url), ALL_STEPS);
  return { html: ensureSize(root.innerHTML), meta };
};
