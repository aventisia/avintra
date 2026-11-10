import { describe, expect, it } from "vitest";

import { resolveRolloutFlag } from "../resolve-rollout-flag.util";

const createStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
};

describe("resolveRolloutFlag", () => {
  it("uses the build default when nothing overrides it", () => {
    const storage = createStorage();
    expect(
      resolveRolloutFlag({
        envValue: "true",
        search: "",
        param: "homeChat",
        getStorage: () => storage,
      }),
    ).toBe(true);
    expect(
      resolveRolloutFlag({
        envValue: undefined,
        search: "",
        param: "homeChat",
        getStorage: () => storage,
      }),
    ).toBe(false);
  });

  it("lets the query override the default and remembers it", () => {
    const storage = createStorage();
    expect(
      resolveRolloutFlag({
        envValue: "false",
        search: "?homeChat=1",
        param: "homeChat",
        getStorage: () => storage,
      }),
    ).toBe(true);
    expect(
      resolveRolloutFlag({
        envValue: "false",
        search: "",
        param: "homeChat",
        getStorage: () => storage,
      }),
    ).toBe(true);
  });

  it("turns the flag off with 0 and ignores other values", () => {
    const storage = createStorage({ "rollout:homeChat": "1" });
    expect(
      resolveRolloutFlag({
        envValue: "true",
        search: "?homeChat=yes",
        param: "homeChat",
        getStorage: () => storage,
      }),
    ).toBe(true);
    expect(
      resolveRolloutFlag({
        envValue: "true",
        search: "?homeChat=0",
        param: "homeChat",
        getStorage: () => storage,
      }),
    ).toBe(false);
    expect(storage.values.get("rollout:homeChat")).toBe("0");
  });

  it("still honours the query when storage is blocked", () => {
    const getStorage = () => {
      throw new Error("SecurityError");
    };
    expect(
      resolveRolloutFlag({
        envValue: "false",
        search: "?homeChat=1",
        param: "homeChat",
        getStorage,
      }),
    ).toBe(true);
    expect(
      resolveRolloutFlag({ envValue: "true", search: "", param: "homeChat", getStorage }),
    ).toBe(true);
  });
});
