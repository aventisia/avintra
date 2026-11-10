import { describe, expect, it } from "vitest";

import { loadCodeLanguage, tokenizeCode } from "../highlight-code.util";

describe("highlight-code", () => {
  it("colors code with light and dark variables once its language loads", async () => {
    expect(tokenizeCode("const a = 1;", "ts")).toBeNull();

    expect(await loadCodeLanguage("ts")).toBe(true);
    const lines = tokenizeCode("const a = 1;\nexport {};", "ts");

    expect(lines).toHaveLength(2);
    const keyword = lines?.[0]?.find((token) => token.content === "const");
    expect(keyword?.htmlStyle).toEqual(
      expect.objectContaining({
        "--shiki-light": expect.any(String),
        "--shiki-dark": expect.any(String),
      }),
    );
  });

  it("leaves unknown languages plain", async () => {
    expect(await loadCodeLanguage("toString")).toBe(false);
    expect(await loadCodeLanguage("not-a-language")).toBe(false);
    expect(tokenizeCode("x", "not-a-language")).toBeNull();
  });
});
