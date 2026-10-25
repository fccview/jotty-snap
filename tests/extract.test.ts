import { describe, expect, test } from "bun:test";
import { extractPage } from "@/content/extract";
import { ClipMode } from "@/shared/enums";

const PAGE = `
<html lang="en">
  <head>
    <title>Fallback title</title>
    <meta property="og:title" content="The real title">
    <meta property="og:site_name" content="Example Blog">
    <meta name="author" content="Ada">
    <meta property="article:published_time" content="2026-10-01">
  </head>
  <body>
    <nav><a href="/">Home</a></nav>
    <article>
      <h1>The real title</h1>
      <p>First paragraph with a <a href="/link">link</a>.</p>
      <pre><code class="language-ts">const answer = 42;</code></pre>
      <script>tracking()</script>
    </article>
  </body>
</html>`;

const loadPage = () => {
  document.documentElement.innerHTML = PAGE;
  return document;
};

describe("extract", () => {
  test("full page keeps everything visible and reads metadata", () => {
    const page = extractPage(ClipMode.Page, loadPage());
    expect(page.meta.title).toBe("The real title");
    expect(page.meta.siteName).toBe("Example Blog");
    expect(page.meta.author).toBe("Ada");
    expect(page.meta.published).toBe("2026-10-01");
    expect(page.html).toContain('<a href="https://example.com/">Home</a>');
    expect(page.html).toContain('<pre><code class="language-typescript">const answer = 42;</code></pre>');
    expect(page.html).not.toContain("tracking");
  });

  test("article mode drops the chrome around the article", () => {
    const doc = loadPage();
    const article = doc.querySelector("article");
    const filler = "Readable sentences about snapping pages into Jotty notes. ".repeat(20);
    for (let index = 0; index < 4; index++) {
      const paragraph = doc.createElement("p");
      paragraph.textContent = filler;
      article?.appendChild(paragraph);
    }
    const page = extractPage(ClipMode.Article, doc);
    expect(page.html).toContain("First paragraph with a");
    expect(page.html).toContain('<pre><code class="language-typescript">const answer = 42;</code></pre>');
    expect(page.html).not.toContain(">Home<");
    expect(page.meta.author).toBe("Ada");
  });

  test("article mode drops the byline even when metadata already names the author", () => {
    const filler = "Frasi leggibili su come salvare le pagine come note in Jotty. ".repeat(20);
    document.documentElement.innerHTML = `
      <head>
        <title>Articolo</title>
        <script type="application/ld+json">{"@context":"https://schema.org","@type":"BlogPosting","headline":"Articolo","author":{"@type":"Person","name":"Giulia"},"datePublished":"2026-09-01"}</script>
      </head>
      <body lang="it">
        <article>
          <h1>Articolo</h1>
          <div class="post-byline"><a rel="author" href="/giulia"><img src="/giulia.png">Giulia</a> · 3 minuti di lettura</div>
          <p>${filler}</p>
          <p>${filler}</p>
        </article>
      </body>`;
    const page = extractPage(ClipMode.Article, document);
    expect(page.html).not.toContain("giulia.png");
    expect(page.html).not.toContain("minuti di lettura");
    expect(page.html).toContain("Frasi leggibili");
    expect(page.meta.author).toBe("Giulia");
    expect(page.meta.published).toBe("2026-09-01");
  });

  test("selection mode complains when nothing is selected", () => {
    loadPage();
    document.getSelection()?.removeAllRanges();
    expect(() => extractPage(ClipMode.Selection, document)).toThrow("Select some text");
  });

  test("selection mode keeps only the selected nodes", () => {
    const doc = loadPage();
    const paragraph = doc.querySelector("article p");
    const range = doc.createRange();
    if (paragraph) range.selectNode(paragraph);
    const selection = doc.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    const page = extractPage(ClipMode.Selection, doc);
    expect(page.html).toBe('<p>First paragraph with a <a href="https://example.com/link">link</a>.</p>');
  });
});
