import { describe, expect, it } from "vitest";

import { findDestination, parseBlueprint, pickReachablePrompts } from "../chat-intent.util";

const destinations = [
  { route: "/configure/queues", label: "Queues", section: "Configure" },
  { route: "/tenant/users", label: "Users", section: "Tenant admin" },
];

describe("findDestination", () => {
  it("returns the page the call names", () => {
    expect(findDestination({ route: "/tenant/users" }, destinations)?.label).toBe("Users");
  });

  it("ignores routes the user can't open and malformed args", () => {
    expect(findDestination({ route: "/sa/tenants" }, destinations)).toBeNull();
    expect(findDestination({ route: "https://evil.example" }, destinations)).toBeNull();
    expect(findDestination("/tenant/users", destinations)).toBeNull();
    expect(findDestination(undefined, destinations)).toBeNull();
  });
});

describe("parseBlueprint", () => {
  it("keeps the title, summary and well-formed steps", () => {
    expect(
      parseBlueprint({
        title: " Invoice intake ",
        summary: "",
        steps: [{ title: "Watch inbox", detail: "Shared mailbox" }, { detail: "no title" }, "junk"],
      }),
    ).toEqual({
      title: "Invoice intake",
      summary: undefined,
      steps: [{ title: "Watch inbox", detail: "Shared mailbox" }],
    });
  });

  it("returns null without a title or any step", () => {
    expect(parseBlueprint({ title: "Empty", steps: [] })).toBeNull();
    expect(parseBlueprint({ steps: [{ title: "Step" }] })).toBeNull();
    expect(parseBlueprint(null)).toBeNull();
  });
});

describe("pickReachablePrompts", () => {
  it("keeps only prompts for pages the user can open", () => {
    expect(
      pickReachablePrompts(
        [
          { prompt: "Add a user", route: "/tenant/users" },
          { prompt: "List tenants", route: "/sa/tenants" },
        ],
        destinations,
      ),
    ).toEqual(["Add a user"]);
  });
});
