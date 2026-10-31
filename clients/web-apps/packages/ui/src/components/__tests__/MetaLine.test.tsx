import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MetaLine } from "../meta-line/MetaLine";

describe("MetaLine", () => {
  it("renders non-empty items separated by dots", () => {
    const html = renderToStaticMarkup(<MetaLine items={["One", null, "Two"]} />);

    expect(html).toContain("One");
    expect(html).toContain("Two");
    expect(html.match(/rounded-full bg-fill/g)).toHaveLength(1);
  });

  it("renders nothing when every item is empty", () => {
    const html = renderToStaticMarkup(<MetaLine items={[null, false, ""]} />);

    expect(html).not.toContain("rounded-full");
  });
});
