import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getHomeChatComposerPreferences,
  saveHomeChatComposerPreferences,
} from "../home-chat-model-preference.util";

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  } as unknown as Storage;
};

const useStorage = (storage: Storage) => vi.stubGlobal("window", { localStorage: storage });

afterEach(() => vi.unstubAllGlobals());

describe("home chat composer preferences", () => {
  it("starts from the legacy model key and no effort or web search", () => {
    const storage = createStorage();
    storage.setItem("home-chat-model:tenant:user@aventisia.com", "openai::gpt-5");
    useStorage(storage);

    expect(getHomeChatComposerPreferences("tenant", "user@aventisia.com")).toEqual({
      modelKey: "openai::gpt-5",
      effort: null,
      webSearch: false,
    });
  });

  it("round-trips the model, effort and web search", () => {
    useStorage(createStorage());
    const preferences = {
      modelKey: "anthropic::claude-opus-4-6",
      effort: "high",
      webSearch: true,
    } as const;

    saveHomeChatComposerPreferences("tenant", "user@aventisia.com", preferences);

    expect(getHomeChatComposerPreferences("tenant", "user@aventisia.com")).toEqual(preferences);
  });

  it("drops a stored effort the picker cannot show", () => {
    const storage = createStorage();
    useStorage(storage);
    storage.setItem(
      "home-chat-composer:tenant:user@aventisia.com",
      JSON.stringify({ modelKey: null, effort: "extreme", webSearch: false }),
    );

    expect(getHomeChatComposerPreferences("tenant", "user@aventisia.com")).toEqual({
      modelKey: null,
      effort: null,
      webSearch: false,
    });
  });

  it("falls back to empty preferences when storage holds invalid JSON", () => {
    const storage = createStorage();
    useStorage(storage);
    storage.setItem("home-chat-composer:tenant:user@aventisia.com", "{");

    expect(getHomeChatComposerPreferences("tenant", "user@aventisia.com")).toEqual({
      modelKey: null,
      effort: null,
      webSearch: false,
    });
  });
});
