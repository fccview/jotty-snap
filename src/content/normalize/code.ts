import { make, type NormalizeCtx, type NormalizeStep } from "@/content/normalize/types";

export const LANGUAGE_CLASS = "language-";
export const MERMAID_LANGUAGE = "mermaid";

const CLASS_PATTERNS = Object.freeze([
  /(?:^|\s)(?:language|lang)-([\w#+.-]+)/i,
  /(?:^|\s)highlight-(?:source|text)-([\w#+.-]+)/i,
  /(?:^|\s)brush:\s*([\w#+.-]+)/i,
]);

const ATTR_NAMES = Object.freeze(["data-language", "data-lang", "lang"]);

const GUTTER_SELECTORS = Object.freeze([
  ".gutter",
  ".line-numbers-rows",
  ".linenodiv",
  ".hljs-ln-numbers",
  "[data-line-number]",
  ".react-syntax-highlighter-line-number",
]);

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  rb: "ruby",
  rs: "rust",
  "c++": "cpp",
  "c#": "csharp",
  cs: "csharp",
  text: "",
  plaintext: "",
  plain: "",
  none: "",
};

const fromClass = (node: Element) => {
  const className = node.getAttribute("class") ?? "";
  for (const pattern of CLASS_PATTERNS) {
    const match = className.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
};

const fromAttrs = (node: Element) => {
  for (const name of ATTR_NAMES) {
    const value = node.getAttribute(name);
    if (value && name !== "lang") return value;
    if (value && node.tagName === "PRE") return value;
  }
  return null;
};

const sniffNode = (node: Element | null) => (node ? fromClass(node) ?? fromAttrs(node) : null);

export const sniffLanguage = (pre: HTMLPreElement) => {
  const candidates = [pre.querySelector("code"), pre, pre.parentElement, pre.parentElement?.parentElement ?? null];
  for (const node of candidates) {
    const found = sniffNode(node);
    if (found) {
      const lower = found.toLowerCase();
      return LANGUAGE_ALIASES[lower] ?? lower;
    }
  }
  return "";
};

const readCode = (pre: HTMLPreElement) => {
  const copy = pre.cloneNode(true) as HTMLPreElement;
  for (const gutter of Array.from(copy.querySelectorAll(GUTTER_SELECTORS.join(",")))) gutter.remove();
  for (const br of Array.from(copy.querySelectorAll("br"))) br.replaceWith("\n");
  const lines = copy.querySelectorAll(".line, .code-line");
  if (lines.length > 0 && !copy.textContent?.includes("\n")) {
    return Array.from(lines, (line) => line.textContent ?? "").join("\n");
  }
  return (copy.textContent ?? "").replace(/\n$/, "");
};

const mermaidNode = (ctx: NormalizeCtx, source: string) =>
  make(ctx, "div", { "data-mermaid": "", "data-mermaid-content": source });

const codeNode = (ctx: NormalizeCtx, source: string, language: string) => {
  const pre = make(ctx, "pre");
  const code = make(ctx, "code", language ? { class: `${LANGUAGE_CLASS}${language}` } : {});
  code.textContent = source;
  pre.appendChild(code);
  return pre;
};

export const code: NormalizeStep = (root, ctx) => {
  for (const pre of Array.from(root.querySelectorAll("pre"))) {
    if (pre.parentElement?.closest("pre")) continue;
    const language = sniffLanguage(pre);
    const source = readCode(pre);
    const next = language === MERMAID_LANGUAGE ? mermaidNode(ctx, source) : codeNode(ctx, source, language);
    pre.replaceWith(next);
  }
};
