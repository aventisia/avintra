import { describe, expect, it } from "vitest";

import { buildFlowExportFileName } from "../flow-export-file-name.util";

describe("buildFlowExportFileName", () => {
  const exportedAt = new Date(2026, 10, 4, 9, 5, 7);

  it("adds the version and local timestamp", () => {
    expect(buildFlowExportFileName("Invoice bot", 3, exportedAt)).toBe(
      "Invoice bot_v3_2026-11-04_09-05-07.json",
    );
  });

  it("falls back to flow and skips a missing version", () => {
    expect(buildFlowExportFileName(undefined, 0, exportedAt)).toBe("flow_2026-11-04_09-05-07.json");
  });

  it("trims a name left with trailing space by the length cap", () => {
    expect(buildFlowExportFileName(`${"a".repeat(79)} b`, 1, exportedAt)).toBe(
      `${"a".repeat(79)}_v1_2026-11-04_09-05-07.json`,
    );
  });
});
