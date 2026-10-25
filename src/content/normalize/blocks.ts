import { make, type NormalizeCtx, type NormalizeStep } from "@/content/normalize/types";

const isBareImage = (node: Element) => node.tagName === "IMG" || node.tagName === "BR";

const isImageLink = (node: Element) => node.tagName === "A" && Array.from(node.children).every(isBareImage);

const isImageOnly = (paragraph: Element) =>
  !paragraph.textContent?.trim() &&
  paragraph.querySelector("img") !== null &&
  Array.from(paragraph.children).every((child) => isBareImage(child) || isImageLink(child));

const liftImages = (root: HTMLElement) => {
  for (const paragraph of Array.from(root.querySelectorAll("p"))) {
    if (!isImageOnly(paragraph)) continue;
    paragraph.replaceWith(...Array.from(paragraph.querySelectorAll("img")));
  }
};

const boxDetails = (root: HTMLElement, ctx: NormalizeCtx) => {
  for (const details of Array.from(root.querySelectorAll("details"))) {
    const summary = details.querySelector(":scope > summary");
    const box = make(ctx, "div");
    for (const child of Array.from(details.childNodes)) {
      if (child !== summary) box.appendChild(child);
    }
    details.replaceChildren(...(summary ? [summary] : []), box);
  }
};

export const blocks: NormalizeStep = (root, ctx) => {
  liftImages(root);
  boxDetails(root, ctx);
};
