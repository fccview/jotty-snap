import { make, type NormalizeCtx, type NormalizeStep } from "@/content/normalize/types";

const TEX_ANNOTATION = 'annotation[encoding="application/x-tex"]';
const KATEX_BLOCK = ".katex-display";
const KATEX_INLINE = ".katex";
const MATHJAX_SCRIPT = 'script[type^="math/tex"]';

const texNode = (ctx: NormalizeCtx, tex: string, block: boolean) => {
  if (!block) {
    const inline = make(ctx, "code");
    inline.textContent = `$${tex}$`;
    return inline;
  }
  const pre = make(ctx, "pre");
  const code = make(ctx, "code", { class: "language-latex" });
  code.textContent = tex;
  pre.appendChild(code);
  return pre;
};

const fromKatex = (root: HTMLElement, ctx: NormalizeCtx) => {
  for (const selector of [KATEX_BLOCK, KATEX_INLINE]) {
    for (const node of Array.from(root.querySelectorAll(selector))) {
      const tex = node.querySelector(TEX_ANNOTATION)?.textContent?.trim();
      if (tex) node.replaceWith(texNode(ctx, tex, selector === KATEX_BLOCK));
    }
  }
};

const fromMathml = (root: HTMLElement, ctx: NormalizeCtx) => {
  for (const math of Array.from(root.querySelectorAll("math"))) {
    const tex = math.querySelector(TEX_ANNOTATION)?.textContent?.trim();
    if (tex) math.replaceWith(texNode(ctx, tex, math.getAttribute("display") === "block"));
  }
};

const fromMathjax = (root: HTMLElement, ctx: NormalizeCtx) => {
  for (const script of Array.from(root.querySelectorAll(MATHJAX_SCRIPT))) {
    const tex = script.textContent?.trim();
    if (!tex) continue;
    const block = (script.getAttribute("type") ?? "").includes("mode=display");
    script.replaceWith(texNode(ctx, tex, block));
  }
};

export const math: NormalizeStep = (root, ctx) => {
  fromMathjax(root, ctx);
  fromKatex(root, ctx);
  fromMathml(root, ctx);
};
