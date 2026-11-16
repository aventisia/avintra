import { describe, expect, it } from "vitest";

import { modelDisplayName } from "../model-name.util";

describe("modelDisplayName", () => {
  it("names Claude, Gemini and GPT models, dropping snapshot dates and the gemini/ prefix", () => {
    expect(modelDisplayName("claude-haiku-4-5")).toBe("Claude Haiku 4.5");
    expect(modelDisplayName("claude-haiku-4-5-20251001")).toBe("Claude Haiku 4.5");
    expect(modelDisplayName("claude-sonnet-5")).toBe("Claude Sonnet 5");
    expect(modelDisplayName("gemini/gemini-3.1-flash-lite")).toBe("Gemini 3.1 Flash Lite");
    expect(modelDisplayName("gpt-4.1-mini")).toBe("GPT-4.1 mini");
    expect(modelDisplayName("gpt-4.1")).toBe("GPT-4.1");
  });

  it("leaves other IDs as they are", () => {
    expect(modelDisplayName("deepseek/deepseek-r1")).toBe("deepseek/deepseek-r1");
    expect(modelDisplayName("gemini/gemini-embedding-001")).toBe("gemini/gemini-embedding-001");
  });
});
