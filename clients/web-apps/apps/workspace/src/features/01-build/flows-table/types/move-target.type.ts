import { FolderSummary } from "./folder-summary.type";

/**
 * A destination offered by the Move agent dialog.
 */
export type MoveTarget =
  { kind: "root" } | { kind: "folder"; summary: FolderSummary } | { kind: "create"; name: string };
