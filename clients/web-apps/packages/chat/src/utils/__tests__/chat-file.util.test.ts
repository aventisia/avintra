import { describe, expect, it } from "vitest";

import {
  findChatFile,
  parseDelimited,
  readDataUrl,
  textAfterChatFile,
  textBeforeChatFile,
} from "../chat-file.util";

describe("findChatFile", () => {
  it("names an HTML file after its title", () => {
    const text =
      "Here it is:\n```html\n<html><head><title>Sales: Q3</title></head></html>\n```\nEnjoy.";
    expect(findChatFile(text)).toMatchObject({
      name: "Sales Q3.html",
      contentType: "text/html",
      isComplete: true,
    });
    expect(textBeforeChatFile(text)).toBe("Here it is:");
    expect(textAfterChatFile(text)).toBe("Enjoy.");
  });

  it("names SVG and Markdown files after their title or first heading, else by type", () => {
    const svg = "```svg\n<svg><title>Intake flow</title></svg>\n```";
    const md = "```markdown\nIntro\n\n# Vendor checklist\n- one\n```";
    expect(findChatFile(svg)?.name).toBe("Intake flow.svg");
    expect(findChatFile(md)?.name).toBe("Vendor checklist.md");
    expect(findChatFile("```csv\na,b\n```")?.name).toBe("Data.csv");
  });

  it("marks a fence that is still streaming as incomplete and hides it", () => {
    const text = "Building it\n```csv\nname,amount\nAcme,";
    expect(findChatFile(text)).toMatchObject({ name: "Data.csv", isComplete: false });
    expect(textBeforeChatFile(text)).toBe("Building it");
    expect(textAfterChatFile(text)).toBe("");
  });

  it("leaves code and chart fences inline", () => {
    const text = "```python\nprint(1)\n```\n```chart\n{}\n```";
    expect(findChatFile(text)).toBeNull();
    expect(textBeforeChatFile(text)).toBe(text.trim());
  });

  it("takes a bare HTML document as a file", () => {
    expect(findChatFile("<!DOCTYPE html><html><body>Hi</body></html>")?.contentType).toBe(
      "text/html",
    );
  });
});

describe("readDataUrl", () => {
  it("decodes percent-encoded and base64 payloads", () => {
    expect(readDataUrl(`data:text/csv;charset=utf-8,${encodeURIComponent("a,b\n€")}`)).toBe(
      "a,b\n€",
    );
    expect(readDataUrl("data:text/plain;base64,4oKsIG9r")).toBe("€ ok");
    expect(readDataUrl("https://example.com/a.csv")).toBeNull();
  });
});

describe("parseDelimited", () => {
  it("keeps quoted delimiters, quotes and newlines inside a cell", () => {
    expect(parseDelimited('name,note\r\n"Acme, Inc","said ""hi""\nthen left"\n', ",")).toEqual([
      ["name", "note"],
      ["Acme, Inc", 'said "hi"\nthen left'],
    ]);
    expect(parseDelimited("a\tb\n1\t", "\t")).toEqual([
      ["a", "b"],
      ["1", ""],
    ]);
  });
});
