import type { NormalizeStep } from "@/content/normalize/types";

export const KEPT_ATTRS = new Set([
  "href",
  "src",
  "alt",
  "title",
  "colspan",
  "rowspan",
  "start",
  "open",
  "data-type",
  "data-checked",
  "data-callout-type",
  "data-mermaid",
  "data-mermaid-content",
]);

const KEPT_CLASS = /^language-/;

const tidyClass = (node: Element) => {
  const kept = Array.from(node.classList).filter((name) => KEPT_CLASS.test(name));
  if (kept.length > 0) node.setAttribute("class", kept.join(" "));
  else node.removeAttribute("class");
};

export const attrs: NormalizeStep = (root) => {
  for (const node of Array.from(root.querySelectorAll("*"))) {
    for (const attr of Array.from(node.attributes)) {
      if (attr.name === "class") continue;
      if (!KEPT_ATTRS.has(attr.name)) node.removeAttribute(attr.name);
    }
    if (node.hasAttribute("class")) tidyClass(node);
  }
};
