import { make, type NormalizeStep } from "@/content/normalize/types";

export const figures: NormalizeStep = (root, ctx) => {
  for (const figure of Array.from(root.querySelectorAll("figure"))) {
    const caption = figure.querySelector("figcaption");
    const captionText = caption?.textContent?.trim();
    caption?.remove();
    const parts: Node[] = Array.from(figure.childNodes);
    if (captionText) {
      const paragraph = make(ctx, "p");
      const emphasis = make(ctx, "em");
      emphasis.textContent = captionText;
      paragraph.appendChild(emphasis);
      parts.push(paragraph);
    }
    figure.replaceWith(...parts);
  }
};
