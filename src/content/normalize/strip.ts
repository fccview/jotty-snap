import { HIDDEN_ATTR, type NormalizeStep } from "@/content/normalize/types";

export const JUNK_SELECTORS = Object.freeze([
  "script",
  "style",
  "link",
  "meta",
  "template",
  "noscript",
  "object",
  "embed",
  "canvas",
  "dialog",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  `[${HIDDEN_ATTR}]`,
  "[hidden]",
  '[aria-hidden="true"]:not(svg):not(img)',
  '[role="dialog"]',
  '[role="alertdialog"]',
  ".sr-only",
  ".visually-hidden",
]);

const dropComments = (root: HTMLElement) => {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  for (const comment of comments) comment.parentNode?.removeChild(comment);
};

const dropSvgs = (root: HTMLElement) => {
  for (const svg of Array.from(root.querySelectorAll("svg"))) {
    if (svg.closest("pre, code")) continue;
    svg.remove();
  }
};

export const strip: NormalizeStep = (root) => {
  for (const node of Array.from(root.querySelectorAll(JUNK_SELECTORS.join(",")))) {
    node.remove();
  }
  dropSvgs(root);
  dropComments(root);
};
