import { describe, expect, it } from "vitest";

import { toSpeechText } from "../speech-text.util";

describe("toSpeechText", () => {
  it("drops markdown markers and keeps link text", () => {
    expect(
      toSpeechText("## Plan\n\n- **Ship** the [release notes](https://x.io) `today`\n> quoted"),
    ).toBe("Plan\n\nShip the release notes today\nquoted");
  });

  it("names a code block instead of reading it", () => {
    expect(toSpeechText("Run this:\n```bash\nnpm ci\n```\nThen test.")).toBe(
      "Run this:\nCode block.\nThen test.",
    );
  });

  it("names the file instead of reading its body", () => {
    expect(
      toSpeechText("Here it is.\n\n```svg\n<svg><title>Intake flow</title></svg>\n```\n\nEnjoy."),
    ).toBe("Here it is.\n\nFile Intake flow.svg.\n\nEnjoy.");
  });

  it("never leaves a stray tag opener in the spoken text", () => {
    expect(toSpeechText("a <script and b")).toBe("a script and b");
  });

  it("reads table cells as phrases", () => {
    expect(toSpeechText("| A | B |\n|---|---|\n| 1 | 2 |")).toBe("A, B\n1, 2");
  });
});
