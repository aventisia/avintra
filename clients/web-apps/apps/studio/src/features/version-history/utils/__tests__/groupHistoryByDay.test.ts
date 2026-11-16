import { describe, expect, it } from "vitest";

import { FlowVersionHistoryDto } from "../../dtos/agent-history-dto";
import { groupHistoryByDay } from "../groupHistoryByDay";

const history = (overrides: Partial<FlowVersionHistoryDto>): FlowVersionHistoryDto => ({
  id: "id",
  flowVersionId: "version",
  versionNumber: 1,
  flowId: "flow",
  flowName: "Agent",
  createdOn: "2026-11-10T10:00:00+00:00",
  lastModifiedOn: "2026-11-10T10:00:00+00:00",
  ...overrides,
});

const ids = (sections: ReturnType<typeof groupHistoryByDay>) =>
  sections.flatMap((section) => section.entries.map((entry) => entry.id));

describe("groupHistoryByDay", () => {
  it("orders entries by last modification, not creation", () => {
    const sections = groupHistoryByDay([
      history({
        id: "created-later",
        createdOn: "2026-11-15T10:00:00+00:00",
        lastModifiedOn: "2026-11-16T08:00:00+00:00",
      }),
      history({
        id: "edited-later",
        createdOn: "2026-11-10T10:00:00+00:00",
        lastModifiedOn: "2026-11-16T09:00:00+00:00",
      }),
    ]);

    expect(ids(sections)).toEqual(["edited-later", "created-later"]);
  });

  it("attributes the last modifier, falling back to the creator", () => {
    const sections = groupHistoryByDay([
      history({
        id: "both",
        createdBy: "Original Author",
        createdByUserInitials: "OA",
        lastModifiedBy: "Latest Editor",
        lastModifiedByUserInitials: "LE",
      }),
      history({ id: "never-edited", createdBy: "Original Author", createdByUserInitials: "OA" }),
    ]);

    const entries = sections.flatMap((section) => section.entries);
    expect(entries.find((entry) => entry.id === "both")?.user).toEqual({
      name: "Latest Editor",
      initials: "LE",
    });
    expect(entries.find((entry) => entry.id === "never-edited")?.user).toEqual({
      name: "Original Author",
      initials: "OA",
    });
  });

  it("falls back to creation time for payloads without last modification", () => {
    const sections = groupHistoryByDay([
      history({ id: "older", createdOn: "2026-11-10T10:00:00+00:00", lastModifiedOn: undefined }),
      history({ id: "newer", createdOn: "2026-11-15T10:00:00+00:00", lastModifiedOn: undefined }),
    ]);

    expect(ids(sections)).toEqual(["newer", "older"]);
  });
});
