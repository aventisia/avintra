import { describe, expect, it } from "vitest";

import { parseChartSpec } from "../chart-spec.util";

describe("parseChartSpec", () => {
  it("reads a complete spec", () => {
    const spec = parseChartSpec(
      '{"type":"bar","title":"Spend","x":"month","series":["spend"],"data":[{"month":"Jan","spend":4}]}',
    );
    expect(spec).toEqual({
      type: "bar",
      title: "Spend",
      x: "month",
      series: ["spend"],
      data: [{ month: "Jan", spend: 4 }],
    });
  });

  it("returns null for a fence still streaming or with an unknown type", () => {
    expect(parseChartSpec('{"type":"bar","x":"month","series":["sp')).toBeNull();
    expect(
      parseChartSpec('{"type":"radar","x":"a","series":["b"],"data":[{"a":1,"b":2}]}'),
    ).toBeNull();
  });

  it("keeps one series for a pie", () => {
    const spec = parseChartSpec(
      '{"type":"pie","x":"team","series":["a","b"],"data":[{"team":"Ops","a":1,"b":2}]}',
    );
    expect(spec?.series).toEqual(["a"]);
  });
});
