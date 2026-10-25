import { describe, expect, test } from "bun:test";
import { buildBody, sourceLine } from "@/jotty/note-body";
import { hashtagLine, toTag, uniqueTags } from "@/jotty/tags";
import type { PageMeta } from "@/shared/types";

const META: PageMeta = {
  url: "https://example.com/post",
  title: "A [great] post",
  siteName: "Example",
  author: 'Ada "Countess" Lovelace',
  published: "2026-10-01",
  description: null,
  lang: "en",
};

const NOW = new Date("2026-10-25T10:00:00.000Z");

describe("tags", () => {
  test("normalizes free text into jotty tags", () => {
    expect(toTag("#Web Dev")).toBe("web-dev");
    expect(toTag("Dev//Rust/")).toBe("dev/rust");
    expect(toTag("123abc")).toBe("abc");
    expect(toTag("!!!")).toBeNull();
  });

  test("dedupes and renders hashtags", () => {
    expect(uniqueTags(["Clip", "clip", "web"])).toEqual(["clip", "web"]);
    expect(hashtagLine(["clip", "dev/rust"])).toBe("#clip #dev/rust");
  });
});

describe("note body", () => {
  test("adds frontmatter, the markdown, a source link and hashtags", () => {
    const body = buildBody({
      markdown: "# Hello\n\nWorld\n",
      meta: META,
      tags: ["clip", "Reading"],
      clip: { frontmatter: true, sourceLink: true },
      now: NOW,
    });
    expect(body).toBe(
      [
        "---",
        'source: "https://example.com/post"',
        'site: "Example"',
        'author: "Ada \\"Countess\\" Lovelace"',
        'published: "2026-10-01"',
        'clipped: "2026-10-25T10:00:00.000Z"',
        "---",
        "",
        "# Hello\n\nWorld",
        "",
        "Source: [Example](https://example.com/post)",
        "",
        "#clip #reading",
        "",
      ].join("\n"),
    );
  });

  test("leaves optional parts out", () => {
    const body = buildBody({
      markdown: "Just text",
      meta: META,
      tags: [],
      clip: { frontmatter: false, sourceLink: false },
      now: NOW,
    });
    expect(body).toBe("Just text\n");
  });

  test("escapes brackets in the source label and wraps odd urls", () => {
    const line = sourceLine({ ...META, siteName: null, url: "https://example.com/a (b)" });
    expect(line).toBe("Source: [A \\[great\\] post](<https://example.com/a (b)>)");
  });
});
