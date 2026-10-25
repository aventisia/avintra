import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { FlowVersionNavLink } from "../FlowVersionNavLink";

const renderLink = (props: { to: string; draggable?: boolean }) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <FlowVersionNavLink flowName="Agent" flowVersionNumber="v1" {...props} />
    </MemoryRouter>,
  );

describe("FlowVersionNavLink draggable", () => {
  it("forwards draggable=false on the external anchor", () => {
    expect(renderLink({ to: "/studio/agent?f=1", draggable: false })).toContain(
      'draggable="false"',
    );
  });

  it("omits draggable on the external anchor when not passed", () => {
    expect(renderLink({ to: "/studio/agent?f=1" })).not.toContain("draggable");
  });

  it("forwards draggable=false on the router link", () => {
    expect(renderLink({ to: "/agents", draggable: false })).toContain('draggable="false"');
  });

  it("omits draggable on the router link when not passed", () => {
    expect(renderLink({ to: "/agents" })).not.toContain("draggable");
  });
});
