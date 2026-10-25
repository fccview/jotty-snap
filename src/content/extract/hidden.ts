import { HIDDEN_ATTR } from "@/content/normalize/types";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "LINK", "META", "HEAD", "TITLE", "NOSCRIPT", "TEMPLATE"]);

const isHidden = (node: Element, view: Window) => {
  if (SKIP_TAGS.has(node.tagName)) return false;
  const style = view.getComputedStyle(node);
  return style.display === "none" || style.visibility === "hidden";
};

const skipSubtree = (walker: TreeWalker) => {
  const sibling = walker.nextSibling();
  if (sibling) return sibling;
  while (walker.parentNode()) {
    const next = walker.nextSibling();
    if (next) return next;
  }
  return null;
};

export const markHidden = (doc: Document) => {
  const view = doc.defaultView;
  const marked: Element[] = [];
  if (!view || !doc.body) return () => undefined;

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node) {
    const element = node as Element;
    if (isHidden(element, view)) {
      element.setAttribute(HIDDEN_ATTR, "");
      marked.push(element);
      node = skipSubtree(walker);
    } else {
      node = walker.nextNode();
    }
  }

  return () => {
    for (const item of marked) item.removeAttribute(HIDDEN_ATTR);
  };
};
