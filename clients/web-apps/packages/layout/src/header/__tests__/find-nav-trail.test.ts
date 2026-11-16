import { describe, expect, it } from "vitest";

import { findNavTrail } from "../find-nav-trail";

const Icon = () => null;
const sections = [
  {
    sectionName: "Configure",
    menuItems: [
      { Icon, name: "Queues", route: "/queues" },
      {
        Icon,
        name: "Triggers",
        route: "/configure/triggers",
        subMenuItems: [{ name: "Time", route: "/configure/triggers/time" }],
      },
    ],
  },
];

describe("findNavTrail", () => {
  it("returns section and item for an item route and its detail pages", () => {
    const expected = [{ name: "Configure" }, { name: "Queues", route: "/queues" }];
    expect(findNavTrail(sections, "/queues")).toEqual(expected);
    expect(findNavTrail(sections, "/queues/42")).toEqual(expected);
  });

  it("prefers the most specific sub item", () => {
    expect(findNavTrail(sections, "/configure/triggers/time").map((c) => c.name)).toEqual([
      "Configure",
      "Triggers",
      "Time",
    ]);
  });

  it("does not match a route that only shares a prefix", () => {
    expect(findNavTrail(sections, "/queuesx")).toEqual([]);
  });
});
