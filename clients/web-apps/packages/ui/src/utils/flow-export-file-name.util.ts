import { format } from "date-fns";

/**
 * File name for an exported flow: `<name>[_v<version>]_<local yyyy-MM-dd_HH-mm-ss>.json`.
 */
export const buildFlowExportFileName = (
  name: string | null | undefined,
  versionNumber?: number | null,
  exportedAt: Date = new Date(),
) => {
  const sanitized =
    (name || "flow")
      .replace(/[\\/:*?"<>|]/g, "_")
      .slice(0, 80)
      .trim() || "flow";
  const versionSuffix = versionNumber ? `_v${versionNumber}` : "";
  return `${sanitized}${versionSuffix}_${format(exportedAt, "yyyy-MM-dd_HH-mm-ss")}.json`;
};
