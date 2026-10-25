import { CalloutKind, make, type NormalizeCtx, type NormalizeStep } from "@/content/normalize/types";

export const CALLOUT_TYPE = "callout";

const KIND_WORDS: Record<string, CalloutKind> = {
  note: CalloutKind.Info,
  info: CalloutKind.Info,
  important: CalloutKind.Info,
  abstract: CalloutKind.Info,
  summary: CalloutKind.Info,
  question: CalloutKind.Info,
  tip: CalloutKind.Success,
  hint: CalloutKind.Success,
  success: CalloutKind.Success,
  check: CalloutKind.Success,
  done: CalloutKind.Success,
  warning: CalloutKind.Warning,
  caution: CalloutKind.Warning,
  attention: CalloutKind.Warning,
  danger: CalloutKind.Danger,
  error: CalloutKind.Danger,
  failure: CalloutKind.Danger,
  bug: CalloutKind.Danger,
};

const SOURCES = Object.freeze([
  { selector: ".markdown-alert", prefix: "markdown-alert-", title: ".markdown-alert-title" },
  { selector: ".admonition", prefix: "", title: ".admonition-title" },
  { selector: ".callout", prefix: "callout-", title: ".callout-title" },
  { selector: "aside.note, aside.warning, aside.tip", prefix: "", title: null },
]);

const MARKER = /^\s*\[!(\w+)\]\s*/;

const kindFromClass = (node: Element, prefix: string) => {
  for (const name of Array.from(node.classList)) {
    const word = prefix && name.startsWith(prefix) ? name.slice(prefix.length) : name;
    const kind = KIND_WORDS[word.toLowerCase()];
    if (kind) return kind;
  }
  return CalloutKind.Info;
};

const buildCallout = (ctx: NormalizeCtx, kind: CalloutKind, children: Node[]) => {
  const box = make(ctx, "div", { "data-type": CALLOUT_TYPE, "data-callout-type": kind });
  box.append(...children);
  return box;
};

const fromClasses = (root: HTMLElement, ctx: NormalizeCtx) => {
  for (const source of SOURCES) {
    for (const node of Array.from(root.querySelectorAll(source.selector))) {
      if (node.closest(`[data-type="${CALLOUT_TYPE}"]`)) continue;
      const kind = kindFromClass(node, source.prefix);
      if (source.title) node.querySelector(source.title)?.remove();
      node.replaceWith(buildCallout(ctx, kind, Array.from(node.childNodes)));
    }
  }
};

const fromQuotes = (root: HTMLElement, ctx: NormalizeCtx) => {
  for (const quote of Array.from(root.querySelectorAll("blockquote"))) {
    const first = quote.firstElementChild;
    const match = first?.textContent?.match(MARKER);
    if (!first || !match?.[1]) continue;
    const kind = KIND_WORDS[match[1].toLowerCase()];
    if (!kind) continue;
    const textNode = first.firstChild;
    if (textNode?.nodeType === Node.TEXT_NODE) textNode.textContent = (textNode.textContent ?? "").replace(MARKER, "");
    if (!first.textContent?.trim()) first.remove();
    quote.replaceWith(buildCallout(ctx, kind, Array.from(quote.childNodes)));
  }
};

export const callouts: NormalizeStep = (root, ctx) => {
  fromClasses(root, ctx);
  fromQuotes(root, ctx);
};
