import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HighlightedText } from "../highlighted-text/HighlightedText";

const render = (text: string, query: string) =>
  renderToStaticMarkup(<HighlightedText text={text} query={query} />);

describe("HighlightedText", () => {
  it("marks the first case-insensitive match", () => {
    const html = render("Agent Builder agent", " agent ");

    expect(html).toMatch(/^<mark[^>]*>Agent<\/mark> Builder agent$/);
  });

  it("renders plain text when the query is blank or missing", () => {
    expect(render("Agent", "  ")).not.toContain("<mark");
    expect(render("Agent", "missing")).not.toContain("<mark");
  });
});
