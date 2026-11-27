import { describe, expect, it } from "vitest";

import type { ChatArtifactDto } from "../../dtos/chat-artifact.dto";
import { latestArtifacts } from "../workspace-chat-artifact-filter.util";

const version = (id: string, versionNumber: number) =>
  ({
    id,
    conversationId: "c1",
    name: "report.md",
    versionNumber,
    createdOn: `2026-11-24T00:00:0${versionNumber}Z`,
  }) as ChatArtifactDto;

describe("latestArtifacts", () => {
  it("keeps the newest version of each file", () => {
    expect(latestArtifacts([version("v1", 1), version("v2", 2)]).map((a) => a.id)).toEqual(["v2"]);
  });

  it("falls back to the previous version when the newest is being deleted", () => {
    const rows = latestArtifacts([version("v2", 2), version("v3", 3)], new Set(["v3"]));

    expect(rows.map((a) => a.id)).toEqual(["v2"]);
  });

  it("drops every file of a chat being deleted", () => {
    expect(latestArtifacts([version("v1", 1), version("v2", 2)], new Set(["c1"]))).toEqual([]);
  });
});
