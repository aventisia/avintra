import { describe, expect, it } from "vitest";

import { MAX_SELECTION_QUOTE_CHARS, composeSelectionQuote } from "../selection-quote.util";

describe("composeSelectionQuote", () => {
  it("quotes a selection into an empty composer", () => {
    expect(composeSelectionQuote("", { fileName: "plan.md", text: "line one\nline two" })).toBe(
      "About this part of plan.md:\n> line one\n> line two\n\n",
    );
  });

  it("keeps an existing draft and adds the quote after a blank line", () => {
    expect(composeSelectionQuote("Make it shorter  ", { fileName: "plan.md", text: "hello" })).toBe(
      "Make it shorter\n\nAbout this part of plan.md:\n> hello\n\n",
    );
  });

  it("trims the selection", () => {
    expect(composeSelectionQuote("", { fileName: "a.txt", text: "  \n hello \n " })).toBe(
      "About this part of a.txt:\n> hello\n\n",
    );
  });

  it("turns blank lines into a bare marker and normalises CRLF", () => {
    expect(composeSelectionQuote("", { fileName: "a.txt", text: "a\r\n\r\nb" })).toBe(
      "About this part of a.txt:\n> a\n>\n> b\n\n",
    );
  });

  it("returns null for blank selection", () => {
    expect(composeSelectionQuote("draft", { fileName: "a.txt", text: " \n\t" })).toBeNull();
  });

  it("cuts the selection at the cap and marks the cut", () => {
    const result = composeSelectionQuote("", {
      fileName: "notes.md",
      text: "x".repeat(MAX_SELECTION_QUOTE_CHARS + 50),
    })!;
    expect(result.match(/x/g)).toHaveLength(MAX_SELECTION_QUOTE_CHARS);
    expect(result.endsWith("\n> …\n\n")).toBe(true);
  });

  it("adds no cut marker at exactly the cap", () => {
    const result = composeSelectionQuote("", {
      fileName: "notes.md",
      text: "x".repeat(MAX_SELECTION_QUOTE_CHARS),
    })!;
    expect(result).not.toContain("…");
  });

  it("keeps file names with spaces and symbols verbatim", () => {
    expect(
      composeSelectionQuote("", { fileName: "Q3 > sales (v2).csv", text: "a" })!.split("\n")[0],
    ).toBe("About this part of Q3 > sales (v2).csv:");
  });
});
