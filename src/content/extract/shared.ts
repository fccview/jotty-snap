import { markHidden } from "@/content/extract/hidden";
import type { NormalizeCtx } from "@/content/normalize/types";
import { MAX_HTML_BYTES } from "@/shared/consts";
import { ErrorCode } from "@/shared/enums";
import { SnapError } from "@/shared/errors";

export const cloneVisible = (doc: Document) => {
  const reveal = markHidden(doc);
  try {
    return doc.cloneNode(true) as Document;
  } finally {
    reveal();
  }
};

export const blankRoot = () => {
  const doc = document.implementation.createHTMLDocument("");
  const root = doc.createElement("div");
  doc.body.appendChild(root);
  return { doc, root };
};

export const ctxFor = (doc: Document, baseUrl: string): NormalizeCtx => ({ doc, baseUrl });

export const ensureSize = (html: string) => {
  const bytes = new TextEncoder().encode(html).length;
  if (bytes > MAX_HTML_BYTES) {
    throw new SnapError(ErrorCode.TooLarge, "This page is too big to snap. Try selecting a part of it.");
  }
  return html;
};
