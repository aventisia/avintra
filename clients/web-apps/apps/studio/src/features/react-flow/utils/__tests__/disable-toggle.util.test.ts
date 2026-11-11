import { describe, expect, it } from "vitest";

import { isTogglableType, resolveTargetIds, shouldDisableTargets } from "../disable-toggle.util";

describe("isTogglableType", () => {
  it("bans structural node types", () => {
    expect(isTogglableType("triggerNode")).toBe(false);
    expect(isTogglableType("modelNode")).toBe(false);
  });

  it("allows normal node types", () => {
    expect(isTogglableType("aiNode")).toBe(true);
    expect(isTogglableType(undefined)).toBe(true);
  });
});

describe("resolveTargetIds", () => {
  it("uses the canvas selection when the right-clicked node is part of it", () => {
    expect(resolveTargetIds(["a", "b"], "a")).toEqual(["a", "b"]);
    expect(resolveTargetIds(["a", "b"], undefined)).toEqual(["a", "b"]);
  });

  it("uses only the right-clicked node when it is outside the selection", () => {
    expect(resolveTargetIds(["a", "b"], "c")).toEqual(["c"]);
    expect(resolveTargetIds([], "c")).toEqual(["c"]);
  });

  it("returns nothing without a selection or right-clicked node", () => {
    expect(resolveTargetIds([], undefined)).toEqual([]);
  });
});

describe("shouldDisableTargets", () => {
  it("disables when any target is enabled", () => {
    expect(shouldDisableTargets(["a", "b"], (id) => id === "a")).toBe(true);
  });

  it("enables only when every target is already disabled", () => {
    expect(shouldDisableTargets(["a", "b"], () => true)).toBe(false);
  });
});
