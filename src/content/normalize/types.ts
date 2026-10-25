export type NormalizeCtx = {
  baseUrl: string;
  doc: Document;
};

export type NormalizeStep = (root: HTMLElement, ctx: NormalizeCtx) => void;

export const HIDDEN_ATTR = "data-snap-hidden";

export enum CalloutKind {
  Info = "info",
  Warning = "warning",
  Success = "success",
  Danger = "danger",
}

export const swapNode = (from: Element, to: Node) => from.replaceWith(to);

export const unwrapNode = (node: Element) => node.replaceWith(...Array.from(node.childNodes));

export const make = <K extends keyof HTMLElementTagNameMap>(
  ctx: NormalizeCtx,
  tag: K,
  attrs: Record<string, string> = {},
) => {
  const node = ctx.doc.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
};
