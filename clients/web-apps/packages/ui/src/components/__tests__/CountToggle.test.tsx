import { Archive } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CountToggle } from "../count-toggle/CountToggle";

const render = (props: { count: number; pressed: boolean }) =>
  renderToStaticMarkup(
    <CountToggle
      Icon={Archive}
      label="Archived"
      count={props.count}
      pressed={props.pressed}
      onPressedChange={() => undefined}
    />,
  );

describe("CountToggle", () => {
  it("disables an empty, unpressed toggle", () => {
    expect(render({ count: 0, pressed: false })).toContain('disabled=""');
  });

  it("keeps a pressed toggle enabled and exposes its state", () => {
    const html = render({ count: 0, pressed: true });

    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain('disabled=""');
  });
});
