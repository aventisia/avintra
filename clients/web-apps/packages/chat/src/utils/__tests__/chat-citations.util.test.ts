import { describe, expect, it } from "vitest";

import { linkCitations } from "../chat-citations.util";

const sources = [{ title: "Docs", url: "https://docs.dev/a", domain: "docs.dev" }];

describe("linkCitations", () => {
  it("links a marker to its source", () => {
    expect(linkCitations("A [1].", sources)).toBe("A [[1]](https://docs.dev/a).");
  });

  it("links adjacent markers", () => {
    const two = [...sources, { title: "B", url: "https://b.dev", domain: "b.dev" }];
    expect(linkCitations("x[1][2]", two)).toBe("x[[1]](https://docs.dev/a)[[2]](https://b.dev)");
  });

  it("leaves out-of-range markers and existing links alone", () => {
    expect(linkCitations("[2]", sources)).toBe("[2]");
    expect(linkCitations("[1](https://x.dev)", sources)).toBe("[1](https://x.dev)");
  });

  it("keeps a source url with parentheses or spaces inside the link", () => {
    const awkward = [
      { title: "Wiki", url: "https://en.wikipedia.org/wiki/Foo_(bar)", domain: "en.wikipedia.org" },
      { title: "Sp", url: "https://a.dev/a b", domain: "a.dev" },
    ];
    expect(linkCitations("x[1][2]", awkward)).toBe(
      "x[[1]](https://en.wikipedia.org/wiki/Foo_%28bar%29)[[2]](https://a.dev/a%20b)",
    );
  });

  it("leaves code untouched", () => {
    const fenced = "```\na[1]\n```";
    expect(linkCitations(fenced, sources)).toBe(fenced);
    expect(linkCitations("use `a[1]` here", sources)).toBe("use `a[1]` here");
  });

  it("returns the text as is without sources", () => {
    expect(linkCitations("A [1].", [])).toBe("A [1].");
  });
});
