import { describe, expect, it } from "vitest";

import { modelSupportsWebSearch } from "../model-web-search.util";

describe("modelSupportsWebSearch", () => {
  it.each([
    ["anthropic", "claude-sonnet-5-5", true],
    ["anthropic", "claude-opus-4-6", true],
    ["anthropic", "claude-fable-5", true],
    ["anthropic", "claude-3-haiku", false],
    ["openai", "gpt-5", true],
    ["openai", "gpt-4.1", true],
    ["openai", "gpt-4o-mini", true],
    ["openai", "o3", true],
    ["openai", "gpt-4.1-nano", false],
    ["openai", "gpt-5-chat-latest", false],
    ["googlegemini", "gemini-2.5-pro", false],
    ["openrouter", "anthropic/claude-sonnet-4-6", false],
  ])("%s %s → %s", (provider, modelId, expected) => {
    expect(modelSupportsWebSearch(provider, modelId)).toBe(expected);
  });
});
