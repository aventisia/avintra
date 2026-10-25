import { describe, expect, it } from "vitest";

import { type TableCNFilterVariant } from "../types/table-cn.type";
import {
  isEmptyFilterValue,
  joinListValue,
  parseFilterParam,
  serializeFilterValue,
  splitListValue,
} from "../utils/table-cn-filter-value.util";

const OCT_1 = new Date(2026, 9, 1).getTime();
const OCT_23 = new Date(2026, 9, 23).getTime();

describe("list values", () => {
  it("round-trips items with commas, quotes, and outer spaces", () => {
    const values = ["plain", "a,b", 'say "hi"', " padded "];

    expect(splitListValue(joinListValue(values))).toEqual(values);
  });

  it("trims unquoted items", () => {
    expect(splitListValue(" a , b ")).toEqual(["a", "b"]);
  });
});

describe("isEmptyFilterValue", () => {
  it.each([undefined, null, "", [], [undefined, undefined], ["", ""]])(
    "treats %j as empty",
    (value) => expect(isEmptyFilterValue(value)).toBe(true),
  );

  it.each(["a", 0, [undefined, 5], ["x"]])("treats %j as a filter", (value) =>
    expect(isEmptyFilterValue(value)).toBe(false),
  );
});

describe("filter parameters", () => {
  it.each<[TableCNFilterVariant, unknown, string]>([
    ["text", "agent", "agent"],
    ["number", "42", "42"],
    ["date", OCT_23, "2026-10-23"],
    ["dateRange", [OCT_1, OCT_23], "2026-10-01,2026-10-23"],
    ["dateRange", [OCT_1, undefined], "2026-10-01,"],
    ["select", ["chat"], "chat"],
    ["multiSelect", ["chat", "a,b"], 'chat,"a,b"'],
  ])("%s value %j is written as %s and read back", (variant, value, param) => {
    expect(serializeFilterValue(variant, value)).toBe(param);
    expect(parseFilterParam(variant, param)).toEqual(value);
  });

  it.each<[TableCNFilterVariant, string]>([
    ["text", "  "],
    ["number", "abc"],
    ["date", "2026-02-30"],
    ["date", "yesterday"],
    ["dateRange", "nope,"],
    ["multiSelect", ","],
  ])("ignores an invalid %s parameter %j", (variant, param) => {
    expect(parseFilterParam(variant, param)).toBeUndefined();
  });

  it("writes nothing for empty filters", () => {
    expect(serializeFilterValue("multiSelect", [])).toBeUndefined();
    expect(serializeFilterValue("dateRange", [undefined, undefined])).toBeUndefined();
  });
});
