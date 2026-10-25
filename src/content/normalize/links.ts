import { unwrapNode, type NormalizeStep } from "@/content/normalize/types";
import { absolutize } from "@/shared/urls";

const DEAD_HREF = /^(javascript:|#$|$)/i;
const CAMPAIGN_PARAM = /^utm_/i;

const siteOf = (url: URL) => url.hostname.replace(/^www\./, "");

const isPromo = (anchor: Element, href: string, baseUrl: string) => {
  if (anchor.textContent?.trim() || !anchor.querySelector("img")) return false;
  const target = URL.parse(href);
  const page = URL.parse(baseUrl);
  if (!target || !page || siteOf(target) === siteOf(page)) return false;
  return Array.from(target.searchParams.keys()).some((key) => CAMPAIGN_PARAM.test(key));
};

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
    const absolute = absolutize(href, ctx.baseUrl);
    if (isPromo(anchor, absolute, ctx.baseUrl)) {
      anchor.remove();
      continue;
    }
    anchor.setAttribute("href", absolute);
    if (!anchor.textContent?.trim() && !anchor.querySelector("img")) anchor.remove();
  }
};
