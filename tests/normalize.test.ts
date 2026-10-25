import { describe, expect, test } from "bun:test";
import { ALL_STEPS, runSteps } from "@/content/normalize";
import { bestSrc } from "@/content/normalize/images";
import { sniffLanguage } from "@/content/normalize/code";

const BASE = "https://example.com/blog/post";

const normalize = (html: string) => {
  const doc = document.implementation.createHTMLDocument("");
  const root = doc.createElement("div");
  root.innerHTML = html;
  doc.body.appendChild(root);
  runSteps(root, { doc, baseUrl: BASE }, ALL_STEPS);
  return root.innerHTML;
};

describe("images", () => {
  test("picks the biggest srcset candidate", () => {
    expect(bestSrc("a.jpg 320w, b.jpg 1280w, c.jpg 640w")).toBe("b.jpg");
    expect(bestSrc("a.jpg 1x, b.jpg 2x")).toBe("b.jpg");
  });

  test("swaps lazy placeholders for the real source and absolutizes it", () => {
    const html = normalize('<img src="data:image/gif;base64,R0lGOD" data-src="/img/cat.png" alt="Cat" class="lazy" width="600">');
    expect(html).toBe('<img src="https://example.com/img/cat.png" alt="Cat">');
  });

  test("drops tracking pixels", () => {
    expect(normalize('<p>Hi <img src="/t.gif" width="1" height="1"></p>')).toBe("<p>Hi </p>");
  });

  test("flattens picture elements", () => {
    const html = normalize('<picture><source srcset="/a.webp 1x, /b.webp 2x"><img src="/fallback.jpg"></picture>');
    expect(html).toBe('<img src="https://example.com/b.webp">');
  });
});

describe("links", () => {
  test("absolutizes and unwraps dead links", () => {
    const html = normalize('<p><a href="../about" class="x">About</a> <a href="javascript:void(0)">Nope</a></p>');
    expect(html).toBe('<p><a href="https://example.com/about">About</a> Nope</p>');
  });
});

describe("code", () => {
  test("detects languages from highlighter classes", () => {
    const doc = document.implementation.createHTMLDocument("");
    const wrap = doc.createElement("div");
    wrap.innerHTML = '<div class="highlight highlight-source-ts"><pre><span>const a = 1;</span></pre></div>';
    const pre = wrap.querySelector("pre");
    expect(pre && sniffLanguage(pre)).toBe("typescript");
  });

  test("rebuilds code blocks with a language class and plain text", () => {
    const html = normalize('<pre class="hljs language-js"><code><span class="k">let</span> x = 1;<br>x++;</code></pre>');
    expect(html).toBe('<pre><code class="language-javascript">let x = 1;\nx++;</code></pre>');
  });

  test("turns mermaid blocks into mermaid nodes", () => {
    const html = normalize('<pre><code class="language-mermaid">graph TD; A--&gt;B</code></pre>');
    expect(html).toContain('data-mermaid=""');
    expect(html).toContain('data-mermaid-content="graph TD; A-->B"');
  });

  test("drops line number gutters", () => {
    const html = normalize('<pre><code class="language-py"><span class="linenodiv">1\n2</span>print(1)</code></pre>');
    expect(html).toBe('<pre><code class="language-python">print(1)</code></pre>');
  });
});

describe("task lists", () => {
  test("turns github task lists into tiptap task items", () => {
    const html = normalize(
      '<ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" checked disabled> Done</li><li class="task-list-item"><input type="checkbox"> Todo</li></ul>',
    );
    expect(html).toBe(
      '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Done</p></li><li data-type="taskItem" data-checked="false"><p>Todo</p></li></ul>',
    );
  });
});

describe("callouts", () => {
  test("maps github alerts to jotty callouts", () => {
    const html = normalize(
      '<div class="markdown-alert markdown-alert-warning"><p class="markdown-alert-title">Warning</p><p>Careful</p></div>',
    );
    expect(html).toBe('<div data-type="callout" data-callout-type="warning"><p>Careful</p></div>');
  });

  test("maps [!TIP] blockquotes to success callouts", () => {
    const html = normalize("<blockquote><p>[!TIP] Use bun</p></blockquote>");
    expect(html).toBe('<div data-type="callout" data-callout-type="success"><p>Use bun</p></div>');
  });
});

describe("embeds and junk", () => {
  test("replaces youtube iframes with a link", () => {
    const html = normalize('<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Never"></iframe>');
    expect(html).toBe('<p><a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">YouTube: Never</a></p>');
  });

  test("removes scripts, forms and hidden nodes", () => {
    const html = normalize('<p>Keep</p><script>bad()</script><form><input></form><div hidden>gone</div><span aria-hidden="true">x</span>');
    expect(html).toBe("<p>Keep</p>");
  });

  test("keeps tex from katex as code", () => {
    const html = normalize(
      '<p>Area <span class="katex"><span class="katex-mathml"><math><semantics><annotation encoding="application/x-tex">\\pi r^2</annotation></semantics></math></span><span class="katex-html">pi r2</span></span></p>',
    );
    expect(html).toBe("<p>Area <code>$\\pi r^2$</code></p>");
  });
});

describe("blocks", () => {
  test("lifts image-only paragraphs so jotty doesn't leave an empty one", () => {
    expect(normalize('<p><img src="/a.png"></p><p>Text <img src="/b.png"></p>')).toBe(
      '<img src="https://example.com/a.png"><p>Text <img src="https://example.com/b.png"></p>',
    );
  });

  test("boxes details content in a single div after the summary", () => {
    const html = normalize("<details><summary>More</summary><p>One</p><div><p>Two</p></div></details>");
    expect(html).toBe("<details><summary>More</summary><div><p>One</p><div><p>Two</p></div></div></details>");
  });
});

describe("figures", () => {
  test("keeps the caption as an emphasised paragraph", () => {
    const html = normalize('<figure><img src="/a.png" alt="A"><figcaption>A nice picture</figcaption></figure>');
    expect(html).toBe('<img src="https://example.com/a.png" alt="A"><p><em>A nice picture</em></p>');
  });
});
