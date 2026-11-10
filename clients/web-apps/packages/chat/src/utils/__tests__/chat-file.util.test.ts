import { describe, expect, it } from "vitest";

import { findChatFile, textAfterChatFile, textBeforeChatFile } from "../chat-file.util";

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
