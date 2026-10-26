import { afterEach, describe, expect, it } from "vitest";

import { applyBrandingToDocument } from "@/ui/components/branding/apply-branding";

import { isSafeBrandColor, pickReadableForeground } from "../branding-color-util";

const HSL_VALUES = [
  "hsl(120, 50%, 50%)",
  "hsla(120, 50%, 50%, 0.5)",
  "hsl(120deg, 50%, 50%)",
  "hsl(120grad, 50%, 50%)",
  "hsl(120rad, 50%, 50%)",
  "hsl(0.5turn, 50%, 50%)",
];

const REJECTED_VALUES = [
  ...HSL_VALUES,
  "rgb(300, 0, 0)",
  "rgb(-1, 0, 0)",
  "rgb(100%, 0%, 0%)",
  "rgb(1 2 3)",
  "rgb(1, 2, 3 / 50%)",
  "rgba(1, 2, 3, 2)",
  "rgb(1, 2, 3, 0.5)",
  "#fffff",
  "#gggggg",
  "blue",
];

describe("isSafeBrandColor", () => {
  it.each([
    "#fff",
    "#ffff",
    "#ffffff",
    "#FFFFFFFF",
    "rgb(0,0,0)",
    "rgb(255, 255, 255)",
    "rgb(12,34,56)",
    "rgba(1,2,3,0)",
    "rgba(1,2,3,0.5)",
    "rgba(1, 2, 3, .25)",
    "rgba(1,2,3,1.0)",
  ])("accepts %s", (value) => {
    expect(isSafeBrandColor(value)).toBe(true);
  });

  it.each(REJECTED_VALUES)("rejects %s", (value) => {
    expect(isSafeBrandColor(value)).toBe(false);
  });
});

describe("pickReadableForeground", () => {
  it("derives a readable foreground for an accepted colour", () => {
    expect(pickReadableForeground("#ffffff")).toBe("#111827");
    expect(pickReadableForeground("rgb(0, 0, 0)")).toBe("#ffffff");
  });

  it("falls back to white for a value the grammar rejects", () => {
    expect(pickReadableForeground("hsl(120, 50%, 50%)")).toBe("#ffffff");
  });
});

describe("applyBrandingToDocument", () => {
  afterEach(() => {
    delete (globalThis as { document?: unknown }).document;
  });

  it("skips only the rejected property and keeps the sibling colour", () => {
    const applied: Array<[string, string]> = [];
    (globalThis as { document?: unknown }).document = {
      documentElement: {
        style: {
          setProperty: (name: string, value: string) => {
            applied.push([name, value]);
          },
        },
      },
      querySelectorAll: () => [],
      title: "",
    };

    applyBrandingToDocument({ background: "#123456", primary: "hsl(120, 50%, 50%)" });

    expect(applied).toEqual([["--background", "#123456"]]);
  });
});
