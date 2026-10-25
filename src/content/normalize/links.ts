import { unwrapNode, type NormalizeStep } from "@/content/normalize/types";
import { absolutize } from "@/shared/urls";

const DEAD_HREF = /^(javascript:|#$|$)/i;

const isLocalAnchor = (href: string, baseUrl: string) => {
  if (!href.startsWith("#")) return false;
  return absolutize(href, baseUrl).split("#")[0] === baseUrl.split("#")[0];
};

export const links: NormalizeStep = (root, ctx) => {
  for (const anchor of Array.from(root.querySelectorAll("a"))) {
    const href = anchor.getAttribute("href")?.trim() ?? "";
    if (DEAD_HREF.test(href) || isLocalAnchor(href, ctx.baseUrl)) {
      unwrapNode(anchor);
      continue;
    }
    anchor.setAttribute("href", absolutize(href, ctx.baseUrl));
    if (!anchor.textContent?.trim() && !anchor.querySelector("img")) anchor.remove();
  }
};
