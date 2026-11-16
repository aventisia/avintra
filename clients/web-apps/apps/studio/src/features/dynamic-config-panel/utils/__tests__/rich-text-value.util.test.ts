import { describe, expect, it } from "vitest";

import { toStoredRichTextValue } from "../rich-text-value.util";

describe("toStoredRichTextValue", () => {
  it("stores an empty editor as an empty string", () => {
    expect(toStoredRichTextValue("<p></p>")).toBe("");
  });

  it("stores a lone unformatted paragraph as plain text", () => {
    expect(toStoredRichTextValue("<p>Hi {{name}}</p>")).toBe("Hi {{name}}");
  });

  it("keeps HTML for escaped text, formatting, and multiple paragraphs", () => {
    expect(toStoredRichTextValue("<p>a &gt; b</p>")).toBe("<p>a &gt; b</p>");
    expect(toStoredRichTextValue("<p><strong>Hi</strong></p>")).toBe("<p><strong>Hi</strong></p>");
    expect(toStoredRichTextValue("<p>Hi,</p><p>Thanks</p>")).toBe("<p>Hi,</p><p>Thanks</p>");
  });

  it("unescapes expressions inside placeholders only", () => {
    expect(toStoredRichTextValue("<p>{{a &gt; b}}</p>")).toBe("{{a > b}}");
    expect(toStoredRichTextValue("<p>x &amp; {{a &amp;&amp; b &lt; c}}</p>")).toBe(
      "<p>x &amp; {{a && b < c}}</p>",
    );
  });
});
