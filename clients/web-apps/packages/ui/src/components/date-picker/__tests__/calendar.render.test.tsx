import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Calendar } from "../Calendar";

describe("Calendar render", () => {
  const range = { from: new Date(2026, 7, 1), to: new Date(2026, 7, 10) };

  it("renders range mode with default label header", () => {
    expect(() =>
      renderToStaticMarkup(<Calendar mode="range" selected={range} numberOfMonths={1} />),
    ).not.toThrow();
  });

  it("renders range mode with dropdowns header", () => {
    expect(() =>
      renderToStaticMarkup(
        <Calendar mode="range" selected={range} numberOfMonths={1} headerVariant="dropdowns" />,
      ),
    ).not.toThrow();
  });
});
