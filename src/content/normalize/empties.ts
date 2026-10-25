import { unwrapNode, type NormalizeStep } from "@/content/normalize/types";

const SOLID_SELECTOR = "img, hr, br, table, pre, code, [data-mermaid], input";
const BLOCK_TAGS = new Set(["P", "DIV", "SECTION", "ARTICLE", "SPAN", "LI", "BLOCKQUOTE", "H1", "H2", "H3", "H4", "H5", "H6", "A", "STRONG", "EM", "B", "I"]);
const WRAPPER_TAGS = new Set(["SPAN", "FONT", "CENTER"]);

const isHollow = (node: Element) =>
  BLOCK_TAGS.has(node.tagName) &&
  !node.textContent?.trim() &&
  !node.matches(SOLID_SELECTOR) &&
  !node.querySelector(SOLID_SELECTOR);

export const empties: NormalizeStep = (root) => {
  const nodes = Array.from(root.querySelectorAll("*")).reverse();
  for (const node of nodes) {
    if (!node.isConnected) continue;
    if (isHollow(node)) {
      node.remove();
      continue;
    }
    if (WRAPPER_TAGS.has(node.tagName) && node.attributes.length === 0) unwrapNode(node);
  }
};
