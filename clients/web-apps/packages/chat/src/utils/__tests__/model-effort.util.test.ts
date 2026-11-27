import { describe, expect, it } from "vitest";

import { modelSupportsEffort } from "../model-effort.util";

describe("modelSupportsEffort", () => {
  it.each([
    "claude-opus-4-6",
    "claude-sonnet-4-6",
    "claude-opus-4-8",
    "claude-sonnet-5",
    "claude-fable-5",
    "claude-mythos-5",
    "claude-haiku-5-5",
    "claude-4.6-sonnet",
    "anthropic/claude-opus-4-7",
    "claude-opus-4-10",
    "Claude-Sonnet-4-6-20260101",
  ])("offers effort for the Claude model %s", (modelId) => {
    expect(modelSupportsEffort("anthropic", modelId)).toBe(true);
  });

  it.each([
    "claude-haiku-4-5",
    "claude-haiku-4-5-20251001",
    "claude-opus-4-5",
    "claude-3-7-sonnet",
    "gpt-5",
  ])("offers no effort for the anthropic model %s", (modelId) => {
    expect(modelSupportsEffort("anthropic", modelId)).toBe(false);
  });

  it("offers no effort for a Claude model reached through another provider", () => {
    expect(modelSupportsEffort("openrouter", "claude-opus-4-8")).toBe(false);
  });

  it("keeps the OpenAI reasoning rule", () => {
    expect(modelSupportsEffort("openai", "gpt-5")).toBe(true);
    expect(modelSupportsEffort("openai", "o3")).toBe(true);
    expect(modelSupportsEffort("openai", "gpt-4o-mini")).toBe(false);
    expect(modelSupportsEffort("openai", "gpt-5-chat")).toBe(false);
  });
});
