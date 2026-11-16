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

  it("names spec files after the document heading or JSON title, else by type", () => {
    const doc = "```doc-spec\n# Q3 review\n\nBody\n```";
    const sheet = '```sheet-spec\n{"title": "Spend: Q3", "columns": ["A"], "rows": [["x"]]}\n```';
    const slides =
      '```slide-spec\n{"title": "Launch", "slides": [{"title": "Goal", "bullets": ["Ship"]}]}\n```';
    expect(findChatFile(doc)).toMatchObject({
      name: "Q3 review.docx",
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      isComplete: true,
    });
    expect(findChatFile(sheet)?.name).toBe("Spend Q3.xlsx");
    expect(findChatFile(slides)?.name).toBe("Launch.pptx");
    expect(findChatFile('```sheet-spec\n{"columns": ["A"], "rows": []}\n```')?.name).toBe(
      "Data.xlsx",
    );
    expect(findChatFile("```doc-spec\nBody without heading\n```")?.name).toBe("Document.docx");
  });

  it("marks a spec fence that is still streaming as incomplete and hides it", () => {
    // Truncated JSON has no readable title yet, so the card shows the fallback name.
    const text = 'Building it\n```sheet-spec\n{"title": "Spend", "colu';
    expect(findChatFile(text)).toMatchObject({ name: "Data.xlsx", isComplete: false });
    expect(textBeforeChatFile(text)).toBe("Building it");
    expect(textAfterChatFile(text)).toBe("");
  });

  it("keeps a doc-spec body with nested code fences whole", () => {
    const text = "Memo\n```doc-spec\n# Plan\n\n```\nreconcile(total)\n```\nDone\n```";
    expect(findChatFile(text)).toMatchObject({
      name: "Plan.docx",
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      body: "# Plan\n\n```\nreconcile(total)\n```\nDone",
      isComplete: true,
    });
    expect(textAfterChatFile(text)).toBe("");
  });

  it("leaves code, chart and blueprint fences inline", () => {
    const text = "```python\nprint(1)\n```\n```chart\n{}\n```\n```blueprint\n{}\n```";
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
